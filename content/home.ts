import type { L10n } from "@/lib/i18n";

// Editorial copy for the home page. Practice facts come from content/site.ts.
// Statements here describe the practice's approach; they contain no statistics or credentials.

const homeAr = {
  meta: {
    title: "د. جمال منصور — جراحة القلب | هايبرد هارتس",
    description:
      "د. جمال منصور — جراحة القلب. استشارات جراحية ورعاية متكاملة لمرضى القلب من التشخيص حتى التعافي، بشرح واضح وقرار مشترك.",
  },
  hero: {
    headlineLead: "دقّة في الجراحة،",
    headlineAccent: "وطمأنينة في كل خطوة",
    lead: "نرافقك من الاستشارة الأولى حتى التعافي، بشرح واضح لكل خيار وخطة مصمّمة لقلبك، لتتخذ قرارك وأنت مطمئن.",
    primary: "احجز استشارتك",
    secondary: "استكشف الخدمات",
    imageAlt: "فريق جراحي يعمل تحت إضاءة غرفة العمليات (صورة توضيحية)",
    cardTitle: "Hybrid Hearts",
    cardText: "جراحة القلب",
    scroll: "مرّر للأسفل",
  },
  strip: {
    label: "معلومات العيادة",
    specialty: "التخصص",
    practice: "العيادة",
    booking: "الحجز",
    bookingValue: "هاتفيًا أو عبر واتساب",
    location: "العنوان ومواعيد العمل",
    locationPending: "تفاصيلها في صفحة التواصل",
  },
  intro: {
    eyebrow: "تعرّف على الطبيب",
    title: "قرار جراحة القلب يستحق وقتًا ووضوحًا",
    paragraphs: [
      "في «هايبرد هارتس» نؤمن بأن كل قلب يحمل قصة مختلفة. لذلك تبدأ الرعاية بالإصغاء إليك، ومراجعة فحوصاتك بعناية، ثم شرح الخيارات المتاحة بلغة يفهمها المريض وأسرته.",
      "سواء كنت تبحث عن تقييم جراحي، أو رأي ثانٍ قبل عملية مقترحة، أو خطة متابعة بعد الجراحة، ستجد شرحًا صريحًا يساعدك على المشاركة في قرارك.",
    ],
    quote: "الجراحة الناجحة تبدأ بمريض يفهم خطته ويثق بها.",
    quoteLabel: "مبدأ هايبرد هارتس",
    cta: "اقرأ عن الطبيب",
  },
  services: {
    eyebrow: "مجالات الرعاية",
    title: "رعاية جراحية للقلب، من التقييم إلى التعافي",
    lead: "مجالات رئيسية تغطي أمراض القلب التي قد تحتاج إلى تقييم جراحي. اختر المجال لتعرف ما يتضمّنه.",
    cta: "جميع الخدمات",
  },
  journey: {
    eyebrow: "فلسفة الرعاية",
    title: "رحلة واضحة بأربع محطات",
    lead: "نصمّم كل خطة حول المريض، ونحرص على أن تعرف دائمًا أين أنت من رحلتك وما الخطوة التالية.",
    steps: [
      { title: "نُصغي ونراجع", text: "نستمع إلى قصتك، ونراجع التقارير والفحوصات وصور القلب بعناية." },
      { title: "نشرح الخيارات", text: "نوضّح البدائل المتاحة، ومزايا كل منها ومخاطره، دون تعقيد أو استعجال." },
      { title: "نقرّر معًا", text: "تُبنى الخطة بمشاركتك، وبالتنسيق مع طبيب القلب المعالج عند الحاجة." },
      { title: "نتابع التعافي", text: "تستمر الرعاية بعد العملية بمتابعة منظّمة وعودة تدريجية للحياة اليومية." },
    ],
  },
  why: {
    eyebrow: "لماذا هايبرد هارتس",
    title: "ما يمكنك أن تتوقعه منّا",
    lead: "التزامات واضحة تحكم طريقة عملنا مع كل مريض وأسرته.",
    imageAlt: "فريق جراحي يتعاون أثناء عملية في غرفة عمليات مضيئة (صورة توضيحية)",
    chip1: "رعاية جراحية متكاملة",
    chip2: "قرار مشترك",
    reasons: [
      { title: "وقت لفهم حالتك", text: "استشارات تتسع لأسئلتك، فلا تغادر وفي ذهنك ما لم يُشرح." },
      { title: "شرح صريح وواضح", text: "الخيارات والفوائد والمخاطر بلغة مفهومة، مع أمثلة توضيحية عند الحاجة." },
      { title: "تنسيق مع فريقك الطبي", text: "تواصل مع طبيب القلب المعالج لتكون الخطة متكاملة لا متضاربة." },
      { title: "رعاية مستمرة", text: "الاهتمام لا ينتهي بانتهاء العملية؛ المتابعة جزء أساسي من الخطة." },
    ],
  },
  library: {
    eyebrow: "مكتبة القلب",
    title: "معلومات موثوقة تساعدك على الفهم",
    lead: "مقالات تثقيفية مبسّطة عن أمراض القلب وجراحاته، والتحضير للعمليات، والتعافي بعدها.",
    cta: "تصفّح المكتبة",
  },
};

