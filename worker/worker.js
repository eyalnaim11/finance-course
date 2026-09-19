// worker/worker.js : Cloudflare Worker proxy for the AI helper
// (js/ai-helper.js). Holds the Gemini key so the site itself never does.
// Plain ES module worker, no dependencies, deployed manually (see README.md
// in this folder). Contains NO secrets: GEMINI_KEY and OWNER_CODE are read
// from env at runtime (set them as encrypted variables in the dashboard).
//
// Request:  POST { question, passages:[{slug,lessonTitle,text}], dashboard, history }
//           header x-owner-code (optional)
// Response: { answer, lessons:[slug,...], remaining } on success
//           { error } with a non-200 status on any failure (the client falls
//           back to showing the passages it already sent, unread)

const VISITOR_LIMIT = 20; // questions/day/visitor (approved decision 3)
const GLOBAL_LIMIT = 300; // questions/day, all visitors together
const KV_TTL_SECONDS = 172800; // ~2 days: only needs to outlive one UTC day

const SYSTEM_INSTRUCTION = `אתה עוזר לימוד באפליקציית הקורס "כסף מגיל 16". התלמיד הוא נער בישראל שלומד כסף עסק ומסים.

כללים קשיחים:
1. אתה עונה אך ורק על סמך הקטעים מהקורס שמופיעים בהודעה של המשתמש תחת "קטעים מהקורס". אסור להשתמש בידע כללי חיצוני ואסור להמציא עובדות שלא כתובות שם.
2. אם התשובה לא נמצאת בקטעים תגיד את זה בפירוש ותציע לבדוק ברשות המסים או אצל רואה חשבון. אל תנחש.
3. אף פעם אל תמציא מספר. אם צריך מספר הוא חייב להופיע מילולית בקטעים.
4. אל תיתן ייעוץ מס אישי או ייעוץ משפטי אישי. זה חומר לימוד כללי בלבד ולא תחליף לאיש מקצוע.
5. אם יש נתוני דשבורד בהודעה אפשר להשתמש בהם רק כדי להסביר את הרעיון הכללי מהקטעים על המספרים של התלמיד עצמו. גם הם לא תחליף לייעוץ מקצועי.
6. כתוב תשובה של 3 עד 4 משפטים קצרים בעברית פשוטה ויומיומית שנער בגיל 16 מבין בקריאה ראשונה. בלי פסיקים בתוך התשובה. בלי מקף מפריד ובלי אימוג׳י.
7. בסוף תחזיר רשימה של הסלאגים (slug) של השיעורים שבאמת השתמשת בהם. אם לא השתמשת באף קטע תחזיר רשימה ריקה.

תמיד תחזיר אובייקט JSON יחיד ותקין בפורמט הבא בדיוק, בלי שום טקסט לפני או אחרי:
{"answer": "טקסט התשובה כאן", "lessons": ["slug-אחד", "slug-שני"]}`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    answer: { type: 'STRING' },
    lessons: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['answer', 'lessons'],
};

function jsonResponse(obj, status, extraHeaders) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
  });
}

function buildCorsHeaders(origin, allowedOrigin) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-owner-code',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  if (allowedOrigin && origin === allowedOrigin) headers['Access-Control-Allow-Origin'] = allowedOrigin;
  return headers;
}

function sanitizePassage(p) {
  if (!p || typeof p !== 'object') return null;
  const text = typeof p.text === 'string' ? p.text.slice(0, 700) : '';
  if (!text) return null;
  return {
    slug: typeof p.slug === 'string' ? p.slug.slice(0, 80) : '',
    lessonTitle: typeof p.lessonTitle === 'string' ? p.lessonTitle.slice(0, 200) : '',
    text,
  };
}

// last few turns of chat history -> Gemini's `contents` shape. Gemini uses
// role 'model' for its own turns, not 'assistant'.
function historyToContents(history) {
  return (history || [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-4)
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content.trim().slice(0, 800) }] }));
}

function buildContextText(passages, dashboard, question) {
  const passagesText = passages.length
    ? passages.map((p, i) => `קטע ${i + 1} מתוך שיעור "${p.lessonTitle}" (slug ${p.slug}):\n${p.text}`).join('\n\n')
    : '';
  const parts = [];
  parts.push(
    passagesText
      ? `קטעים מהקורס:\n\n${passagesText}`
      : 'לא נמצאו קטעים מתאימים מהקורס לשאלה הזאת. תגיד לתלמיד שזה לא מכוסה בקורס.'
  );
  if (dashboard) {
    parts.push(
      `נתוני דשבורד של התלמיד. אפשר שהם נתוני דוגמה ואפשר שהם נתונים אמיתיים. להשתמש בהם רק אם ממש רלוונטי לשאלה:\n${JSON.stringify(dashboard)}`
    );
  }
  parts.push(`שאלת התלמיד: ${question}`);
  return parts.join('\n\n');
}

function extractText(geminiData) {
  try {
    return geminiData.candidates[0].content.parts.map((p) => p.text || '').join('');
  } catch (e) {
    return '';
  }
}

