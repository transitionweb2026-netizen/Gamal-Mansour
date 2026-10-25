import type { L10n } from "@/lib/i18n";

const contactAr = {
  meta: {
    title: "تواصل واحجز موعدك",
    description: "قنوات التواصل مع د. جمال منصور — هايبرد هارتس لجراحة القلب، وخطوات حجز الاستشارة وما تحتاج إلى إحضاره.",
  },
  hero: {
    eyebrow: "تواصل",
    title: "لنبدأ الحديث عن قلبك",
    lead: "اختر وسيلة التواصل الأنسب لك، وسنساعدك على ترتيب استشارتك والاستعداد لها.",
    imageAlt: "سمّاعة طبية بلون عنابي على سطح فاتح",
  },
  channels: {
    eyebrow: "قنوات التواصل",
    title: "تواصل معنا مباشرة",
    phone: { title: "اتصال هاتفي", text: "للحجز والاستفسارات العامة.", action: "اتصل الآن" },
    whatsapp: { title: "واتساب", text: "أرسل رسالة واذكر سبب الاستشارة باختصار.", action: "راسلنا على واتساب" },
    email: { title: "البريد الإلكتروني", text: "لإرسال الاستفسارات غير العاجلة.", action: "أرسل بريدًا" },
    booking: { title: "الحجز الإلكتروني", text: "احجز موعدك عبر منصة الحجز.", action: "احجز عبر الإنترنت" },
    pending: "يُعلن قريبًا",
    pendingNote: "تفاصيل التواصل الرسمية قيد الاعتماد، وستُنشر في هذه الصفحة فور تأكيدها.",
  },
  steps: {
    eyebrow: "كيف تحجز",
    title: "أربع خطوات بسيطة",
    items: [
      { title: "تواصل معنا", text: "عبر الهاتف أو واتساب، واذكر اسمك وسبب الاستشارة باختصار." },
      { title: "شارك ملخص حالتك", text: "قد يُطلب منك إرسال ملخص لأهم التقارير لترتيب الاستشارة المناسبة." },
      { title: "أكِّد الموعد", text: "يُحدَّد الموعد المناسب، وتصلك التعليمات اللازمة قبله." },
      { title: "احضر مستعدًا", text: "أحضر تقاريرك وصور الفحوصات وقائمة أدويتك وأسئلتك." },
    ],
  },
  checklist: {
    title: "ما تحتاج إلى إحضاره",
    items: [
      "التقارير الطبية السابقة وخطابات التحويل",
      "تقارير وصور الإيكو والأشعة والقسطرة (والأسطوانات)",
      "نتائج التحاليل الحديثة",
      "قائمة بجميع الأدوية وجرعاتها",
      "قائمة بأسئلتك",
    ],
  },
  composer: {
    eyebrow: "رسالة جاهزة",
    title: "جهّز رسالة الحجز على واتساب",
    text: "املأ البيانات التالية لتجهيز رسالة واضحة تُفتح في واتساب. لا تُحفَظ بياناتك أو تُرسَل إلى أي خادم.",
    name: "الاسم",
    namePlaceholder: "الاسم الكامل",
    reason: "سبب الاستشارة",
    reasons: ["استشارة جراحية", "رأي ثانٍ", "متابعة بعد جراحة", "استفسار عام"],
    preferred: "الأيام المفضّلة",
    preferredPlaceholder: "مثال: صباح الأحد أو الثلاثاء",
    note: "ملاحظات مختصرة (اختياري)",
    notePlaceholder: "لا تكتب تفاصيل طبية حساسة هنا؛ يمكن مناقشتها في الاستشارة.",
    submit: "افتح الرسالة في واتساب",
    unavailable: "سيعمل هذا النموذج فور اعتماد رقم واتساب العيادة.",
    greeting: "مرحبًا، أودّ حجز موعد استشارة.",
    labels: { name: "الاسم", reason: "سبب الاستشارة", preferred: "الأيام المفضّلة", note: "ملاحظات" },
  },
  location: {
    eyebrow: "العنوان والمواعيد",
    title: "أين تجدنا",
    pending: "يُنشر عنوان العيادة ومواعيد العمل هنا فور تأكيدهما.",
    directions: "الاتجاهات على الخريطة",
    hours: "مواعيد العمل",
  },
};

export const contact: L10n<typeof contactAr> = {
  ar: contactAr,
  en: {
    meta: {
      title: "Contact & appointments",
      description:
        "How to contact Dr. Gamal Mansour — Hybrid Hearts Cardiac Surgery, the steps to book a consultation, and what to bring.",
    },
    hero: {
      eyebrow: "Contact",
      title: "Let's start the conversation about your heart",
      lead: "Choose the channel that suits you, and we will help you arrange and prepare for your consultation.",
      imageAlt: "A burgundy stethoscope on a light surface",
    },
    channels: {
      eyebrow: "Contact channels",
      title: "Reach us directly",
      phone: { title: "Phone", text: "For appointments and general enquiries.", action: "Call now" },
      whatsapp: { title: "WhatsApp", text: "Send a message with a brief reason for your consultation.", action: "Message on WhatsApp" },
      email: { title: "Email", text: "For non-urgent enquiries.", action: "Send an email" },
      booking: { title: "Online booking", text: "Book your appointment through the booking platform.", action: "Book online" },
      pending: "Coming soon",
      pendingNote: "Official contact details are being confirmed and will be published on this page as soon as they are.",
    },
    steps: {
      eyebrow: "How to book",
      title: "Four simple steps",
      items: [
        { title: "Get in touch", text: "By phone or WhatsApp — share your name and a brief reason for the consultation." },
        { title: "Share a summary", text: "You may be asked for a summary of key reports so the right consultation can be arranged." },
        { title: "Confirm your appointment", text: "A suitable time is agreed and you receive any instructions in advance." },
        { title: "Come prepared", text: "Bring your reports, scan images, medication list, and questions." },
      ],
    },
    checklist: {
      title: "What to bring",
      items: [
        "Previous medical reports and referral letters",
        "Echo, scan, and angiogram reports and images (and discs)",
        "Recent blood test results",
        "A list of all your medicines and doses",
        "Your list of questions",
      ],
    },
    composer: {
      eyebrow: "Ready-made message",
      title: "Prepare your WhatsApp booking message",
      text: "Fill in the details below to prepare a clear message that opens in WhatsApp. Nothing is stored or sent to any server.",
      name: "Name",
      namePlaceholder: "Full name",
      reason: "Reason for consultation",
      reasons: ["Surgical consultation", "Second opinion", "Post-surgery follow-up", "General enquiry"],
      preferred: "Preferred days",
      preferredPlaceholder: "e.g. Sunday or Tuesday morning",
      note: "Brief notes (optional)",
      notePlaceholder: "Please don't include sensitive medical details here — they can be discussed in the consultation.",
      submit: "Open message in WhatsApp",
      unavailable: "This form will work as soon as the clinic's WhatsApp number is confirmed.",
      greeting: "Hello, I would like to book a consultation.",
      labels: { name: "Name", reason: "Reason", preferred: "Preferred days", note: "Notes" },
    },
    location: {
      eyebrow: "Address & hours",
      title: "Where to find us",
      pending: "The clinic address and opening hours will be published here once confirmed.",
      directions: "Directions on the map",
      hours: "Opening hours",
    },
  },
};
