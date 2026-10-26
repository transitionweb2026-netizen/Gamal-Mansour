import type { L10n } from "@/lib/i18n";

/**
 * About page. The biography below is PROVISIONAL editorial copy: it states only what is known
 * (Dr. Gamal Mansour, cardiac surgery, the Hybrid Hearts practice) plus the practice's approach.
 * Replace it with an approved biography when available.
 */

export type Credential = { title: L10n; detail: L10n };

/** Verified qualifications / memberships. Leave empty until confirmed — the section stays hidden. */
export const credentials: Credential[] = [];

/** Verified professional experience entries. Leave empty until confirmed — the section stays hidden. */
export const experience: Credential[] = [];

const aboutAr = {
  meta: {
    title: "عن د. جمال منصور",
    description: "تعرّف على د. جمال منصور و«هايبرد هارتس» لجراحة القلب: فلسفة الرعاية، وما يمكن توقّعه في الاستشارة الأولى.",
  },
  hero: {
    eyebrow: "عن الطبيب",
    title: "د. جمال منصور",
    lead: "رعاية جراحية للقلب تقوم على الإصغاء، والشرح الصريح، والقرار المشترك مع المريض وأسرته.",
    imageAlt: "غرفة عمليات بالأبيض والأسود تضم فريقًا جراحيًا وأجهزة مراقبة (صورة توضيحية)",
  },
  bio: {
    eyebrow: "النبذة",
    title: "جراحة القلب بمنظور إنساني",
    paragraphs: [
      "د. جمال منصور متخصص في جراحة القلب، ويقدّم رعايته الجراحية تحت اسم «هايبرد هارتس». يجمع الاسم بين فكرتين: الجمع بين أفضل ما في الجراحة والتقنيات الحديثة عندما يناسب ذلك المريض، والتعامل مع القلب بوصفه قلب إنسان له مخاوفه وأسئلته وأسرته.",
      "تبدأ كل رحلة علاجية بمراجعة دقيقة للفحوصات والتقارير، ثم حوار مفتوح حول الخيارات المتاحة، مع التنسيق مع طبيب القلب المعالج عند الحاجة، ووضع خطة واضحة تمتد من التحضير للعملية حتى ما بعد التعافي.",
    ],
    note: "تُنشر المؤهلات العلمية والخبرات المهنية في هذه الصفحة بعد اعتمادها رسميًا.",
  },
  principles: {
    eyebrow: "مبادئ الرعاية",
    title: "ثلاثة مبادئ ترافقك في كل خطوة",
    items: [
      { title: "الإصغاء أولًا", text: "قصتك وأعراضك ومخاوفك هي نقطة البداية، قبل أي فحص أو قرار." },
      { title: "الوضوح دائمًا", text: "شرح مفهوم للتشخيص والخيارات والمخاطر، وإجابة صادقة عن كل سؤال." },
      { title: "القرار معًا", text: "خطة تُبنى بمشاركتك، تحترم أولوياتك وظروفك وتطلعاتك." },
    ],
    quote: "أفضل قرار جراحي هو الذي يفهمه المريض ويشارك فيه.",
    quoteCaption: "مبدأ هايبرد هارتس",
  },
  expect: {
    eyebrow: "زيارتك الأولى",
    title: "ماذا تتوقع في الاستشارة الأولى؟",
    lead: "استعدادك الجيد يساعدنا على الاستفادة القصوى من وقت الاستشارة.",
    steps: [
      { title: "قبل الموعد", text: "اجمع تقاريرك الطبية وصور الأشعة والقسطرة (والأسطوانات إن وُجدت) وقائمة أدويتك." },
      { title: "خلال الاستشارة", text: "نراجع حالتك وفحوصاتك، ونشرح ما تعنيه، ونناقش الخيارات المتاحة." },
      { title: "بعد الاستشارة", text: "تغادر وأنت تعرف الخطوة التالية: فحوصات إضافية، أو متابعة، أو خطة علاج." },
    ],
    bring: "يمكنك اصطحاب أحد أفراد أسرتك؛ فوجود من يدعمك ويسمع معك الشرح يساعد كثيرًا.",
  },
  credentialsTitle: "المؤهلات والعضويات",
  experienceTitle: "الخبرة المهنية",
  practice: {
    eyebrow: "العيادة",
    title: "هايبرد هارتس لجراحة القلب",
    text: "هوية واحدة تجمع رعاية د. جمال منصور الجراحية: من الاستشارة والتقييم، إلى التحضير للعملية، والمتابعة بعدها.",
  },
};

export const about: L10n<typeof aboutAr> = {
  ar: aboutAr,
  en: {
    meta: {
      title: "About Dr. Gamal Mansour",
      description:
        "Meet Dr. Gamal Mansour and Hybrid Hearts Cardiac Surgery: the philosophy of care and what to expect at your first consultation.",
    },
    hero: {
      eyebrow: "About the doctor",
      title: "Dr. Gamal Mansour",
      lead: "Cardiac surgical care built on listening, honest explanation, and decisions shared with patients and their families.",
      imageAlt: "A black-and-white operating room with a surgical team and monitoring equipment (illustrative photo)",
    },
    bio: {
      eyebrow: "Biography",
      title: "Heart surgery with a human perspective",
      paragraphs: [
        "Dr. Gamal Mansour specialises in cardiac surgery and provides surgical care under the Hybrid Hearts name. The name brings two ideas together: combining the best of surgery and modern techniques when that serves the patient, and treating every heart as the heart of a person — with their worries, questions, and family.",
        "Each treatment journey starts with a careful review of investigations and reports, followed by an open conversation about the options, coordination with the treating cardiologist when needed, and a clear plan that runs from preparing for surgery to life after recovery.",
      ],
      note: "Academic qualifications and professional experience will be published on this page once formally confirmed.",
    },
    principles: {
      eyebrow: "Principles of care",
      title: "Three principles at every step",
      items: [
        { title: "Listen first", text: "Your story, symptoms, and concerns are the starting point — before any test or decision." },
        { title: "Always clear", text: "Understandable explanations of the diagnosis, options, and risks, and honest answers to every question." },
        { title: "Decide together", text: "A plan built with you that respects your priorities, circumstances, and hopes." },
      ],
      quote: "The best surgical decision is one the patient understands and takes part in.",
      quoteCaption: "The Hybrid Hearts principle",
    },
    expect: {
      eyebrow: "Your first visit",
      title: "What to expect at your first consultation",
      lead: "Coming prepared helps make the most of your consultation time.",
      steps: [
        { title: "Before the appointment", text: "Gather your medical reports, scan and angiogram images (and discs, if any), and a list of your medicines." },
        { title: "During the consultation", text: "Your condition and investigations are reviewed, explained, and the available options discussed." },
        { title: "After the consultation", text: "You leave knowing the next step: further tests, monitoring, or a treatment plan." },
      ],
      bring: "You are welcome to bring a family member — having someone to support you and hear the explanation helps a great deal.",
    },
    credentialsTitle: "Qualifications & memberships",
    experienceTitle: "Professional experience",
    practice: {
      eyebrow: "The practice",
      title: "Hybrid Hearts Cardiac Surgery",
      text: "One identity for Dr. Gamal Mansour's surgical care: from consultation and assessment to preparing for surgery and follow-up afterwards.",
    },
  },
};