// defensive JSON parse: the model is asked for strict JSON (and given a
// responseSchema) but a stray code fence or leading/trailing text is still
// handled instead of failing the whole request.
function parseModelJSON(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
}

export default {
  async fetch(request, env, ctx) {
    const allowedOrigin = env.ALLOWED_ORIGIN || '';
    const origin = request.headers.get('Origin') || '';
    const cors = buildCorsHeaders(origin, allowedOrigin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'שיטה לא נתמכת.' }, 405, cors);
    }
    if (!allowedOrigin || origin !== allowedOrigin) {
      return jsonResponse({ error: 'המקור לא מורשה.' }, 403, cors);
    }
    if (!env.GEMINI_KEY) {
      return jsonResponse({ error: 'השירות לא מוגדר עדיין. חסר מפתח.' }, 500, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return jsonResponse({ error: 'בקשה לא תקינה.' }, 400, cors);
    }

    const question = typeof body.question === 'string' ? body.question.trim().slice(0, 1000) : '';
    if (!question) {
      return jsonResponse({ error: 'חסרה שאלה.' }, 400, cors);
    }
    const passages = Array.isArray(body.passages) ? body.passages.slice(0, 5).map(sanitizePassage).filter(Boolean) : [];
    const dashboard = body.dashboard && typeof body.dashboard === 'object' ? body.dashboard : null;
    const history = Array.isArray(body.history) ? body.history : [];

    // ---- rate limiting (approved decision 3) ----
    const ownerCodeHeader = request.headers.get('x-owner-code') || '';
    const isOwner = !!(env.OWNER_CODE && ownerCodeHeader && ownerCodeHeader === env.OWNER_CODE);
    const today = new Date().toISOString().slice(0, 10); // UTC date, e.g. "2026-09-19"
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const visitorKey = `d:${today}:${ip}`;
    const totalKey = `d:${today}:total`;

    let visitorCount = 0;
    let totalCount = 0;
    let kvOk = true;
    try {
      const [v, t] = await Promise.all([env.RL.get(visitorKey), env.RL.get(totalKey)]);
      visitorCount = parseInt(v, 10) || 0;
      totalCount = parseInt(t, 10) || 0;
    } catch (e) {
      kvOk = false;
    }

    let remaining = null;
    if (!kvOk) {
      // can't verify the quota right now: fail closed for anonymous
      // visitors, let a valid owner code through anyway (it does not need a
      // count, only the global cap ever applies to it, and that check also
      // needs KV -- so an owner request just proceeds uncounted here).
      if (!isOwner) {
        return jsonResponse({ error: 'אי אפשר לבדוק כרגע את מכסת השאלות. אפשר לנסות שוב עוד רגע.' }, 503, cors);
      }
    } else {
      const globalOk = totalCount < GLOBAL_LIMIT;
      const visitorOk = isOwner || visitorCount < VISITOR_LIMIT;
      if (!globalOk || !visitorOk) {
        return jsonResponse({ error: 'עברת את מכסת השאלות להיום. אפשר לנסות שוב מחר.' }, 429, cors);
      }
      try {
        // simple read-then-write counters, not atomic under concurrent
        // requests. good enough at this traffic scale; worst case someone
        // sneaks in a request or two past the limit on the same day.
        await Promise.all([
          env.RL.put(visitorKey, String(visitorCount + 1), { expirationTtl: KV_TTL_SECONDS }),
          env.RL.put(totalKey, String(totalCount + 1), { expirationTtl: KV_TTL_SECONDS }),
        ]);
      } catch (e) {
        // counting failed after we already decided to allow this request:
        // let it through rather than punish the student for our write error.
      }
      remaining = isOwner ? null : Math.max(0, VISITOR_LIMIT - (visitorCount + 1));
    }

    // ---- build + call Gemini ----
    const model = env.MODEL || 'gemini-3.5-flash-lite';
    const geminiBody = {
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [...historyToContents(history), { role: 'user', parts: [{ text: buildContextText(passages, dashboard, question) }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2,
        maxOutputTokens: 500,
      },
    };

    let geminiRes;
    try {
      geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY },
        body: JSON.stringify(geminiBody),
      });
    } catch (e) {
      return jsonResponse({ error: 'שגיאת רשת מול המודל.' }, 502, cors);
    }
    if (!geminiRes.ok) {
      return jsonResponse({ error: 'המודל לא הצליח לענות כרגע.' }, 502, cors);
    }

    let geminiData;
    try {
      geminiData = await geminiRes.json();
    } catch (e) {
      return jsonResponse({ error: 'תשובה לא תקינה מהמודל.' }, 502, cors);
    }

    const parsed = parseModelJSON(extractText(geminiData));
    if (!parsed || typeof parsed.answer !== 'string' || !parsed.answer.trim()) {
      return jsonResponse({ error: 'לא התקבלה תשובה תקינה מהמודל.' }, 502, cors);
    }
    const lessons = Array.isArray(parsed.lessons) ? parsed.lessons.filter((s) => typeof s === 'string').slice(0, 5) : [];

    return jsonResponse({ answer: parsed.answer.trim().slice(0, 2000), lessons, remaining }, 200, cors);
  },
};
