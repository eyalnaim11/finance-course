// content/course.js : course structure: parts + full lesson list.
// Lesson display number = position in `lessons` (1..N). Slugs are stable ids:
// inserting a lesson later must not break saved progress for existing slugs.
//
// Pilot: only these 5 slugs will get real content files first (added later by
// another agent as content/lessons/<slug>.js with a default export matching
// the schema in SPEC.md §4). Until a lesson's content file exists, its status
// here MUST stay 'soon'. Flipping status to 'ready' is the only other step
// needed once the file is added.
//
// Order below is the home-card order ("פתחת עוסק פטור? מה עושים עכשיו"):
// what matters right after opening an עוסק פטור comes first.
export const PILOT_SLUGS = [
  'osek-patur',
  'small-business-owner',
  'national-insurance',
  'opening-business',
  'osek-murshe',
];

export const parts = [
  { key: 'a', letter: 'א', name: 'כסף אישי ובנק' },
  { key: 'b', letter: 'ב', name: 'עבודה כשכיר' },
  { key: 'c', letter: 'ג', name: 'העסק שלי' },
  { key: 'd', letter: 'ד', name: 'מס הכנסה וביטוח לאומי' },
  { key: 'e', letter: 'ה', name: 'מסמכים מול המדינה' },
  { key: 'f', letter: 'ו', name: 'אבטחה והונאות' },
  { key: 'g', letter: 'ז', name: 'חיסכון והשקעות' },
  { key: 'h', letter: 'ח', name: 'מערכת הכסף שלי' },
];

// status is always 'soon' right now. When a content file for a slug exists,
// change ONLY that lesson's status to 'ready'.
export const lessons = [
  { slug: 'bank-account', title: 'איך חשבון בנק עובד', part: 'a', status: 'ready' },
  { slug: 'payment-methods', title: 'כרטיסים ואמצעי תשלום', part: 'a', status: 'ready' },
  { slug: 'fees', title: 'עמלות', part: 'a', status: 'ready' },
  { slug: 'interest-credit', title: 'ריבית ואשראי', part: 'a', status: 'ready' },
  { slug: 'budget', title: 'תקציב אישי', part: 'a', status: 'ready' },

  { slug: 'payslip', title: 'איך תלוש שכר עובד', part: 'b', status: 'ready' },
  { slug: 'youth-rights', title: 'זכויות בני נוער בעבודה', part: 'b', status: 'ready' },
  { slug: 'form-101', title: 'טופס 101', part: 'b', status: 'ready' },
  { slug: 'form-106', title: 'טופס 106 והחזרי מס', part: 'b', status: 'ready' },

  { slug: 'money-flow', title: 'איך כסף זז בעסק', part: 'c', status: 'ready' },
  { slug: 'turnover-profit', title: 'מחזור, הכנסה ורווח', part: 'c', status: 'ready' },
  { slug: 'store-bookkeeping', title: 'הנהלת הכספים של החנות', part: 'c', status: 'ready' },
  { slug: 'business-expenses', title: 'הוצאות עסקיות', part: 'c', status: 'ready' },
  { slug: 'osek-patur', title: 'עוסק פטור', part: 'c', status: 'ready' },
  { slug: 'osek-murshe', title: 'עוסק מורשה', part: 'c', status: 'ready' },
  { slug: 'small-business-owner', title: 'בעל עסק זעיר', part: 'c', status: 'ready' },
  { slug: 'invoices-receipts', title: 'חשבוניות וקבלות', part: 'c', status: 'ready' },
  { slug: 'israel-invoices', title: 'חשבוניות ישראל', part: 'c', status: 'ready' },
  { slug: 'israel-vs-abroad', title: 'מכירות לישראל מול חו״ל', part: 'c', status: 'ready' },
  { slug: 'fx', title: 'מט״ח', part: 'c', status: 'ready' },
  { slug: 'refunds-chargebacks', title: 'החזרים וחיובים חוזרים', part: 'c', status: 'ready' },
  { slug: 'cash-flow', title: 'תזרים מזומנים', part: 'c', status: 'ready' },

  { slug: 'income-tax', title: 'מס הכנסה', part: 'd', status: 'ready' },
  { slug: 'national-insurance', title: 'ביטוח לאומי', part: 'd', status: 'ready' },
  { slug: 'vat', title: 'מע״מ', part: 'd', status: 'ready' },

  { slug: 'opening-business', title: 'פתיחת עסק', part: 'e', status: 'ready' },
  { slug: 'annual-report', title: 'דוח שנתי ומקדמות', part: 'e', status: 'ready' },
  { slug: 'documents', title: 'שמירת מסמכים', part: 'e', status: 'ready' },

  { slug: 'protect-money', title: 'הגנה על כסף', part: 'f', status: 'ready' },
  { slug: 'privacy', title: 'פרטיות', part: 'f', status: 'ready' },
  { slug: 'business-fraud', title: 'הונאות בעסק', part: 'f', status: 'ready' },

  { slug: 'saving', title: 'חיסכון', part: 'g', status: 'ready' },
  { slug: 'investing', title: 'השקעות בסיסיות', part: 'g', status: 'ready' },
  { slug: 'compound-inflation', title: 'ריבית דריבית ואינפלציה', part: 'g', status: 'ready' },

  { slug: 'split-money', title: 'איך לחלק כסף', part: 'h', status: 'ready' },
  { slug: 'separate-money', title: 'הפרדת כסף אישי ועסקי', part: 'h', status: 'ready' },
  { slug: 'monthly-tracking', title: 'מעקב חודשי', part: 'h', status: 'ready' },
  { slug: 'yearly-review', title: 'סיכום שנתי', part: 'h', status: 'ready' },
];

export function lessonNumber(slug) {
  const i = lessons.findIndex((l) => l.slug === slug);
  return i === -1 ? null : i + 1;
}

export function getLesson(slug) {
  return lessons.find((l) => l.slug === slug) || null;
}

export function lessonsInPart(partKey) {
  return lessons.filter((l) => l.part === partKey);
}

export function getPart(partKey) {
  return parts.find((p) => p.key === partKey) || null;
}

export function readyLessons() {
  return lessons.filter((l) => l.status === 'ready');
}

// pilot lessons in the fixed display order for the "דחוף לך עכשיו" card
export function pilotLessons() {
  return PILOT_SLUGS.map((slug) => getLesson(slug)).filter(Boolean);
}
