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
    "title": "פקודת מס הכנסה (נוסח מלא)",
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
  {
    "id": "src-nevo-bookkeeping-instructions-1973",
    "org": "נבו (מאגר חקיקה)",
    "title": "הוראות מס הכנסה (ניהול פנקסי חשבונות), התשל״ג-1973",
    "url": "https://www.nevo.co.il/law_html/law01/255_179.htm",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-15"
  },
  {
    "id": "src-taxes-circular-24-2004",
    "org": "רשות המסים",
    "title": "חוזר מס הכנסה מס׳ 24/2004 - שינויים בהוראות ניהול ספרים - מסמכים ממוחשבים",
    "url": "https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-24-2004/he/Policy_IncomeTaxInst_hoz24-2004.pdf",
    "publishedDate": "2004-09-14",
    "updatedDate": null,
    "checked": "2026-09-15"
  },
  {
    "id": "src-taxes-computerized-bookkeeping-instructions",
    "org": "רשות המסים",
    "title": "הוראות ניהול ספרים בסביבה ממוחשבת",
    "url": "https://www.gov.il/BlobFolder/generalpage/hor-software-other/he/IncomeTax_IncomeTaxEmployersInfo_horaot_4_01.pdf",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-15"
  },
  {
    "id": "src-taxes-income-tax-ordinance-full",
    "org": "רשות המסים",
    "title": "פקודת מס הכנסה [נוסח חדש] - נוסח מלא",
    "url": "https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_פקודת מס הכנסה [נוסח חדש] - לא מרובד.pdf",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-15"
  },
  {
    "id": "src-taxes-glossary",
    "org": "רשות המסים",
    "title": "מאגר מונחים רשות המסים",
    "url": "https://www.gov.il/he/pages/taxes-glossary",
    "publishedDate": null,
    "updatedDate": "2026-03-15",
    "checked": "2026-09-15"
  },
  {
    "id": "src-taxes-annual-report-2025-service",
    "org": "רשות המסים",
    "title": "דיווח ותשלום - דוח מס שנתי 2025 ליחידים ובעלי עסקים שאינם חברה (טופס 1301)",
    "url": "https://www.gov.il/he/service/reporting-and-payment-2025-annual-tax-report-for-individuals",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-15"
  },
  {
    "id": "src-taxes-reporting-payment-dates-2026",
    "org": "רשות המסים",
    "title": "קביעת מועדי הדיווח והתשלום לדוחות תקופתיים במע״מ ולמקדמות מס הכנסה ולניכויים לשנת המס 2026",
    "url": "https://www.gov.il/he/pages/pa151025-2",
    "publishedDate": "2025-10-15",
    "updatedDate": null,
    "checked": "2026-09-15"
  },
  {
    "id": "src-nevo-minor-annual-report-threshold",
    "org": "נבו (מאגר חקיקה)",
    "title": "צו מס הכנסה (סכום הכנסה המחייב קטין בהגשת דוח), התשמ״ג-1983",
    "url": "https://www.nevo.co.il/law_html/law01/255_205.htm",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-15"
  },
  {
    "id": "src-nevo-exemption-from-filing-1988",
    "org": "נבו (מאגר חקיקה)",
    "title": "תקנות מס הכנסה (פטור מהגשת דין וחשבון), התשמ״ח-1988",
    "url": "https://www.nevo.co.il/law_html/law01/255_202.htm",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-15"
  },
  {
    "id": "src-nevo-exemption-online-report-2010",
    "org": "נבו (מאגר חקיקה)",
    "title": "תקנות מס הכנסה (פטור מהגשת דוח עצמאי מקוון), התש״ע-2010",
    "url": "https://www.nevo.co.il/law_html/law00/73533.htm",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-15"
  },
  {
    "id": "src-taxes-form-101-pdf-full",
    "org": "רשות המסים",
    "title": "טופס 101 המלא (PDF): כרטיס עובד ובקשה להקלה ולתיאום מס על ידי המעביד",
    "url": "https://www.gov.il/BlobFolder/service/itc101/he/Service_Pages_Income_tax_annual-report-2024_itc101.pdf",
    "publishedDate": null,
    "updatedDate": "2025-11-01",
    "checked": "2026-09-15"
  },
  {
    "id": "src-taxes-know-your-rights-guide-2024",
    "org": "רשות המסים",
    "title": "דע זכויותיך וחובותיך: מדריך למילוי טופס דין וחשבון שנתי לשנת 2024",
    "url": "https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2024.pdf",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-15"
  },
  {
    "id": "src-nevo-depreciation-regulations",
    "org": "נבו (מאגר חקיקה)",
    "title": "תקנות מס הכנסה (פחת) 1941 התוספת השנייה: שיעורי פחת למחשבים",
    "url": "https://www.nevo.co.il/law_html/law01/255_396.htm",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-15"
  },
  {
    "id": "src-taxes-israel-invoice-topic",
    "org": "רשות המסים",
    "title": "חשבוניות ישראל (עמוד הנושא)",
    "url": "https://www.gov.il/he/departments/topics/israel-invoice/govil-landing-page",
    "publishedDate": null,
    "updatedDate": "2026-09-03",
    "checked": "2026-09-16"
  },
  {
    "id": "src-taxes-israel-invoice-announcement-2024",
    "org": "רשות המסים",
    "title": "הודעת דוברות: תכנית חשבוניות ישראל עוברת לשלב הבא",
    "url": "https://www.gov.il/he/pages/sa201124-2",
    "publishedDate": "2024-11-20",
    "updatedDate": null,
    "checked": "2026-09-16"
  },
  {
    "id": "src-taxes-personal-import-guide",
    "org": "רשות המסים",
    "title": "מדריך ליבוא אישי באמצעות דואר חבילות או חברות שילוח",
    "url": "https://www.gov.il/he/pages/guide-to-importing-personally-via-parcels-or-shipping-companies",
    "publishedDate": "2019-09-23",
    "updatedDate": "2026-06-21",
    "checked": "2026-09-16"
  },
  {
    "id": "src-nevo-consumer-protection-law",
    "org": "נבו (מאגר חקיקה)",
    "title": "חוק הגנת הצרכן, התשמ״א-1981, סעיפים 14ג עד 14ה: עסקת מכר מרחוק וביטול עסקה",
    "url": "https://www.nevo.co.il/law_html/law00/70305.htm",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-16"
  },
  {
    "id": "src-consumer-protection-authority-returns",
    "org": "הרשות להגנת הצרכן ולסחר הוגן",
    "title": "ביטול עסקה: באינטרנט ובחנויות",
    "url": "https://www.gov.il/he/pages/returns",
    "publishedDate": "2024-11-04",
    "updatedDate": "2025-11-04",
    "checked": "2026-09-16"
  },
  {
    "id": "src-nevo-payment-services-law",
    "org": "נבו (מאגר חקיקה)",
    "title": "חוק שירותי תשלום, התשע\"ט-2019 (נוסח עדכני 19.8.2026)",
    "url": "https://www.nevo.co.il/law_html/law00/159510.htm",
    "publishedDate": null,
    "updatedDate": "2026-08-19",
    "checked": "2026-09-17"
  },
  {
    "id": "src-boi-representative-rate",
    "org": "בנק ישראל",
    "title": "מהו שער חליפין יציג",
    "url": "https://www.boi.org.il/roles/markets/reprate/",
    "publishedDate": null,
    "updatedDate": "2024-07-17",
    "checked": "2026-09-16"
  },
  {
    "id": "src-mof-personal-import-150-proposal",
    "org": "משרד האוצר",
    "title": "שר האוצר מרחיב את הפטור ממס על יבוא אישי לסכום של 150 דולר (הודעה על כוונה)",
    "url": "https://www.gov.il/he/pages/press_26112025",
    "publishedDate": "2025-11-26",
    "updatedDate": null,
    "checked": "2026-09-16"
  },
  {
    "id": "src-nevo-vat-law-export-zero-rate",
    "org": "נבו (מאגר חקיקה)",
    "title": "חוק מס ערך מוסף, התשל״ו-1975, פרק ז׳: שיעור אפס ופטורים (סעיף 30)",
    "url": "https://www.nevo.co.il/law_html/law00/70179.htm",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-16"
  },
  {
    "id": "src-nevo-wage-protection-law",
    "org": "נבו (מאגר חקיקה)",
    "title": "חוק הגנת השכר, תשי\"ח-1958",
    "url": "https://www.nevo.co.il/law_html/law00/71689.htm",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-16"
  },
  {
    "id": "src-mol-youth-rights-faq",
    "org": "משרד העבודה",
    "title": "זכויות בני נוער עובדים בחופשת הקיץ",
    "url": "https://www.gov.il/he/pages/youth-rights-faq",
    "publishedDate": "2026-06-21",
    "updatedDate": null,
    "checked": "2026-09-16"
  },
  {
    "id": "src-nevo-hours-of-work-rest-law",
    "org": "נבו (מאגר חקיקה)",
    "title": "חוק שעות עבודה ומנוחה, תשי\"א-1951",
    "url": "https://www.nevo.co.il/law_html/law00/5174.htm",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-16"
  },
  {
    "id": "src-mol-pension-extension-order-2011",
    "org": "משרד העבודה",
    "title": "צו הרחבה לביטוח פנסיוני מקיף במשק לפי חוק הסכמים קיבוציים (נוסח משולב)",
    "url": "https://www.gov.il/BlobFolder/guide/labor-wage/he/workers-rights_working-conditions_pension_H096.pdf",
    "publishedDate": "2011-09-27",
    "updatedDate": null,
    "checked": "2026-09-16"
  },
  {
    "id": "src-nevo-youth-labor-law",
    "org": "נבו (מאגר חקיקה)",
    "title": "חוק עבודת הנוער, תשי\"ג-1953",
    "url": "https://www.nevo.co.il/law_html/law00/4273.htm",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-16"
  },
  {
    "id": "src-nevo-notice-to-employee-law",
    "org": "נבו (מאגר חקיקה)",
    "title": "חוק הודעה לעובד ולמועמד לעבודה (תנאי עבודה והליכי מיון וקבלה לעבודה), תשס\"ב-2002",
    "url": "https://www.nevo.co.il/law_html/law00/71702.htm",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-16"
  },
  {
    "id": "src-mol-work-rights-complaints",
    "org": "משרד העבודה",
    "title": "הגשת תלונה על מעסיקים בשל הפרת חוקי עבודה",
    "url": "https://www.gov.il/he/service/work-rights-violation-complaints",
    "publishedDate": null,
    "updatedDate": "2026-09-08",
    "checked": "2026-09-16"
  },
  {
    "id": "src-nevo-deduction-regulations-1993",
    "org": "נבו (מאגר חקיקה)",
    "title": "תקנות מס הכנסה ומס מעסיקים (ניכוי ממשכורת ומשכר עבודה ותשלום מס מעסיקים), תשנ\"ג-1993",
    "url": "https://www.nevo.co.il/law_html/law01/255_163.htm",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-16"
  },
  {
    "id": "src-taxes-form135-refund",
    "org": "רשות המסים",
    "title": "בקשה להחזר מס - דוח מקוצר למס הכנסה עבור יחידים המבקשים החזר מס (טופס 135)",
    "url": "https://www.gov.il/he/service/itc135",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-16"
  },
  {
    "id": "src-boi-current-account-faq",
    "org": "בנק ישראל",
    "title": "שאלות ותשובות - חשבון עובר ושב",
    "url": "https://boi.org.il/q-a/מידע-ושרות-לציבור/חשבון-עוש/",
    "publishedDate": null,
    "updatedDate": "2022-11-15",
    "checked": "2026-09-17"
  },
  {
    "id": "src-boi-payment-cards-types",
    "org": "בנק ישראל",
    "title": "כרטיסי חיוב (עמוד רשמי באתר בנק ישראל)",
    "url": "https://www.boi.org.il/roles/paymentsystems/paymentmeans/paymentcards/",
    "publishedDate": null,
    "updatedDate": "2024-03-24",
    "checked": "2026-09-17"
  },
  {
    "id": "src-boi-restricted-accounts-checks",
    "org": "בנק ישראל",
    "title": "מידע בנושאים צרכניים - הגבלת חשבונות ולקוחות",
    "url": "https://www.boi.org.il/he/ConsumerInformation/ConsumerIssues/pages/checksgeneral.aspx",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-17"
  },
  {
    "id": "src-boi-restricted-accounts-guide",
    "org": "בנק ישראל",
    "title": "המדריך לחשבונות מוגבלים",
    "url": "https://www.boi.org.il/information/bank-paymnts/guide/restricted_accounts/",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-17"
  },
  {
    "id": "src-boi-fee-reform-circular-h2851",
    "org": "בנק ישראל - הפיקוח על הבנקים",
    "title": "חוזר ח-06-2851: רפורמה בתחום העמלות הנגבות ממשקי בית ועסקים קטנים על שירותי ניהול חשבון תשלום וכרטיס חיוב מיידי (דביט)",
    "url": "https://www.boi.org.il/media/0cgabv01/h2851.pdf",
    "publishedDate": "2026-06-21",
    "updatedDate": null,
    "checked": "2026-09-17"
  },
  {
    "id": "src-boi-fees-info-page",
    "org": "בנק ישראל",
    "title": "עמלות (מידע ושירות לציבור)",
    "url": "https://boi.org.il/information/fees/",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-17"
  },
  {
    "id": "src-boi-fee-rules-2008",
    "org": "בנק ישראל",
    "title": "כללי הבנקאות (שירות ללקוח)(עמלות), התשס\"ח-2008 - התעריפון המלא",
    "url": "https://boi.org.il/media/w2lgmymp/159a.pdf",
    "publishedDate": null,
    "updatedDate": "2025-04-01",
    "checked": "2026-09-17"
  },
  {
    "id": "src-boi-press-releases-interest-rate",
    "org": "בנק ישראל",
    "title": "הודעות לעיתונות (כולל הודעת ריבית בנק ישראל העדכנית)",
    "url": "https://www.boi.org.il/publications/pressreleases/",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-17"
  },
  {
    "id": "src-boi-directive-325-overdraft",
    "org": "בנק ישראל - הפיקוח על הבנקים",
    "title": "ניהול בנקאי תקין 325: ניהול מסגרות אשראי בחשבונות עובר ושב",
    "url": "https://www.boi.org.il/media/4hshzbs4/325.pdf",
    "publishedDate": null,
    "updatedDate": "2020-12-30",
    "checked": "2026-09-17"
  },
  {
    "id": "src-boi-nominal-effective-calculator",
    "org": "בנק ישראל",
    "title": "מחשבונים וכלים - ריבית נומינלית אפקטיבית",
    "url": "https://www.boi.org.il/information/מחשבונים-וכלים/ריבית-נומינלית-אפקטיבית/",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-17"
  },
  {
    "id": "src-boi-equator-loans-comparison",
    "org": "בנק ישראל",
    "title": "קו המשווה - השוואת ריביות הלוואות",
    "url": "https://boi.org.il/information/bank-paymnts/financial-education/campaigns/boi-equator/loans/",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-17"
  },
  {
    "id": "src-boi-credit-data-system",
    "org": "בנק ישראל",
    "title": "בנקיפדיה - בשביל מה צריך את מערכת נתוני האשראי",
    "url": "https://www.boi.org.il/information/bankipedia/centralbank/בשביל-מה-צריך-את-מערכת-נתוני-האשראי/",
    "publishedDate": null,
    "updatedDate": "2023-09-27",
    "checked": "2026-09-17"
  },
  {
    "id": "src-boi-financial-responsibility-guide-teens",
    "org": "בנק ישראל ומשרד החינוך",
    "title": "\"לוקחים אחריות על הכסף שלנו\" - מדריך למנחה",
    "url": "https://www.boi.org.il/media/q1mi1qro/פעילות-לבני-נוער-מדריך-למנחה.pdf",
    "publishedDate": null,
    "updatedDate": null,
    "checked": "2026-09-17"
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
