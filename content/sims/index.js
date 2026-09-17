// content/sims/index.js : registry of all simulations (SPEC-EXTRAS.md §1.3)
// listed on #/sims. Each entry mirrors the matching content/sims/<id>.js file.
export const sims = [
  {
    id: 'first-payslip',
    title: 'התלוש הראשון',
    summary: 'עוברים שלב אחר שלב על תלוש השכר הראשון שלך ובודקים אם הכל תקין.',
    lessons: ['payslip', 'youth-rights'],
  },
  {
    id: 'store-first-month',
    title: 'החודש הראשון של החנות',
    summary: 'עוקבים אחרי הכסף של החודש הראשון בחנות ומבינים מה באמת נשאר לך כרווח.',
    lessons: ['money-flow', 'turnover-profit', 'store-bookkeeping'],
  },
  {
    id: 'customer-cancels',
    title: 'לקוח מבטל',
    summary: 'לקוח מבקש לבטל הזמנה ואתה מחליט לפי החוק מה מגיע לו.',
    lessons: ['refunds-chargebacks'],
  },
  {
    id: 'suspicious-message',
    title: 'הודעה חשודה',
    summary: 'מגיעות אליך הודעות חשודות ואתה בוחר איך להגיב נכון בכל פעם.',
    lessons: ['protect-money', 'business-fraud'],
  },
  {
    id: 'paying-in-dollars',
    title: 'תשלום בדולר',
    summary: 'משלמים לספק ולמודעות בדולר ובודקים כמה זה באמת עולה בשקלים.',
    lessons: ['fx', 'business-expenses'],
  },
  {
    id: 'near-the-ceiling',
    title: 'מתקרבים לתקרה',
    summary: 'עוקבים אחרי מחזור החנות במהלך השנה כדי לא לחצות בטעות את תקרת עוסק פטור.',
    lessons: ['osek-patur', 'yearly-review'],
  },
  {
    id: 'tax-year-end',
    title: 'סוף שנת מס',
    summary: 'מגיעים לסוף שנת המס ובודקים אילו מסמכים ותאריכים חשובים לא לפספס.',
    lessons: ['form-106', 'osek-patur', 'annual-report', 'documents'],
  },
  {
    id: 'month-of-money',
    title: 'חודש של כסף',
    summary: 'כסף נכנס מכמה כיוונים במהלך החודש ואתה מחליט איך לחלק אותו נכון.',
    lessons: ['split-money', 'cash-flow', 'saving'],
  },
];
