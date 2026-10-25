import type { L10n } from "@/lib/i18n";
import type { PhotoName } from "@/lib/photos";

export type ServiceIconName = "stethoscope" | "heart-pulse" | "activity" | "combine" | "waypoints" | "clipboard-check";

export type Service = {
  slug: string;
  icon: ServiceIconName;
  image: PhotoName;
  imageAlt: L10n;
  /**
   * "draft" = broad category written for the launch and NOT yet confirmed by the practice.
   * Change to "confirmed" once Dr. Mansour has approved the wording and availability.
   */
  status: "draft" | "confirmed";
  title: L10n;
  short: L10n;
  body: L10n<string[]>;
  points: L10n<string[]>;
  /** Related article slugs (see content/articles.ts). */
  related: string[];
};

export const services: Service[] = [
  {
    slug: "consultation",
    icon: "stethoscope",
    image: "consultation-notes",
    imageAlt: {
      ar: "طبيب يدوّن ملاحظات أثناء استشارة مع مريض (صورة توضيحية)",
      en: "A doctor taking notes during a consultation with a patient (illustrative photo)",
    },
    status: "draft",
    title: { ar: "استشارة جراحة القلب والرأي الثاني", en: "Cardiac surgical consultation & second opinion" },
    short: {
      ar: "جلسة مخصّصة لمراجعة حالتك وفحوصاتك، وشرح الخيارات المتاحة بلغة واضحة قبل أي قرار.",
      en: "A dedicated session to review your condition and test results, and explain the available options in plain language before any decision.",
    },
    body: {
      ar: [
        "تبدأ الرعاية الجيدة بفهم كامل للحالة. في الاستشارة تُراجَع قصتك المرضية ونتائج الفحوصات والتقارير السابقة، ونناقش معك ما تعنيه بالنسبة لقلبك.",
        "إذا كانت لديك توصية سابقة بإجراء جراحي، فقد تكون الاستشارة فرصة للحصول على رأي ثانٍ يساعدك على اتخاذ قرارك وأنت مطمئن.",
      ],
      en: [
        "Good care starts with fully understanding your situation. A consultation reviews your history, test results, and previous reports, and discusses what they mean for your heart.",
        "If surgery has already been recommended to you, the consultation can be an opportunity for a second opinion that helps you decide with confidence.",
      ],
    },
    points: {
      ar: [
        "مراجعة التقارير والفحوصات وصور القلب",
        "شرح الخيارات العلاجية ومزايا كل منها ومخاطره",
        "وقت كافٍ لأسئلتك وأسئلة أسرتك",
        "تحديد الخطوات التالية بوضوح",
      ],
      en: [
        "Review of reports, tests, and cardiac imaging",
        "Treatment options explained, with their benefits and risks",
        "Time for your questions and your family's",
        "Clear next steps",
      ],
    },
    related: ["preparing-for-heart-surgery", "what-is-hybrid-cardiac-surgery"],
  },
  {
    slug: "coronary-artery-surgery",
    icon: "heart-pulse",
    image: "modern-or",
    imageAlt: {
      ar: "فريق جراحي يعمل في غرفة عمليات حديثة (صورة توضيحية)",
      en: "A surgical team working in a modern operating room (illustrative photo)",
    },
    status: "draft",
    title: { ar: "جراحة الشرايين التاجية", en: "Coronary artery surgery" },
    short: {
      ar: "تقييم الحالات التي قد تحتاج إلى جراحة لتحسين تدفّق الدم إلى عضلة القلب، مثل عمليات تحويل مسار الشرايين (الترقيع).",
      en: "Evaluation of cases that may need surgery to restore blood flow to the heart muscle, such as coronary artery bypass grafting (CABG).",
    },
    body: {
      ar: [
        "يحدث مرض الشرايين التاجية عندما تضيق الشرايين المغذية لعضلة القلب بسبب الترسّبات. يُعالَج كثير من المرضى بالأدوية أو بالقسطرة، بينما تكون الجراحة الخيار الأنسب في حالات أخرى.",
        "يعتمد القرار على عدد الشرايين المصابة ومواقعها، وكفاءة عضلة القلب، والحالة الصحية العامة، ويُتخذ بالتشاور مع طبيب القلب المعالج.",
      ],
      en: [
        "Coronary artery disease develops when the arteries supplying the heart muscle narrow because of plaque build-up. Many patients are treated with medication or catheter-based procedures; for others, surgery is the most suitable option.",
        "The decision depends on how many arteries are affected and where, how well the heart muscle is working, and your overall health — and it is made together with your treating cardiologist.",
      ],
    },
    points: {
      ar: [
        "مراجعة نتائج القسطرة التشخيصية",
        "مناقشة جراحة الترقيع مقارنةً بالبدائل",
        "التحضير للجراحة والمتابعة بعدها",
      ],
      en: [
        "Review of diagnostic angiography results",
        "Bypass surgery discussed alongside the alternatives",
        "Preparation for surgery and follow-up afterwards",
      ],
    },
    related: ["understanding-coronary-artery-disease", "recovery-after-heart-surgery"],
  },
  {
    slug: "heart-valves",
    icon: "activity",
    image: "heart-model",
    imageAlt: {
      ar: "مجسّم تشريحي للقلب يوضح الصمامات والأوعية",
      en: "An anatomical heart model showing the valves and vessels",
    },
    status: "draft",
    title: { ar: "أمراض صمامات القلب", en: "Heart valve disease" },
    short: {
      ar: "تقييم ضيق الصمامات أو ارتجاعها، ومناقشة خيارات الإصلاح أو الاستبدال المناسبة لكل حالة.",
      en: "Assessment of narrowed or leaking valves, and discussion of the repair or replacement options suited to each case.",
    },
    body: {
      ar: [
        "تعمل صمامات القلب الأربعة على توجيه الدم في الاتجاه الصحيح. عندما يضيق الصمام أو لا ينغلق جيدًا، قد يضطر القلب إلى بذل جهد أكبر مع مرور الوقت.",
        "يتدرّج العلاج من المتابعة الدورية، إلى الإصلاح الجراحي، أو الاستبدال بصمام ميكانيكي أو نسيجي، وفي بعض الحالات الإجراءات عبر القسطرة. ويُحدَّد الأنسب وفق الصمام المصاب ودرجة الإصابة والعمر والحالة العامة.",
      ],
      en: [
        "The heart's four valves keep blood moving in the right direction. When a valve narrows or does not close properly, the heart may have to work harder over time.",
        "Treatment ranges from regular monitoring to surgical repair, replacement with a mechanical or tissue valve and, in some cases, catheter-based procedures. The right choice depends on the valve involved, the severity, your age, and your overall condition.",
      ],
    },
    points: {
      ar: ["قراءة متأنية لتقرير الموجات الصوتية (الإيكو)", "مقارنة خيارات الإصلاح والاستبدال", "خطة متابعة واضحة"],
      en: ["A careful review of your echocardiogram", "Repair and replacement options compared", "A clear follow-up plan"],
    },
    related: ["heart-valve-disease-signs"],
  },
  {
    slug: "hybrid-procedures",
    icon: "combine",
    image: "hybrid-cathlab",
    imageAlt: {
      ar: "غرفة عمليات هجينة مجهّزة بجهاز تصوير للقلب والأوعية",
      en: "A hybrid operating room equipped with cardiovascular imaging",
    },
    status: "draft",
    title: { ar: "الجراحات الهجينة والتدخّل المحدود", en: "Hybrid & minimally invasive approaches" },
    short: {
      ar: "مقاربات تجمع بين الجراحة وتقنيات القسطرة عندما تلائم الحالة، بهدف علاج فعّال بأقل تدخّل ممكن.",
      en: "Approaches that combine surgery with catheter-based techniques when they suit the case, aiming for effective treatment with as little intervention as possible.",
    },
    body: {
      ar: [
        "تجمع الجراحة الهجينة بين خبرة جراحة القلب وتقنيات القسطرة في خطة علاج واحدة، وقد تُجرى في غرفة عمليات مجهّزة بأجهزة التصوير.",
        "لا تناسب هذه المقاربات كل المرضى؛ لذلك تُقيَّم كل حالة بعناية لاختيار الطريق الأكثر أمانًا وفاعلية لها.",
      ],
      en: [
        "Hybrid cardiac surgery brings surgical expertise and catheter-based techniques together in a single treatment plan, sometimes performed in an operating room equipped with advanced imaging.",
        "These approaches are not right for everyone, so each case is assessed carefully to choose the safest and most effective route.",
      ],
    },
    points: {
      ar: [
        "تقييم مدى ملاءمة التقنيات طفيفة التوغّل",
        "تنسيق بين الفريق الجراحي وفريق القسطرة",
        "مناقشة صريحة للفوائد المتوقعة والقيود",
      ],
      en: [
        "Assessment of suitability for less invasive techniques",
        "Coordination between the surgical and catheter teams",
        "An honest discussion of expected benefits and limitations",
      ],
    },
    related: ["what-is-hybrid-cardiac-surgery"],
  },
  {
    slug: "aortic-disease",
    icon: "waypoints",
    image: "or-monochrome",
    imageAlt: {
      ar: "غرفة عمليات مجهّزة بشاشات المراقبة وأجهزة التصوير (صورة توضيحية)",
      en: "An operating room equipped with monitoring screens and imaging equipment (illustrative photo)",
    },
    status: "draft",
    title: { ar: "أمراض الشريان الأورطي", en: "Aortic disease" },
    short: {
      ar: "تقييم تمدّد الشريان الأورطي وأمراضه، مع المتابعة أو التخطيط الجراحي حين يلزم.",
      en: "Assessment of aortic enlargement (aneurysm) and related conditions, with monitoring or surgical planning when needed.",
    },
    body: {
      ar: [
        "الشريان الأورطي هو أكبر شرايين الجسم. قد يتمدّد جزء منه دون أعراض واضحة، ويُكتشف أحيانًا مصادفةً أثناء فحوصات أخرى.",
        "تعتمد الخطة على حجم التمدّد وموقعه وسرعة تغيّره، وتتراوح بين المتابعة الدورية بالأشعة والتدخّل الجراحي في الوقت المناسب.",
      ],
      en: [
        "The aorta is the body's largest artery. Part of it can enlarge without obvious symptoms and is sometimes found by chance during other scans.",
        "The plan depends on the size, location, and rate of change of the enlargement, ranging from regular imaging follow-up to timely surgical treatment.",
      ],
    },
    points: {
      ar: ["مراجعة صور الأشعة المقطعية أو الرنين", "جدول متابعة دورية محدد", "مناقشة توقيت الجراحة عند الحاجة"],
      en: ["Review of CT or MRI imaging", "A defined follow-up schedule", "Discussion of surgical timing when needed"],
    },
    related: ["what-is-hybrid-cardiac-surgery"],
  },
  {
    slug: "surgical-journey",
    icon: "clipboard-check",
    image: "care-tablet",
    imageAlt: {
      ar: "فريق رعاية يراجع خطة المتابعة على جهاز لوحي (صورة توضيحية)",
      en: "A care team reviewing a follow-up plan on a tablet (illustrative photo)",
    },
    status: "draft",
    title: { ar: "التحضير للجراحة والمتابعة بعدها", en: "Surgical preparation & recovery" },
    short: {
      ar: "إرشاد واضح قبل العملية، ومتابعة منظَّمة بعدها لدعم تعافٍ آمن وعودة تدريجية للحياة اليومية.",
      en: "Clear guidance before surgery and structured follow-up afterwards, supporting a safe recovery and a gradual return to daily life.",
    },
    body: {
      ar: [
        "الاستعداد الجيد يخفّف القلق ويدعم تعافيًا أفضل. نوضّح لك ولأسرتك ما يحدث قبل العملية ويومها وخلال فترة الإقامة بالمستشفى.",
        "بعد الخروج، تساعد مواعيد المتابعة على مراقبة التئام الجرح وضبط الأدوية ووضع خطة تدريجية للنشاط، وقد يشمل ذلك برنامجًا للتأهيل القلبي.",
      ],
      en: [
        "Good preparation eases anxiety and supports a better recovery. You and your family will know what happens before surgery, on the day, and during the hospital stay.",
        "After discharge, follow-up visits help monitor wound healing, adjust medication, and plan a gradual return to activity — which may include a cardiac rehabilitation programme.",
      ],
    },
    points: {
      ar: ["قائمة تحضير مكتوبة قبل العملية", "متابعة الجرح والأدوية بعد الخروج", "توجيه نحو برامج التأهيل القلبي"],
      en: ["A written pre-surgery checklist", "Wound and medication follow-up after discharge", "Guidance towards cardiac rehabilitation"],
    },
    related: ["preparing-for-heart-surgery", "recovery-after-heart-surgery"],
  },
];
