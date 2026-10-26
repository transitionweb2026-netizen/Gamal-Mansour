import type { L10n } from "@/lib/i18n";

// Default text for content shared by every page. Editable in the dashboard under
// "Global website content"; these values seed the CMS and act as the build fallback.

export type NavKey = "home" | "about" | "services" | "articles" | "videos" | "patients" | "contact";

export const navigation: Array<{ key: NavKey; path: string; label: L10n }> = [
  { key: "home", path: "", label: { ar: "الرئيسية", en: "Home" } },
  { key: "about", path: "about", label: { ar: "عن الطبيب", en: "About" } },
  { key: "services", path: "services", label: { ar: "الخدمات", en: "Services" } },
  { key: "articles", path: "articles", label: { ar: "مكتبة القلب", en: "Heart Library" } },
  { key: "videos", path: "videos", label: { ar: "فيديوهات", en: "Videos" } },
  { key: "patients", path: "patients", label: { ar: "آراء وأسئلة", en: "Reviews & FAQ" } },
  { key: "contact", path: "contact", label: { ar: "تواصل", en: "Contact" } },
];

const globalAr = {
  header: {
    skipToContent: "تخطَّ إلى المحتوى",
    bookAppointment: "احجز موعدك",
    menu: "القائمة",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    mainNav: "التنقل الرئيسي",
    switchLanguage: "Switch to English",
  },
  footer: {
    tagline: "رعاية جراحية للقلب تبدأ بالإصغاء، وتقوم على الوضوح، وتستمر حتى التعافي.",
    exploreTitle: "استكشف",
    contactTitle: "التواصل",
    followTitle: "تابعنا",
    navLabel: "روابط الموقع",
    rights: "جميع الحقوق محفوظة.",
    contactDetailsSoon: "تفاصيل التواصل الرسمية تُنشر هنا فور اعتمادها.",
    medicalDisclaimer:
      "المحتوى المنشور على هذا الموقع للتثقيف الصحي العام، ولا يُغني عن الاستشارة الطبية المباشرة أو التشخيص أو العلاج.",
    photoCredit: "الصور الفوتوغرافية توضيحية.",
  },
  contactPanel: {
    phoneLabel: "هاتف الحجز",
    phoneComingSoon: "رقم الحجز يُعلن قريبًا",
    callUs: "اتصل بنا",
    socialLabel: "حسابات التواصل الاجتماعي",
    socialComingSoon: "الرابط يُضاف قريبًا",
    whatsapp: "واتساب",
  },
  emergency: {
    title: "في حالة الطوارئ",
    text: "ألم الصدر الشديد أو المفاجئ، أو ضيق التنفس الحاد، أو الإغماء حالات طارئة. اتصل بالإسعاف فورًا (123 في مصر) أو توجّه إلى أقرب قسم طوارئ، ولا تنتظر موعدًا.",
  },
  ui: {
    readArticle: "اقرأ المقال",
    minutesRead: "{n} دقائق قراءة",
    breadcrumbHome: "الرئيسية",
    breadcrumbLabel: "مسار التنقل",
    reviewVerified: "رأي موثّق بموافقة المريض",
  },
  notFound: {
    title: "الصفحة غير موجودة",
    text: "ربما نُقلت الصفحة أو تغيّر عنوانها.",
    homeLabel: "الرئيسية",
  },
};

export const globalText: L10n<typeof globalAr> = {
  ar: globalAr,
  en: {
    header: {
      skipToContent: "Skip to content",
      bookAppointment: "Book an appointment",
      menu: "Menu",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      mainNav: "Main navigation",
      switchLanguage: "التبديل إلى العربية",
    },
    footer: {
      tagline: "Cardiac surgical care that begins with listening, is built on clarity, and continues through recovery.",
      exploreTitle: "Explore",
      contactTitle: "Contact",
      followTitle: "Follow",
      navLabel: "Site links",
      rights: "All rights reserved.",
      contactDetailsSoon: "Official contact details will be published here once confirmed.",
      medicalDisclaimer:
        "Content on this website is general health education and does not replace an in-person medical consultation, diagnosis, or treatment.",
      photoCredit: "Photography is illustrative.",
    },
    contactPanel: {
      phoneLabel: "Appointments line",
      phoneComingSoon: "Booking number coming soon",
      callUs: "Call us",
      socialLabel: "Social media profiles",
      socialComingSoon: "link coming soon",
      whatsapp: "WhatsApp",
    },
    emergency: {
      title: "In an emergency",
      text: "Severe or sudden chest pain, acute shortness of breath, or fainting are emergencies. Call your local emergency number (123 in Egypt) or go to the nearest emergency department — do not wait for an appointment.",
    },
    ui: {
      readArticle: "Read article",
      minutesRead: "{n} min read",
      breadcrumbHome: "Home",
      breadcrumbLabel: "Breadcrumb",
      reviewVerified: "Verified review, shared with the patient's consent",
    },
    notFound: {
      title: "Page not found",
      text: "The page may have moved or its address may have changed.",
      homeLabel: "English home",
    },
  },
};
