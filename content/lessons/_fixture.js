// content/lessons/_fixture.js : FIXTURE lesson, not a real course lesson.
// Purpose: exercise every stage, every block type (SPEC.md §4) and both video
// modes (embeddable true/false) so the app engine can be built and tested
// before real content exists. Not listed in content/course.js, so it never
// appears in menus, the home page, or the lesson list drawer. Reachable only
// by navigating directly to #/lesson/_fixture/<stage> (used by tests.html and
// the acceptance checks). "title" is not part of the real lesson schema
// (real lesson titles come from content/course.js). it exists here only
// because this lesson has no course.js entry to read a title from.
export default {
  slug: '_fixture',
  title: 'דוגמה: איך קוראים קבלה',
  checked: '2026-09-14',
  legalTopic: true,

  intro: {
    goal: 'בסוף השיעור הזה תדע מה כתוב על קבלה ולמה כדאי לשמור אותה.',
    whyYou: 'זה שיעור בדיקה בלבד, כדי לוודא שכל חלקי האתר עובדים כמו שצריך.',
    youWillKnow: [
      'מה ההבדל בין קבלה לחשבונית',
      'למה כדאי לשמור קבלות',
      'איך לקרוא קבלה מחנות אונליין',
    ],
  },

  lesson: [
    {
      t: 'section',
      key: 'simple',
      children: [
        {
          t: 'p',
          text: 'קבלה היא **מסמך שמראה שקיבלת תשלום**. לפעמים המחיר כולל [[term-vat|מע״מ]], ולפעמים לא. אפשר לקרוא עוד בעמוד הרשמי {{src:src-fixture-tax-authority}}.',
        },
        {
          t: 'list',
          ordered: false,
          items: [
            'קבלה מאשרת שהכסף התקבל',
            'קבלה יכולה להיות דיגיטלית או על נייר',
            'כל עסק חייב לתת קבלה כשמבקשים',
          ],
        },
      ],
    },
    {
      t: 'section',
      key: 'deep',
      children: [
        {
          t: 'p',
          text: 'קבלה וחשבונית נראות דומה, אבל הן לא אותו מסמך. **חשבונית** מפרטת מה נמכר ובאיזה מחיר, ו**קבלה** מאשרת שהתשלום התקבל.',
        },
        {
          t: 'law',
          text: 'בישראל, עסק צריך לתת ללקוח מסמך שמאשר תשלום. הכללים המדויקים תלויים בסוג העסק.',
          sources: ['src-fixture-tax-authority'],
          asOf: '2026',
        },
        {
          t: 'calc',
          title: 'כמה עודף להחזיר',
          inputs: [
            { id: 'price', label: 'מחיר המוצר', value: 38, suffix: '₪' },
            { id: 'paid', label: 'כמה הלקוח שילם', value: 50, suffix: '₪' },
          ],
          formula: 'paid - price',
          resultLabel: 'העודף להחזיר',
          explain: 'זה החישוב הבסיסי שכל קופאי עושה.',
        },
      ],
    },
    {
      t: 'section',
      key: 'life',
      children: [
        {
          t: 'example',
          children: [
            {
              t: 'p',
              text: 'קנית משהו בקיוסק ושילמת במזומן. המוכר נתן לך פתק קטן עם הסכום והתאריך. זו קבלה.',
            },
          ],
        },
        {
          t: 'warn',
          text: 'שימו לב: קבלה וחשבונית הם שני מסמכים שונים, גם אם הם נראים דומה.',
        },
      ],
    },
    {
      t: 'section',
      key: 'drop',
      children: [
        {
          t: 'receipt',
          title: 'קבלה לדוגמה מחנות אונליין',
          rows: [
            { label: 'המוצר', amount: 120 },
            { label: 'משלוח', amount: 15 },
            { label: 'הנחה', amount: -70 },
          ],
          total: { label: 'סך הכל', amount: 65 },
          note: 'הסכום כאן כולל מע״מ.',
        },
        {
          t: 'recommend',
          children: [
            {
              t: 'p',
              text: 'תמיד לשמור צילום של הקבלה בטלפון, למקרה שהיא תלך לאיבוד.',
            },
          ],
        },
      ],
    },
    {
      t: 'section',
      key: 'visual',
      children: [
        {
          t: 'table',
          caption: 'השוואה בין קבלה לחשבונית',
          head: ['מסמך', 'מי נותן אותו', 'יש עליו מע״מ'],
          rows: [
            ['קבלה', 'כל עסק', 'לא תמיד'],
            ['חשבונית', 'עוסק מורשה', 'כן, אם יש'],
          ],
          note: 'זו טבלה כללית להמחשה בלבד.',
        },
        {
          t: 'flow',
          steps: [
            { label: 'הלקוח משלם' },
            { label: 'הכסף מגיע לחשבון', sub: 'תוך יום או יומיים' },
            { label: 'נותנים קבלה' },
          ],
        },
      ],
    },
    {
      t: 'section',
      key: 'mistakes',
      children: [
        {
          t: 'compare',
          columns: [
            {
              title: 'טעות נפוצה',
              points: ['זורקים קבלות מיד אחרי הקנייה', 'לא בודקים מה כתוב עליהן'],
            },
            {
              title: 'מה עדיף לעשות',
              points: ['לשמור קבלות לפחות כמה חודשים', 'לבדוק שהסכום נכון'],
            },
          ],
        },
        {
          t: 'list',
          ordered: true,
          items: [
            'לבדוק שהסכום בקבלה נכון',
            'לצלם את הקבלה בטלפון',
            'לשמור אותה בתיקייה קבועה',
          ],
        },
        {
          t: 'pro',
          children: [
            {
              t: 'p',
              text: 'איך לשמור קבלות דיגיטליות בצורה שמקובלת על רואה חשבון.',
            },
          ],
        },
      ],
    },
  ],

  practice: {
    exercise: {
      title: 'תרגיל: לבדוק קבלה',
      prompt: [
        {
          t: 'p',
          text: 'קיבלת קבלה על מוצר שעלה 90 ₪ ומשלוח שעלה 20 ₪. כמה שילמת בסך הכל.',
        },
      ],
      solution: [
        {
          t: 'p',
          text: 'התשובה: 110 ₪. זה סכום המוצר בתוספת המשלוח.',
        },
      ],
    },
    thinking: {
      prompt: [
        {
          t: 'p',
          text: 'למה חשוב לשמור קבלות גם כשקונים דברים קטנים.',
        },
      ],
      hint: 'תחשוב מה קורה אם מוצר מתקלקל אחרי כמה שבועות.',
      solution: [
        {
          t: 'p',
          text: 'קבלה יכולה לעזור להחזיר מוצר, לקבל עליו אחריות, או להוכיח שקנית אותו.',
        },
      ],
    },
  },

  quiz: [
    {
      q: 'קבלה היא בעיקר...',
      options: [
        'מסמך שמאשר שקיבלת כסף',
        'אותו דבר בדיוק כמו חשבונית',
        'סוג של כרטיס אשראי',
        'מסמך שרק חנויות גדולות נותנות',
      ],
      correct: 0,
      explain: 'קבלה מאשרת תשלום. היא לא כרטיס, ולא זהה לחשבונית.',
    },
    {
      q: 'מה ההבדל העיקרי בין קבלה לחשבונית',
      options: [
        'אין שום הבדל',
        'חשבונית מפרטת מה נמכר, קבלה מאשרת שהתשלום התקבל',
        'קבלה היא רק לעסקים גדולים',
        'חשבונית היא רק דיגיטלית',
      ],
      correct: 1,
      explain: 'לכל אחת מהן תפקיד אחר, גם אם הן נראות דומה.',
    },
    {
      q: 'מע״מ הוא...',
      options: [
        'הנחה שנותנים ללקוח',
        'עמלה שהבנק גובה',
        'מס שמתווסף למחיר של מוצרים ושירותים',
        'סוג של קבלה',
      ],
      correct: 2,
      explain: 'מע״מ הוא מס שמתווסף למחיר. הוא לא הנחה ולא עמלת בנק.',
    },
    {
      q: 'לקוח שילם 50 ₪ על מוצר שעולה 38 ₪. כמה עודף צריך להחזיר לו',
      options: ['8 ₪', '12 ₪', '18 ₪', '88 ₪'],
      correct: 1,
      explain: '50 פחות 38 שווה 12 ₪ עודף.',
    },
    {
      q: 'למה כדאי לשמור קבלות גם על קניות קטנות',
      options: [
        'זה לא באמת חשוב',
        'רק כדי להראות לחברים',
        'זה יכול לעזור להחזיר מוצר או להוכיח הוצאה',
        'זה חובה לפי חוק התעבורה',
      ],
      correct: 2,
      explain: 'קבלה יכולה לשמש הוכחה לקנייה, גם על סכומים קטנים.',
    },
  ],

  finish: {
    remember: [
      'קבלה מאשרת שקיבלת תשלום',
      'קבלה זה לא אותו דבר כמו חשבונית',
      'כדאי לשמור קבלות, גם בצילום בטלפון',
    ],
    realTask: {
      title: 'המשימה האמיתית שלך',
      steps: [
        'תמצא קבלה אמיתית שקיבלת לאחרונה',
        'תבדוק אם כתוב עליה מע״מ',
        'תשמור ממנה צילום בטלפון',
      ],
    },
  },

  videos: [
    {
      title: 'איך קוראים קבלה בקצרה',
      channel: 'ערוץ לדוגמה',
      url: 'https://www.youtube.com/watch?v=fixture000001',
      duration: '2:10',
      why: 'הסבר ויזואלי קצר לפני שממשיכים לתרגול.',
      embeddable: false,
      summary: [
        {
          t: 'p',
          text: 'הסרטון מסביר את ההבדל בין קבלה לחשבונית ולמה חשוב לשמור אותן.',
        },
      ],
    },
    {
      // real, public, embeddable video used only to test the click-to-load
      // player. It is YouTube's own IFrame API demo, not course content.
      title: 'בדיקת נגן וידאו',
      channel: 'YouTube Developers',
      youtubeId: 'M7lc1UVf-VE',
      url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      duration: '3:31',
      why: 'משמש רק לבדיקת הנגן באתר. לא קשור לתוכן הקורס.',
      embeddable: true,
      summary: [],
    },
  ],

  sources: ['src-fixture-tax-authority', 'src-fixture-boi'],
  glossary: ['term-receipt', 'term-invoice', 'term-vat'],
};
