import type { L10n } from "@/lib/i18n";

const pagesAr = {
  services: {
    meta: {
      title: "خدمات جراحة القلب",
      description:
        "مجالات الرعاية في هايبرد هارتس: استشارات جراحة القلب والرأي الثاني، والشرايين التاجية، والصمامات، والشريان الأورطي، والجراحات الهجينة، والتحضير والتعافي.",
    },
    hero: {
      eyebrow: "الخدمات",
      title: "مجالات رعاية القلب الجراحية",
      lead: "من التقييم والاستشارة إلى التحضير للعملية والمتابعة بعدها — تعرّف على ما يتضمّنه كل مجال.",
      imageAlt: "غرفة عمليات هجينة مجهزة بأجهزة تصوير القلب",
    },
    indexLabel: "انتقل إلى خدمة",
    involves: "ما الذي يتضمّنه",
    related: "اقرأ أيضًا",
    ask: "اسأل عن هذه الخدمة",
  },
  articles: {
    meta: {
      title: "مكتبة القلب",
      description: "مقالات تثقيفية مبسّطة عن أمراض القلب وجراحاته والتحضير للعمليات والتعافي بعدها ونمط الحياة الصحي.",
    },
    hero: {
      eyebrow: "مكتبة القلب",
      title: "افهم قلبك بلغة بسيطة",
      lead: "مقالات تثقيفية عامة تساعدك على طرح الأسئلة الصحيحة واتخاذ قرارات أكثر اطمئنانًا.",
    },
    featured: "مقال مميز",
    all: "جميع المقالات",
    filterLabel: "الموضوعات",
    allTopics: "الكل",
    takeaways: "أهم النقاط",
    onThisPage: "في هذا المقال",
    relatedTitle: "مقالات ذات صلة",
    published: "نُشر في",
    disclaimerTitle: "تنبيه",
    disclaimer:
      "هذا المقال للتثقيف الصحي العام ولا يُغني عن استشارة طبية تناسب حالتك. لا تغيّر أدويتك أو خطتك العلاجية دون الرجوع إلى طبيبك.",
    questionsTitle: "لديك أسئلة عن حالتك؟",
    questionsText: "احمل تقاريرك إلى استشارة لمناقشتها بالتفصيل.",
  },
  cta: {
    eyebrow: "موعدك القادم",
    title: "خطوتك الأولى نحو قرار مطمئن",
    text: "تواصل معنا لحجز استشارة، وجهّز تقاريرك وأسئلتك — وسنساعدك على فهم خياراتك بوضوح.",
    primary: "احجز استشارتك",
    secondary: "اتصل الآن",
    imageAlt: "سمّاعة طبية بلون عنابي",
  },
};

export const pages: L10n<typeof pagesAr> = {
  ar: pagesAr,
  en: {
    services: {
      meta: {
        title: "Cardiac surgery services",
        description:
          "Areas of care at Hybrid Hearts: cardiac surgical consultations and second opinions, coronary, valve and aortic disease, hybrid approaches, and preparation and recovery.",
      },
      hero: {
        eyebrow: "Services",
        title: "Areas of cardiac surgical care",
        lead: "From assessment and consultation to preparing for surgery and follow-up afterwards — see what each area involves.",
        imageAlt: "A hybrid operating room equipped with cardiac imaging",
      },
      indexLabel: "Jump to a service",
      involves: "What it involves",
      related: "Further reading",
      ask: "Ask about this service",
    },
    articles: {
      meta: {
        title: "Heart Library",
        description:
          "Plain-language educational articles on heart conditions and surgery, preparing for operations, recovery, and heart-healthy living.",
      },
      hero: {
        eyebrow: "Heart Library",
        title: "Understand your heart, in plain language",
        lead: "General educational articles to help you ask the right questions and make more confident decisions.",
      },
      featured: "Featured article",
      all: "All articles",
      filterLabel: "Topics",
      allTopics: "All",
      takeaways: "Key points",
      onThisPage: "In this article",
      relatedTitle: "Related articles",
      published: "Published",
      disclaimerTitle: "Please note",
      disclaimer:
        "This article is general health education and does not replace medical advice suited to your situation. Do not change your medication or treatment plan without speaking to your doctor.",
      questionsTitle: "Questions about your own situation?",
      questionsText: "Bring your reports to a consultation to discuss them in detail.",
    },
    cta: {
      eyebrow: "Your next appointment",
      title: "Your first step towards a confident decision",
      text: "Get in touch to book a consultation and bring your reports and questions — we will help you understand your options clearly.",
      primary: "Book a consultation",
      secondary: "Call now",
      imageAlt: "A burgundy stethoscope",
    },
  },
};
