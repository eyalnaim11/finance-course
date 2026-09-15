// content/sources.js : source registry, grouped by organization on #/sources.
// Every entry below is a FIXTURE (fixture:true) used only to exercise the
// sources center and the {{src:id}} / law-block source chips while real
// lesson content does not exist yet. Real content agents will add real,
// verified sources here (and should remove the fixture ones once no lesson
// references them anymore).
import { FIXTURE_MODE } from '../js/fixture-mode.js';

export const sources = [
  {
    id: 'src-fixture-tax-authority',
    org: 'רשות המסים',
    title: 'דוגמה: עמוד הסבר על מע״מ (מקור לבדיקה בלבד)',
    url: 'https://www.gov.il/he/departments/topics/vat',
    publishedDate: '2025-01-01',
    checked: '2026-09-14',
    fixture: true,
  },
  {
    id: 'src-fixture-social-security',
    org: 'ביטוח לאומי',
    title: 'דוגמה: עמוד הסבר על דמי ביטוח (מקור לבדיקה בלבד)',
    url: 'https://www.btl.gov.il/',
    publishedDate: '2025-03-10',
    checked: '2026-09-14',
    fixture: true,
  },
  {
    id: 'src-fixture-boi',
    org: 'בנק ישראל',
    title: 'דוגמה: עמוד הסבר על עמלות בנק (מקור לבדיקה בלבד)',
    url: 'https://www.boi.org.il/',
    publishedDate: '2024-11-20',
    checked: '2026-09-14',
    fixture: true,
  },
  // ===== real content (merged from content/_incoming on 14.9.2026) =====
  {
    "id": "src-taxes-vat-amounts",
    "org": "רשות המסים",
    "title": "סכומים ושיעורים במע״מ",
    "url": "https://www.gov.il/he/pages/vat-rate-amount-new",
    "publishedDate": "2022-06-26",
    "updatedDate": "2026-07-01",
    "checked": "2026-09-14"
  },
  {
    "id": "src-taxes-new-dealer-guide",
    "org": "רשות המסים",
    "title": "מדריך לעוסק החדש (מע״מ)",
    "url": "https://www.gov.il/he/pages/vat-to-the-new-dealer",
    "publishedDate": "2024-01-01",
    "updatedDate": "2026-02-18",
    "checked": "2026-09-14"
  },
  {
    "id": "src-taxes-excluded-professions",
    "org": "רשות המסים",
    "title": "רשימת בעלי עסקים שצריכים להירשם כעוסק מורשה",
    "url": "https://www.gov.il/he/pages/infomation-page-200524",
    "publishedDate": "2024-05-20",
    "updatedDate": null,
    "checked": "2026-09-14"
  },
  {
    "id": "src-kolzchut-minor-business",
    "org": "כל-זכות",
    "title": "פתיחת עסק עצמאי לקטין",
    "url": "https://www.kolzchut.org.il/he/פתיחת_עסק_עצמאי_לקטין",
    "publishedDate": null,
    "updatedDate": "2026-08-19",
    "checked": "2026-09-14"
  },
  {
    "id": "src-nevo-vat-regulation-6d",
    "org": "נבו (מאגר חקיקה)",
    "title": "תקנות מס ערך מוסף (התשל״ו-1976) תקנה 6ד: יבוא שירותים מתושב חוץ",
    "url": "https://www.nevo.co.il/law_html/law01/271_005.htm",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-14"
  },
  {
    "id": "src-taxes-small-business-guide",
    "org": "רשות המסים",
    "title": "בעל עסק זעיר (מדריך)",
    "url": "https://www.gov.il/he/pages/small-business-owner-income-tax",
    "publishedDate": "2024-11-26",
    "updatedDate": null,
    "checked": "2026-09-14"
  },
  {
    "id": "src-taxes-small-business-faq",
    "org": "רשות המסים",
    "title": "שאלות ותשובות על רפורמת בעל עסק זעיר",
    "url": "https://www.gov.il/he/pages/faq-small-business-owner",
    "publishedDate": "2024-11-26",
    "updatedDate": "2026-02-24",
    "checked": "2026-09-14"
  },
  {
    "id": "src-nevo-income-tax-ordinance-ch8",
    "org": "נבו (מאגר חקיקה)",
    "title": "פקודת מס הכנסה פרק שמיני: בעל עסק זעיר (סעיפים 87א עד 87ז)",
    "url": "https://www.nevo.co.il/law_html/law00/84255.htm",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-14"
  },
  {
    "id": "src-taxes-small-business-pdf-analysis",
    "org": "רשות המסים",
    "title": "ניתוח נתונים ותובנות ומסקנות ראשוניות על בעל עסק זעיר",
    "url": "https://www.gov.il/BlobFolder/policy/income-tax-small-business-owner-24-210725/he/IncomeTax_procedures-210725-1.pdf",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-14"
  },
  {
    "id": "src-btl-self-employed-definition",
    "org": "המוסד לביטוח לאומי",
    "title": "עובד עצמאי - פירוט סוגי המעמד וחובת תשלום",
    "url": "https://www.btl.gov.il/Insurance/National%20Insurance/type_list/Self_Employed/Pages/default.aspx",
    "publishedDate": null,
    "updatedDate": "2026-01-01",
    "checked": "2026-09-14"
  },
  {
    "id": "src-btl-self-employed-rates",
    "org": "המוסד לביטוח לאומי",
    "title": "שיעורי דמי הביטוח - עובד עצמאי",
    "url": "https://www.btl.gov.il/Insurance/National%20Insurance/type_list/Self_Employed/Pages/rates.aspx",
    "publishedDate": null,
    "updatedDate": "2026-01-01",
    "checked": "2026-09-14"
  },
  {
    "id": "src-btl-health-who-pays",
    "org": "המוסד לביטוח לאומי",
    "title": "מי חייב בתשלום דמי ביטוח בריאות",
    "url": "https://www.btl.gov.il/Insurance/Health_Insurance/Pages/%D7%97%D7%95%D7%91%D7%AA%20%D7%AA%D7%A9%D7%9C%D7%95%D7%9D%20%D7%93%D7%9E%D7%99%20%D7%91%D7%99%D7%98%D7%95%D7%97%20%D7%91%D7%A8%D7%99%D7%90%D7%95%D7%AA.aspx",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-14"
  },
  {
    "id": "src-btl-health-faq-25",
    "org": "המוסד לביטוח לאומי",
    "title": "שאלות ותשובות - דמי ביטוח בריאות (שאלה 25)",
    "url": "https://www.btl.gov.il/About/faq/bituhachBriuut/Pages/sheela25.aspx",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-14"
  },
  {
    "id": "src-btl-register-self-employed",
    "org": "המוסד לביטוח לאומי",
    "title": "פתיחת תיק עצמאי בביטוח לאומי",
    "url": "https://www.btl.gov.il/Insurance/National%20Insurance/type_list/Self_Employed/Pages/howtoregister.aspx",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-14"
  },
  {
    "id": "src-btl-employed-and-self-employed",
    "org": "המוסד לביטוח לאומי",
    "title": "עובד שכיר וגם עובד עצמאי - פירוט סוגי המעמד וחובת תשלום",
    "url": "https://www.btl.gov.il/Insurance/National%20Insurance/type_list/%D7%A2%D7%95%D7%91%D7%93%20%D7%A9%D7%9B%D7%99%D7%A8%20%D7%95%D7%92%D7%9D%20%D7%A2%D7%95%D7%91%D7%93%20%D7%A2%D7%A6%D7%9E%D7%90%D7%99/Pages/default.aspx",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-14"
  },
  {
    "id": "src-btl-employee-rates",
    "org": "המוסד לביטוח לאומי",
    "title": "לעובדים שכירים - שיעורי וסכומי דמי ביטוח",
    "url": "https://www.btl.gov.il/Insurance/Rates/Pages/%D7%9C%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D%20%D7%A9%D7%9B%D7%99%D7%A8%D7%99%D7%9D.aspx",
    "publishedDate": null,
    "updatedDate": "2026-01-01",
    "checked": "2026-09-14"
  },
  {
    "id": "src-taxes-open-exempt-dealer-online",
    "org": "רשות המסים",
    "title": "בקשה לפתיחת תיק עוסק פטור באמצעות האינטרנט",
    "url": "https://www.gov.il/he/service/request-open-exempt-dealer-via-internet",
    "publishedDate": null,
    "updatedDate": "2026-01-18",
    "checked": "2026-09-14"
  },
  {
    "id": "src-taxes-income-tax-guide-open-business",
    "org": "רשות המסים",
    "title": "מדריך מס הכנסה לפתיחת עסק",
    "url": "https://www.gov.il/he/pages/income-tax-guide-open-business",
    "publishedDate": "2019-08-07",
    "updatedDate": "2026-03-11",
    "checked": "2026-09-14"
  },
  {
    "id": "src-taxes-form-101",
    "org": "רשות המסים",
    "title": "כרטיס עובד ובקשה להקלה ולתיאום מס על ידי המעביד (טופס 101)",
    "url": "https://www.gov.il/he/service/itc101",
    "publishedDate": null,
    "updatedDate": "2025-11-30",
    "checked": "2026-09-14"
  },
  {
    "id": "src-taxes-tax-coordination-online",
    "org": "רשות המסים",
    "title": "עריכת תיאום מס באופן מקוון",
    "url": "https://www.gov.il/he/service/tax-coordination-online",
    "publishedDate": null,
    "updatedDate": "2026-08-09",
    "checked": "2026-09-14"
  },
  {
    "id": "src-taxes-monthly-deductions-booklet-2026",
    "org": "רשות המסים",
    "title": "חוברת ניכויים חודשיים ממשכורת ומשכר עבודה לשנת המס 2026",
    "url": "https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-14"
  },
  {
    "id": "src-law-legal-capacity-guardianship",
    "org": "נבו (מאגר חקיקה)",
    "title": "חוק הכשרות המשפטית והאפוטרופסות תשכ\"ב-1962",
    "url": "https://www.nevo.co.il/law_html/law00/70325.htm",
    "publishedDate": null,
    "updatedDate": "2026-01-19",
    "checked": "2026-09-14"
  },
  {
    "id": "src-taxes-instruction-4-2026-minor-file",
    "org": "רשות המסים",
    "title": "הוראת ביצוע מס הכנסה מס' 4/2026 - פתיחת תיק לקטין במשרד השומה",
    "url": "https://www.gov.il/BlobFolder/policy/inst-4-2026/he/IncomeTax_inst-4-2026.pdf",
    "publishedDate": "2026-02-03",
    "updatedDate": null,
    "checked": "2026-09-14"
  },
  {
    "id": "src-boi-416-minors-accounts",
    "org": "בנק ישראל - המפקח על הבנקים",
    "title": "ניהול בנקאי תקין [6] (12/02) - הוראה 416, חשבונות קטינים",
    "url": "https://www.boi.org.il/media/d32dirqr/416.pdf",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-14"
  },
  {
    "id": "src-campus-il-financial-resilience",
    "org": "Campus IL (משרד העבודה)",
    "title": "התנהלות פיננסית: המפתח לחוסן כלכלי",
    "url": "https://campus.gov.il/course/labor-gov-finmng-he/",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-14"
  },
];

export function getSource(id) {
  return sources.find((s) => s.id === id) || null;
}

export function sourcesByOrg() {
  const map = new Map();
  for (const s of sources) {
    if (s.fixture && !FIXTURE_MODE) continue;
    if (!map.has(s.org)) map.set(s.org, []);
    map.get(s.org).push(s);
  }
  return map;
}