export const home: L10n<typeof homeAr> = {
  ar: homeAr,
  en: {
    meta: {
      title: "Dr. Gamal Mansour — Cardiac Surgery | Hybrid Hearts",
      description:
        "Dr. Gamal Mansour — Cardiac Surgery. Surgical consultations and complete heart care from diagnosis through recovery, with clear explanations and shared decisions.",
    },
    hero: {
      headlineLead: "Precision in surgery.",
      headlineAccent: "Reassurance at every step.",
      lead: "From your first consultation through recovery, every option is explained clearly and your plan is built around your heart — so you can decide with confidence.",
      primary: "Book a consultation",
      secondary: "Explore services",
      imageAlt: "A surgical team at work under operating-room lights (illustrative photo)",
      cardTitle: "Hybrid Hearts",
      cardText: "Cardiac Surgery",
      scroll: "Scroll down",
    },
    strip: {
      label: "Practice information",
      specialty: "Specialty",
      practice: "Practice",
      booking: "Booking",
      bookingValue: "By phone or WhatsApp",
      location: "Address & hours",
      locationPending: "Details on the contact page",
    },
    intro: {
      eyebrow: "Meet the doctor",
      title: "A decision about heart surgery deserves time and clarity",
      paragraphs: [
        "At Hybrid Hearts we believe every heart carries a different story. Care therefore begins with listening, a careful review of your investigations, and an explanation of the options in language that patients and families can follow.",
        "Whether you need a surgical assessment, a second opinion before a proposed operation, or a follow-up plan after surgery, you will find an honest explanation that helps you take part in the decision.",
      ],
      quote: "Successful surgery starts with a patient who understands — and trusts — the plan.",
      quoteLabel: "The Hybrid Hearts principle",
      cta: "About the doctor",
    },
    services: {
      eyebrow: "Areas of care",
      title: "Cardiac surgical care, from assessment to recovery",
      lead: "Core areas covering heart conditions that may need a surgical assessment. Choose one to see what it involves.",
      cta: "All services",
    },
    journey: {
      eyebrow: "Philosophy of care",
      title: "A clear journey in four stages",
      lead: "Every plan is designed around the patient, so you always know where you are in the journey and what comes next.",
      steps: [
        { title: "Listen & review", text: "We hear your story and carefully review your reports, tests, and cardiac imaging." },
        { title: "Explain the options", text: "Alternatives, benefits, and risks — explained without jargon and without rushing." },
        { title: "Decide together", text: "The plan is built with you, coordinated with your treating cardiologist when needed." },
        { title: "Follow your recovery", text: "Care continues after surgery with structured follow-up and a gradual return to daily life." },
      ],
    },
    why: {
      eyebrow: "Why Hybrid Hearts",
      title: "What you can expect from us",
      lead: "Clear commitments that shape how we work with every patient and family.",
      imageAlt: "A surgical team collaborating during an operation in a bright operating room (illustrative photo)",
      chip1: "Complete surgical care",
      chip2: "Shared decisions",
      reasons: [
        { title: "Time to understand", text: "Consultations with room for your questions — nothing left unexplained." },
        { title: "Honest, clear explanations", text: "Options, benefits, and risks in plain language, with illustrations when they help." },
        { title: "Coordinated with your team", text: "Communication with your cardiologist so your plan fits together, not apart." },
        { title: "Care that continues", text: "Attention does not end with the operation — follow-up is part of the plan." },
      ],
    },
    library: {
      eyebrow: "Heart library",
      title: "Reliable information that helps you understand",
      lead: "Plain-language articles on heart conditions and surgery, preparing for an operation, and recovering afterwards.",
      cta: "Browse the library",
    },
  },
};
