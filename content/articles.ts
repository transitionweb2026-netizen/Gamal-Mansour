import type { L10n } from "@/lib/i18n";
import type { PhotoName } from "@/lib/photos";

export type ArticleSection = { heading: string; paragraphs: string[]; bullets?: string[] };

export type Article = {
  slug: string;
  image: PhotoName;
  imageAlt: L10n;
  category: L10n;
  /** ISO date the article was written for the site. */
  published: string;
  readingMinutes: number;
  /**
   * General educational copy written for the launch. It must be reviewed and approved by
   * Dr. Gamal Mansour before being treated as the practice's medical guidance.
   */
  reviewStatus: "pending-medical-review" | "reviewed";
  title: L10n;
  excerpt: L10n;
  takeaways: L10n<string[]>;
  sections: L10n<ArticleSection[]>;
};

export const articles: Article[] = [
  {
    slug: "what-is-hybrid-cardiac-surgery",
    image: "hybrid-or",
    imageAlt: {
      ar: "فريق جراحي في غرفة عمليات مزوّدة بشاشات المراقبة (صورة توضيحية)",
      en: "A surgical team in an operating room fitted with monitoring screens (illustrative photo)",
    },
    category: { ar: "الجراحات", en: "Procedures" },
    published: "2026-10-25",
    readingMinutes: 5,
    reviewStatus: "pending-medical-review",
    title: { ar: "ما هي جراحة القلب الهجينة؟", en: "What is hybrid cardiac surgery?" },
    excerpt: {
      ar: "مقاربة تجمع بين الجراحة التقليدية وتقنيات القسطرة في خطة واحدة. متى تُستخدم، ولمن تناسب؟",
      en: "An approach that combines conventional surgery with catheter-based techniques in one plan. When is it used, and who is it for?",
    },
    takeaways: {
      ar: [
        "تجمع الجراحة الهجينة بين أدوات الجرّاح وتقنيات القسطرة.",
        "قد تُجرى في جلسة واحدة أو على مراحل مخطط لها.",
        "يقرّر فريق القلب مدى ملاءمتها لكل مريض على حدة.",
      ],
      en: [
        "Hybrid surgery combines surgical tools with catheter-based techniques.",
        "It can take place in one session or in planned stages.",
        "A heart team decides whether it suits each individual patient.",
      ],
    },
    sections: {
      ar: [
        {
          heading: "فكرة الجمع بين طريقتين",
          paragraphs: [
            "لسنوات طويلة كان علاج كثير من أمراض القلب يسلك أحد طريقين: الجراحة التي يصل فيها الجرّاح إلى القلب مباشرة، أو القسطرة التي تُعالج فيها المشكلة من داخل الأوعية الدموية عبر أنبوب رفيع. تقوم الجراحة الهجينة على الاستفادة من الطريقتين معًا، بحيث تُستخدم لكل جزء من المشكلة الأداة الأنسب له.",
          ],
        },
        {
          heading: "كيف تُجرى؟",
          paragraphs: [
            "تُجرى بعض الإجراءات الهجينة في «غرفة عمليات هجينة» تجمع تجهيزات غرفة العمليات وأجهزة التصوير المتقدّمة في مكان واحد، فيتمكّن الفريق من الجراحة والتصوير والقسطرة في الجلسة نفسها. وفي حالات أخرى تُقسَّم الخطة إلى مرحلتين متتاليتين بينهما فترة زمنية يحدّدها الفريق.",
          ],
          bullets: [
            "مرض الشرايين التاجية: قد يُجمع بين ترقيع شريان رئيسي جراحيًا ووضع دعامات في شرايين أخرى.",
            "أمراض الشريان الأورطي: قد تُدمج الجراحة المفتوحة مع دعامات الأوعية الداخلية.",
            "بعض أمراض الصمامات: قد تُستكمل الجراحة بإجراءات عبر القسطرة.",
          ],
        },
        {
          heading: "ما المزايا المحتملة؟",
          paragraphs: [
            "لدى المرضى المناسبين، قد تتيح المقاربة الهجينة جروحًا أصغر أو تقليل حجم التدخّل الجراحي، مع الحفاظ على فاعلية العلاج. لكن المزايا تختلف من حالة إلى أخرى، ولا تُعدّ الجراحة الهجينة الخيار الأفضل تلقائيًا.",
          ],
        },
        {
          heading: "هل تناسبني؟",
          paragraphs: [
            "يعتمد ذلك على طبيعة المرض وتشريح الأوعية والحالة الصحية العامة ونتائج الفحوصات. لهذا تُناقَش هذه الحالات عادةً ضمن «فريق القلب» الذي يضم الجرّاح وطبيب القلب التداخلي، ليصلا مع المريض إلى الخيار الأكثر أمانًا وفاعلية.",
            "إذا كانت لديك أسئلة عن ملاءمة هذه المقاربة لحالتك، فاحمل تقاريرك وفحوصاتك إلى الاستشارة لمناقشتها بالتفصيل.",
          ],
        },
      ],
      en: [
        {
          heading: "Bringing two approaches together",
          paragraphs: [
            "For many years, treating many heart conditions followed one of two paths: surgery, in which the surgeon reaches the heart directly, or catheter-based treatment, in which the problem is treated from inside the blood vessels through a thin tube. Hybrid surgery draws on both, so each part of the problem is treated with the most suitable tool.",
          ],
        },
        {
          heading: "How is it performed?",
          paragraphs: [
            "Some hybrid procedures take place in a hybrid operating room, which combines a full surgical suite with advanced imaging so the team can operate, image, and use catheters in the same session. In other cases the plan is divided into two stages separated by an interval the team decides on.",
          ],
          bullets: [
            "Coronary artery disease: surgical bypass of a key artery may be combined with stents in other arteries.",
            "Aortic disease: open surgery may be combined with stent grafts placed inside the vessel.",
            "Some valve conditions: surgery may be complemented by catheter-based procedures.",
          ],
        },
        {
          heading: "What are the potential benefits?",
          paragraphs: [
            "For suitable patients, a hybrid approach may allow smaller incisions or a less extensive operation while keeping treatment effective. The benefits vary from case to case, however, and hybrid surgery is not automatically the best choice.",
          ],
        },
        {
          heading: "Is it right for me?",
          paragraphs: [
            "That depends on the condition, the anatomy of your vessels, your overall health, and your test results. These cases are usually discussed by a heart team — including the surgeon and the interventional cardiologist — who agree with the patient on the safest and most effective option.",
            "If you have questions about whether this approach could suit you, bring your reports and investigations to a consultation so they can be discussed in detail.",
          ],
        },
      ],
    },
  },
  {
    slug: "understanding-coronary-artery-disease",
    image: "ecg-monitor",
    imageAlt: {
      ar: "شاشة مراقبة تعرض تخطيط نبضات القلب",
      en: "A patient monitor displaying a heart rhythm trace",
    },
    category: { ar: "أمراض القلب", en: "Heart conditions" },
    published: "2026-10-25",
    readingMinutes: 6,
    reviewStatus: "pending-medical-review",
    title: { ar: "فهم مرض الشرايين التاجية", en: "Understanding coronary artery disease" },
    excerpt: {
      ar: "ما الذي يحدث عندما تضيق شرايين القلب؟ تعرّف على الأعراض وعوامل الخطورة وطرق التشخيص والعلاج.",
      en: "What happens when the heart's arteries narrow? Learn about symptoms, risk factors, diagnosis, and treatment options.",
    },
    takeaways: {
      ar: [
        "ينتج المرض عن ترسّبات تضيّق الشرايين المغذية لعضلة القلب.",
        "قد تظهر الأعراض مع المجهود، وقد يبقى المرض صامتًا.",
        "العلاج يشمل نمط الحياة والأدوية والقسطرة أو الجراحة.",
      ],
      en: [
        "The disease is caused by plaque narrowing the arteries that feed the heart muscle.",
        "Symptoms may appear with exertion — or the disease may stay silent.",
        "Treatment includes lifestyle, medication, catheter procedures, or surgery.",
      ],
    },
    sections: {
      ar: [
        {
          heading: "ما هو مرض الشرايين التاجية؟",
          paragraphs: [
            "الشرايين التاجية أوعية دموية تحيط بالقلب وتمدّ عضلته بالأكسجين. مع الوقت قد تتراكم على جدرانها ترسّبات من الدهون والكوليسترول ومواد أخرى، فتضيق الشرايين ويقلّ تدفّق الدم إلى عضلة القلب، خاصةً عند المجهود.",
          ],
        },
        {
          heading: "الأعراض الشائعة",
          paragraphs: ["تختلف الأعراض بين شخص وآخر، ومن أكثرها شيوعًا:"],
          bullets: [
            "ألم أو ضغط أو ثقل في الصدر، يظهر غالبًا مع المجهود ويتحسّن بالراحة.",
            "ضيق في التنفّس أو إرهاق غير معتاد.",
            "ألم يمتد إلى الذراع أو الرقبة أو الفك أو الظهر.",
          ],
        },
        {
          heading: "عوامل الخطورة",
          paragraphs: [
            "تزيد بعض العوامل من احتمال الإصابة، منها: التدخين، وارتفاع ضغط الدم، وارتفاع الكوليسترول، والسكري، وزيادة الوزن، وقلة النشاط البدني، والتاريخ العائلي لأمراض القلب، والتقدّم في العمر. والخبر الجيد أن كثيرًا من هذه العوامل يمكن التحكم فيه.",
          ],
        },
        {
          heading: "كيف يُشخَّص؟",
          paragraphs: [
            "يبدأ التشخيص بالتاريخ المرضي والفحص السريري، وقد يشمل رسم القلب، واختبار المجهود، والموجات الصوتية على القلب، والأشعة المقطعية على الشرايين التاجية، أو القسطرة التشخيصية التي تُظهر أماكن الضيق ودرجته بدقة.",
          ],
        },
        {
          heading: "خيارات العلاج",
          paragraphs: [
            "يعتمد العلاج على شدة الحالة. فقد يكفي تعديل نمط الحياة والأدوية، أو قد يحتاج المريض إلى توسيع الشريان بالقسطرة وتركيب دعامة، أو إلى جراحة تحويل مسار الشرايين (الترقيع) التي تُنشئ مسارًا جديدًا للدم يتجاوز الجزء الضيق. ويُتخذ القرار بعد مناقشة مزايا كل خيار ومخاطره.",
          ],
        },
        {
          heading: "متى تطلب المساعدة فورًا؟",
          paragraphs: [
            "إذا شعرت بألم شديد في الصدر يستمر أكثر من بضع دقائق، أو يصاحبه عرق أو غثيان أو ضيق تنفّس، فاتصل بالإسعاف فورًا أو توجّه إلى أقرب قسم طوارئ.",
          ],
        },
      ],
      en: [
        {
          heading: "What is coronary artery disease?",
          paragraphs: [
            "The coronary arteries wrap around the heart and supply its muscle with oxygen. Over time, fat, cholesterol, and other substances can build up in their walls as plaque. The arteries narrow and less blood reaches the heart muscle — especially during exertion.",
          ],
        },
        {
          heading: "Common symptoms",
          paragraphs: ["Symptoms vary from person to person. Among the most common are:"],
          bullets: [
            "Chest pain, pressure, or heaviness — often with exertion and easing with rest.",
            "Shortness of breath or unusual tiredness.",
            "Pain spreading to the arm, neck, jaw, or back.",
          ],
        },
        {
          heading: "Risk factors",
          paragraphs: [
            "Several factors raise the risk, including smoking, high blood pressure, high cholesterol, diabetes, excess weight, physical inactivity, a family history of heart disease, and increasing age. The good news is that many of these can be controlled.",
          ],
        },
        {
          heading: "How is it diagnosed?",
          paragraphs: [
            "Diagnosis starts with your history and an examination, and may include an ECG, an exercise test, an echocardiogram, a CT scan of the coronary arteries, or a diagnostic angiogram that shows exactly where narrowings are and how severe they are.",
          ],
        },
        {
          heading: "Treatment options",
          paragraphs: [
            "Treatment depends on severity. Lifestyle changes and medication may be enough; some patients need a narrowed artery opened with a catheter and a stent, and others need coronary artery bypass surgery, which creates a new route for blood around the narrowed section. The decision follows a discussion of each option's benefits and risks.",
          ],
        },
        {
          heading: "When to seek help immediately",
          paragraphs: [
            "If you have severe chest pain lasting more than a few minutes, or chest pain with sweating, nausea, or breathlessness, call an ambulance immediately or go to the nearest emergency department.",
          ],
        },
      ],
    },
  },
  {
    slug: "preparing-for-heart-surgery",
    image: "stethoscope-hands",
    imageAlt: {
      ar: "يدا طبيب تمسكان سمّاعة طبية",
      en: "A doctor's hands holding a stethoscope",
    },
    category: { ar: "قبل الجراحة", en: "Before surgery" },
    published: "2026-10-25",
    readingMinutes: 5,
    reviewStatus: "pending-medical-review",
    title: { ar: "الاستعداد لجراحة القلب: دليل عملي", en: "Preparing for heart surgery: a practical guide" },
    excerpt: {
      ar: "خطوات بسيطة قبل العملية تخفّف القلق وتدعم تعافيًا أفضل: الفحوصات، والأدوية، وترتيبات المنزل، والأسئلة المهمة.",
      en: "Simple steps before an operation that ease anxiety and support recovery: tests, medication, home arrangements, and the questions worth asking.",
    },
    takeaways: {
      ar: [
        "اتبع تعليمات فريقك بشأن الأدوية، ولا توقف أي دواء من تلقاء نفسك.",
        "التوقف عن التدخين قبل الجراحة يدعم التعافي.",
        "رتّب الدعم في المنزل مسبقًا.",
      ],
      en: [
        "Follow your team's instructions on medication — never stop a medicine on your own.",
        "Stopping smoking before surgery supports recovery.",
        "Arrange support at home in advance.",
      ],
    },
    sections: {
      ar: [
        {
          heading: "الفحوصات قبل العملية",
          paragraphs: [
            "يطلب الفريق عادةً مجموعة من الفحوصات لتقييم حالتك والتخطيط للجراحة بأمان، مثل تحاليل الدم، ورسم القلب، وأشعة الصدر، والموجات الصوتية على القلب. وقبل جراحات الصمامات قد يُطلب أيضًا فحص الأسنان وعلاج أي التهاب فيها للحد من خطر العدوى.",
          ],
        },
        {
          heading: "مراجعة الأدوية",
          paragraphs: [
            "أحضر قائمة بجميع أدويتك، بما فيها المكمّلات والأعشاب. بعض الأدوية، مثل مميّعات الدم، قد تحتاج إلى إيقاف أو تعديل قبل العملية بفترة يحددها الطبيب. لا توقف أي دواء ولا تغيّر جرعته دون تعليمات واضحة من فريقك.",
          ],
        },
        {
          heading: "خطوات تدعم تعافيك",
          paragraphs: ["ما تفعله في الأسابيع السابقة للعملية يمكن أن يُحدث فرقًا:"],
          bullets: [
            "التوقف عن التدخين في أقرب وقت ممكن.",
            "الحفاظ على نشاط خفيف يناسب حالتك وفق نصيحة طبيبك.",
            "تناول طعام متوازن والحفاظ على ضبط السكر إن كنت مصابًا بالسكري.",
            "ترتيب من يساعدك في المنزل خلال الأسابيع الأولى بعد الخروج.",
          ],
        },
        {
          heading: "أسئلة تستحق أن تطرحها",
          paragraphs: ["دوّن أسئلتك قبل الموعد، ومنها مثلًا:"],
          bullets: [
            "ما الإجراء المقترح بالتحديد؟ وما البدائل؟",
            "ما الفوائد المتوقعة والمخاطر المحتملة في حالتي؟",
            "كم ستستغرق الإقامة في المستشفى تقريبًا؟",
            "ما الذي أحتاج إلى تجنّبه بعد العودة إلى المنزل؟",
          ],
        },
        {
          heading: "يوم العملية",
          paragraphs: [
            "سيخبرك الفريق بموعد التوقف عن الأكل والشرب، وبالأدوية التي تتناولها صباح العملية. اصطحب ملابس مريحة، وقائمة أدويتك، وأرقام التواصل مع أسرتك. ومن الطبيعي أن تشعر بالقلق؛ فلا تتردد في مشاركة مخاوفك مع الفريق.",
          ],
        },
      ],
      en: [
        {
          heading: "Tests before the operation",
          paragraphs: [
            "Your team will usually arrange tests to assess your condition and plan surgery safely, such as blood tests, an ECG, a chest X-ray, and an echocardiogram. Before valve surgery, a dental check may also be requested so any infection can be treated first, reducing the risk of infection afterwards.",
          ],
        },
        {
          heading: "Reviewing your medication",
          paragraphs: [
            "Bring a list of all your medicines, including supplements and herbal products. Some medicines, such as blood thinners, may need to be stopped or adjusted for a period before surgery that your doctor will specify. Never stop a medicine or change its dose without clear instructions from your team.",
          ],
        },
        {
          heading: "Steps that support your recovery",
          paragraphs: ["What you do in the weeks before surgery can make a difference:"],
          bullets: [
            "Stop smoking as soon as possible.",
            "Stay gently active in a way that suits your condition, as your doctor advises.",
            "Eat a balanced diet and keep blood sugar under control if you have diabetes.",
            "Arrange for someone to help at home during the first weeks after discharge.",
          ],
        },
        {
          heading: "Questions worth asking",
          paragraphs: ["Write your questions down before the appointment — for example:"],
          bullets: [
            "What exactly is the proposed procedure, and what are the alternatives?",
            "What benefits and risks should I expect in my case?",
            "Roughly how long will I stay in hospital?",
            "What should I avoid once I am home?",
          ],
        },
        {
          heading: "The day of surgery",
          paragraphs: [
            "Your team will tell you when to stop eating and drinking and which medicines to take on the morning of surgery. Bring comfortable clothes, your medication list, and your family's contact numbers. Feeling anxious is normal — share your worries with the team.",
          ],
        },
      ],
    },
  },
  {
    slug: "recovery-after-heart-surgery",
    image: "walking-park",
    imageAlt: {
      ar: "شخصان يمشيان في حديقة خضراء",
      en: "Two people walking in a green park",
    },
    category: { ar: "بعد الجراحة", en: "After surgery" },
    published: "2026-10-25",
    readingMinutes: 6,
    reviewStatus: "pending-medical-review",
    title: { ar: "التعافي بعد جراحة القلب: الأسابيع الأولى في المنزل", en: "Recovery after heart surgery: the first weeks at home" },
    excerpt: {
      ar: "ما الذي يمكن توقّعه بعد العودة إلى المنزل؟ نصائح عامة عن النشاط والعناية بالجرح، والعلامات التي تستدعي التواصل مع فريقك.",
      en: "What to expect once you are home: general advice on activity, wound care, and the signs that mean you should contact your team.",
    },
    takeaways: {
      ar: [
        "التعافي تدريجي ويختلف من شخص لآخر.",
        "المشي اليومي المتزايد تدريجيًا جزء مهم من التعافي.",
        "تعرّف على العلامات التي تستدعي الاتصال بفريقك.",
      ],
      en: [
        "Recovery is gradual and differs from person to person.",
        "Daily walking, increased step by step, is an important part of recovery.",
        "Know the signs that mean you should call your team.",
      ],
    },
    sections: {
      ar: [
        {
          heading: "التعافي رحلة تدريجية",
          paragraphs: [
            "يختلف التعافي حسب نوع الجراحة والحالة الصحية قبلها. يعود كثير من المرضى إلى المنزل بعد نحو أسبوع من جراحة القلب المفتوح، ثم يستعيدون نشاطهم تدريجيًا على مدى الأسابيع التالية، وقد يستغرق التعافي الكامل شهرين إلى ثلاثة أشهر. ويبقى فريقك المعالج المرجع الأول لما يناسب حالتك.",
          ],
        },
        {
          heading: "النشاط والحركة",
          paragraphs: [
            "المشي اليومي من أفضل ما تقدّمه لقلبك في هذه المرحلة؛ ابدأ بمسافات قصيرة وزدها تدريجيًا. إذا أُجريت الجراحة عبر عظمة القص، فستحتاج غالبًا إلى تجنّب رفع الأشياء الثقيلة أو الدفع والسحب بقوة لعدة أسابيع حتى تلتئم العظمة، وسيحدد لك فريقك متى يمكنك القيادة والعودة إلى العمل.",
          ],
        },
        {
          heading: "العناية بالجرح",
          paragraphs: [
            "حافظ على الجرح نظيفًا وجافًا، واتبع تعليمات الاستحمام والعناية التي تُعطى لك عند الخروج. من الطبيعي أن تشعر ببعض الألم أو الشد حول الجرح في البداية.",
          ],
        },
        {
          heading: "متى تتواصل مع فريقك؟",
          paragraphs: ["تواصل مع فريقك الطبي إذا لاحظت أيًا مما يلي:"],
          bullets: [
            "حمّى، أو احمرار أو تورّم أو إفرازات من الجرح.",
            "زيادة ضيق التنفّس أو تورّم القدمين.",
            "خفقان غير معتاد أو دوخة.",
            "ألم في الصدر يختلف عن ألم الجرح المعتاد — وفي هذه الحالة اتصل بالإسعاف فورًا.",
          ],
        },
        {
          heading: "الجانب النفسي والتأهيل القلبي",
          paragraphs: [
            "تقلّب المزاج والتعب وصعوبة النوم أمور شائعة بعد جراحة القلب، وتتحسّن عادةً مع الوقت. وتساعد برامج التأهيل القلبي — التي تجمع التمارين المراقَبة والتثقيف والدعم — كثيرًا من المرضى على استعادة ثقتهم ونشاطهم بأمان.",
          ],
        },
      ],
      en: [
        {
          heading: "Recovery is a gradual journey",
          paragraphs: [
            "Recovery depends on the type of surgery and your health beforehand. Many patients go home about a week after open-heart surgery and build up their activity over the following weeks; full recovery often takes around two to three months. Your own surgical team remains the best guide to what suits you.",
          ],
        },
        {
          heading: "Activity and movement",
          paragraphs: [
            "Daily walking is one of the best things you can do for your heart at this stage — start with short distances and build up gradually. If surgery was performed through the breastbone, you will usually need to avoid heavy lifting and strong pushing or pulling for several weeks while the bone heals. Your team will tell you when you can drive and return to work.",
          ],
        },
        {
          heading: "Caring for your wound",
          paragraphs: [
            "Keep the wound clean and dry, and follow the washing and care instructions you receive at discharge. Some pain or tightness around the wound is normal at first.",
          ],
        },
        {
          heading: "When to contact your team",
          paragraphs: ["Contact your medical team if you notice any of the following:"],
          bullets: [
            "Fever, or redness, swelling, or discharge from the wound.",
            "Increasing breathlessness or swelling of the feet.",
            "Unusual palpitations or dizziness.",
            "Chest pain that differs from the usual wound pain — in that case call an ambulance immediately.",
          ],
        },
        {
          heading: "Emotional recovery and cardiac rehabilitation",
          paragraphs: [
            "Mood swings, tiredness, and difficulty sleeping are common after heart surgery and usually improve with time. Cardiac rehabilitation programmes — combining supervised exercise, education, and support — help many patients regain confidence and activity safely.",
          ],
        },
      ],
    },
  },
  {
    slug: "heart-valve-disease-signs",
    image: "heart-model-white",
    imageAlt: {
      ar: "مجسّم تشريحي للقلب على سطح فاتح",
      en: "An anatomical heart model on a light surface",
    },
    category: { ar: "أمراض القلب", en: "Heart conditions" },
    published: "2026-10-25",
    readingMinutes: 5,
    reviewStatus: "pending-medical-review",
    title: { ar: "أمراض صمامات القلب: علامات تستحق النقاش مع طبيبك", en: "Heart valve disease: signs worth discussing with your doctor" },
    excerpt: {
      ar: "قد تتطور أمراض الصمامات ببطء ودون أعراض واضحة. تعرّف على العلامات الشائعة وطرق المتابعة والعلاج.",
      en: "Valve disease can develop slowly and quietly. Learn the common signs and how it is monitored and treated.",
    },
    takeaways: {
      ar: [
        "قد يكون الصمام ضيقًا (تضيّق) أو لا ينغلق جيدًا (ارتجاع).",
        "الموجات الصوتية على القلب هي الفحص الأساسي للتشخيص والمتابعة.",
        "توقيت التدخّل مهم، والمتابعة المنتظمة تساعد على تحديده.",
      ],
      en: [
        "A valve may be narrowed (stenosis) or fail to close properly (regurgitation).",
        "An echocardiogram is the key test for diagnosis and follow-up.",
        "Timing of treatment matters — regular follow-up helps get it right.",
      ],
    },
    sections: {
      ar: [
        {
          heading: "كيف تعمل الصمامات؟",
          paragraphs: [
            "في القلب أربعة صمامات تفتح وتغلق مع كل نبضة لتضمن سير الدم في اتجاه واحد. قد يصاب الصمام بالتضيّق فلا ينفتح بالكامل، أو بالارتجاع فلا ينغلق جيدًا ويعود جزء من الدم إلى الخلف. وفي الحالتين يبذل القلب جهدًا إضافيًا.",
          ],
        },
        {
          heading: "علامات قد تستحق الانتباه",
          paragraphs: ["لا تظهر أعراض عند كثيرين في المراحل المبكرة، وقد يُكتشف المرض عند سماع الطبيب «لغطًا» في القلب. ومن العلامات التي تستحق النقاش مع طبيبك:"],
          bullets: [
            "ضيق التنفّس مع المجهود أو عند الاستلقاء.",
            "تعب غير معتاد أو تراجع القدرة على النشاط.",
            "ألم أو ضغط في الصدر.",
            "دوخة أو إغماء، أو خفقان.",
            "تورّم الكاحلين أو القدمين.",
          ],
        },
        {
          heading: "التشخيص والمتابعة",
          paragraphs: [
            "الموجات الصوتية على القلب (الإيكو) هي الفحص الأساسي لتقييم الصمامات وتحديد نوع الإصابة ودرجتها. وفي الحالات البسيطة أو المتوسطة قد يكفي التكرار الدوري للفحص لمراقبة أي تغيّر.",
          ],
        },
        {
          heading: "خيارات العلاج",
          paragraphs: [
            "قد تخفّف الأدوية بعض الأعراض، لكنها لا تُصلح الصمام نفسه. وعند الحاجة إلى تدخّل، تشمل الخيارات إصلاح الصمام جراحيًا، أو استبداله بصمام ميكانيكي أو نسيجي، أو — لدى مرضى مختارين — استبداله عبر القسطرة. ويعتمد الاختيار على الصمام المصاب والعمر والحالة العامة وتفضيلات المريض.",
            "العناية بصحة الفم والأسنان مهمة لمرضى الصمامات، لأنها تقلّل خطر انتقال العدوى إلى القلب.",
          ],
        },
      ],
      en: [
        {
          heading: "How do the valves work?",
          paragraphs: [
            "The heart has four valves that open and close with every beat to keep blood flowing in one direction. A valve can become narrowed (stenosis) so it does not open fully, or leaky (regurgitation) so it does not close properly and some blood flows backwards. Either way, the heart works harder.",
          ],
        },
        {
          heading: "Signs that may deserve attention",
          paragraphs: ["Many people have no symptoms in the early stages, and the condition may be found when a doctor hears a heart murmur. Signs worth discussing with your doctor include:"],
          bullets: [
            "Breathlessness on exertion or when lying flat.",
            "Unusual tiredness or reduced ability to stay active.",
            "Chest pain or pressure.",
            "Dizziness, fainting, or palpitations.",
            "Swollen ankles or feet.",
          ],
        },
        {
          heading: "Diagnosis and follow-up",
          paragraphs: [
            "An echocardiogram is the main test for assessing the valves and determining the type and severity of the problem. In mild or moderate cases, repeating the scan at regular intervals may be enough to watch for change.",
          ],
        },
        {
          heading: "Treatment options",
          paragraphs: [
            "Medicines can ease some symptoms but do not repair the valve itself. When treatment is needed, options include surgical repair, replacement with a mechanical or tissue valve, or — for selected patients — replacement through a catheter. The choice depends on the valve involved, age, overall health, and the patient's preferences.",
            "Good dental and oral health matters for people with valve disease, because it reduces the risk of infection reaching the heart.",
          ],
        },
      ],
    },
  },
  {
    slug: "everyday-heart-habits",
    image: "heart-berries",
    imageAlt: {
      ar: "وعاء على شكل قلب مملوء بالفراولة والتوت",
      en: "A heart-shaped bowl filled with strawberries and berries",
    },
    category: { ar: "نمط الحياة", en: "Lifestyle" },
    published: "2026-10-25",
    readingMinutes: 4,
    reviewStatus: "pending-medical-review",
    title: { ar: "عادات يومية تدعم صحة القلب", en: "Everyday habits that support heart health" },
    excerpt: {
      ar: "خطوات صغيرة ومستمرة تصنع فرقًا كبيرًا: الحركة، والطعام، والنوم، ومعرفة أرقامك الصحية.",
      en: "Small, consistent steps make a big difference: movement, food, sleep, and knowing your health numbers.",
    },
    takeaways: {
      ar: ["الإقلاع عن التدخين من أهم ما تقدّمه لقلبك.", "استهدف الحركة المنتظمة معظم أيام الأسبوع.", "اعرف ضغطك والكوليسترول والسكر لديك."],
      en: ["Quitting smoking is one of the best things you can do for your heart.", "Aim for regular movement on most days of the week.", "Know your blood pressure, cholesterol, and blood sugar."],
    },
    sections: {
      ar: [
        {
          heading: "تحرّك أكثر",
          paragraphs: [
            "توصي منظمة الصحة العالمية البالغين بممارسة 150 دقيقة على الأقل أسبوعيًا من النشاط البدني المعتدل، مثل المشي السريع. إذا كنت مصابًا بمرض في القلب أو خضعت لجراحة، فاسأل طبيبك عن مستوى النشاط المناسب لك قبل أن تبدأ.",
          ],
        },
        {
          heading: "اختر طعامك بعناية",
          paragraphs: ["لا يتطلب الطعام الصحي للقلب نظامًا معقدًا، بل اختيارات متكررة مثل:"],
          bullets: [
            "الإكثار من الخضراوات والفواكه والبقوليات والحبوب الكاملة.",
            "تفضيل الأسماك وزيت الزيتون والمكسرات غير المملحة.",
            "تقليل الملح والأطعمة المصنّعة والمشروبات المحلّاة.",
          ],
        },
        {
          heading: "أقلع عن التدخين",
          paragraphs: [
            "التدخين من أقوى عوامل الخطورة لأمراض القلب والأوعية، والإقلاع عنه مفيد في أي عمر. اطلب الدعم من طبيبك؛ فهناك وسائل فعّالة تساعد على الإقلاع.",
          ],
        },
        {
          heading: "اعرف أرقامك",
          paragraphs: [
            "قياس ضغط الدم والكوليسترول وسكر الدم بانتظام يساعد على اكتشاف المشكلات مبكرًا. وإذا وُصفت لك أدوية لهذه الحالات، فتناولها بانتظام كما وصفها طبيبك.",
          ],
        },
        {
          heading: "النوم والضغط النفسي",
          paragraphs: [
            "النوم الكافي وإدارة الضغوط اليومية — بالمشي أو التنفّس الهادئ أو قضاء الوقت مع من تحب — جزء من العناية بالقلب أيضًا.",
          ],
        },
      ],
      en: [
        {
          heading: "Move more",
          paragraphs: [
            "The World Health Organization recommends that adults do at least 150 minutes of moderate physical activity a week, such as brisk walking. If you have a heart condition or have had surgery, ask your doctor what level of activity is right for you before you start.",
          ],
        },
        {
          heading: "Choose your food with care",
          paragraphs: ["Heart-healthy eating does not require a complicated diet — just repeated choices such as:"],
          bullets: [
            "Plenty of vegetables, fruit, legumes, and whole grains.",
            "Favouring fish, olive oil, and unsalted nuts.",
            "Less salt, processed food, and sugary drinks.",
          ],
        },
        {
          heading: "Stop smoking",
          paragraphs: [
            "Smoking is one of the strongest risk factors for heart and blood-vessel disease, and stopping helps at any age. Ask your doctor for support — effective methods exist to help you quit.",
          ],
        },
        {
          heading: "Know your numbers",
          paragraphs: [
            "Checking your blood pressure, cholesterol, and blood sugar regularly helps catch problems early. If you are prescribed medicines for these conditions, take them regularly as prescribed.",
          ],
        },
        {
          heading: "Sleep and stress",
          paragraphs: [
            "Enough sleep and managing daily stress — through walking, calm breathing, or time with people you love — are part of caring for your heart too.",
          ],
        },
      ],
    },
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}
