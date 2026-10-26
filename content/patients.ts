import type { L10n } from "@/lib/i18n";

/**
 * GENUINE patient testimonials only, published with the patient's written consent.
 * Leave empty until real, consented reviews are supplied — the page shows an honest empty state
 * and the home page omits the testimonials section entirely.
 */
export type Testimonial = {
  quote: L10n;
  /** Name or initials exactly as the patient agreed to be identified. */
  attribution: L10n;
  /** Optional context the patient agreed to share, e.g. "Valve repair, 2025". */
  context?: L10n;
  /** Where the review was originally given (e.g. "Google review"), if applicable. */
  source?: string;
};

export const testimonials: Testimonial[] = [];

export type Faq = { q: string; a: string[] };
export type FaqGroup = { id: string; title: string; items: Faq[] };

const patientsAr = {
  meta: {
    title: "آراء المرضى والأسئلة الشائعة",
    description: "إجابات عن الأسئلة الشائعة حول الحجز والاستشارة والتحضير لجراحة القلب والتعافي بعدها، وآراء المرضى الموثّقة.",
  },
  hero: {
    eyebrow: "آراء وأسئلة",
    title: "أسئلتك تهمّنا، وتجاربكم تُلهمنا",
    lead: "إجابات واضحة عن أكثر الأسئلة تكرارًا، ومساحة لتجارب المرضى الموثّقة.",
    imageAlt: "سمّاعة طبية وقلب أحمر على سطح فاتح",
  },
  reviews: {
    eyebrow: "تجارب المرضى",
    title: "قصص حقيقية فقط",
    emptyTitle: "تُنشر تجارب المرضى هنا بموافقتهم",
    emptyText:
      "نلتزم بنشر آراء المرضى الحقيقية فقط، بعد الحصول على موافقتهم الكتابية ودون تعديل في كلماتهم. ستظهر التجارب الموثّقة في هذا القسم قريبًا.",
    shareTitle: "هل كنت من مرضانا؟",
    shareText: "يسعدنا أن تشاركنا تجربتك؛ فقد تكون عونًا لمريض آخر يستعد لرحلته.",
    shareCta: "شاركنا تجربتك",
  },
  faq: {
    eyebrow: "الأسئلة الشائعة",
    title: "إجابات واضحة قبل موعدك",
    lead: "معلومات عامة لمساعدتك على الاستعداد. للحالات الخاصة، تبقى الاستشارة المباشرة هي المرجع.",
  },
  groups: [
    {
      id: "appointments",
      title: "الحجز والاستشارة",
      items: [
        {
          q: "كيف أحجز استشارة؟",
          a: ["يمكنك الحجز عبر قنوات التواصل الموضحة في صفحة «تواصل». يُفضّل أن تذكر سبب الاستشارة باختصار، وأن تجهّز تقاريرك قبل الموعد."],
        },
        {
          q: "هل أحتاج إلى تحويل من طبيب القلب؟",
          a: [
            "يُرجى التواصل مع العيادة للتأكد من متطلبات الحجز الحالية. وإذا كان لديك خطاب تحويل أو تقارير من طبيب القلب المعالج، فاحرص على إحضارها؛ فهي تساعد على الاستفادة القصوى من وقت الاستشارة.",
          ],
        },
        {
          q: "ماذا أُحضر معي إلى الاستشارة الأولى؟",
          a: [
            "التقارير الطبية السابقة، ونتائج التحاليل، وتقارير وصور الموجات الصوتية والأشعة والقسطرة (والأسطوانات إن وُجدت)، وقائمة بجميع أدويتك وجرعاتها، وقائمة بأسئلتك. ويمكنك اصطحاب أحد أفراد أسرتك.",
          ],
        },
        {
          q: "هل يمكنني الحصول على رأي ثانٍ قبل الجراحة؟",
          a: [
            "طلب رأي ثانٍ قبل جراحة القلب خطوة مفهومة ومشروعة يلجأ إليها كثير من المرضى. تواصل مع العيادة لترتيب استشارة، واحرص على إحضار جميع تقاريرك وفحوصاتك.",
          ],
        },
      ],
    },
    {
      id: "surgery",
      title: "الجراحة والتعافي",
      items: [
        {
          q: "كيف أستعد لجراحة القلب؟",
          a: [
            "سيحدد لك الفريق الفحوصات المطلوبة وتعليمات الأدوية والصيام. ومن الخطوات المفيدة عمومًا: التوقف عن التدخين، وترتيب الدعم في المنزل، وتدوين أسئلتك. لا توقف أي دواء دون تعليمات واضحة.",
            "اقرأ أيضًا مقال «الاستعداد لجراحة القلب» في مكتبة القلب.",
          ],
        },
        {
          q: "كم يستغرق التعافي بعد جراحة القلب؟",
          a: [
            "يختلف ذلك حسب نوع الجراحة والحالة الصحية. يعود كثير من المرضى إلى المنزل بعد نحو أسبوع من جراحة القلب المفتوح، ويستعيدون نشاطهم تدريجيًا على مدى أسابيع، وقد يستغرق التعافي الكامل شهرين إلى ثلاثة أشهر. يقدّم لك فريقك المعالج الإرشادات الخاصة بحالتك.",
          ],
        },
        {
          q: "ما الجراحة الهجينة، وهل تناسب حالتي؟",
          a: [
            "هي مقاربة تجمع بين الجراحة وتقنيات القسطرة في خطة واحدة. لا تناسب جميع المرضى، ويُحدَّد مدى ملاءمتها بعد تقييم الحالة والفحوصات.",
          ],
        },
      ],
    },
    {
      id: "information",
      title: "معلومات مهمة",
      items: [
        {
          q: "هل المعلومات في هذا الموقع بديل عن الاستشارة الطبية؟",
          a: ["لا. المحتوى للتثقيف الصحي العام فقط، ولا يُغني عن الاستشارة المباشرة أو التشخيص أو العلاج المناسب لحالتك."],
        },
        {
          q: "ماذا أفعل إذا شعرت بألم في الصدر الآن؟",
          a: [
            "ألم الصدر الشديد أو المفاجئ، أو المصحوب بضيق تنفّس أو عرق أو غثيان، حالة طارئة. اتصل بالإسعاف فورًا (123 في مصر) أو توجّه إلى أقرب قسم طوارئ، ولا تنتظر موعدًا في العيادة.",
          ],
        },
      ],
    },
  ] satisfies FaqGroup[] as FaqGroup[],
};

export const patients: L10n<typeof patientsAr> = {
  ar: patientsAr,
  en: {
    meta: {
      title: "Patient reviews & FAQ",
      description:
        "Answers to common questions about booking, consultations, preparing for heart surgery, and recovery — plus verified patient reviews.",
    },
    hero: {
      eyebrow: "Reviews & FAQ",
      title: "Your questions matter. Your stories inspire.",
      lead: "Clear answers to the questions we hear most often, and a space for verified patient experiences.",
      imageAlt: "A stethoscope and a red heart on a light surface",
    },
    reviews: {
      eyebrow: "Patient experiences",
      title: "Only real stories",
      emptyTitle: "Patient experiences are published here with consent",
      emptyText:
        "We publish only genuine patient feedback, with written consent and without editing their words. Verified experiences will appear in this section soon.",
      shareTitle: "Were you one of our patients?",
      shareText: "We would be glad to hear about your experience — it may help another patient preparing for their own journey.",
      shareCta: "Share your experience",
    },
    faq: {
      eyebrow: "Frequently asked questions",
      title: "Clear answers before your appointment",
      lead: "General information to help you prepare. For individual cases, a direct consultation is always the reference.",
    },
    groups: [
      {
        id: "appointments",
        title: "Booking & consultations",
        items: [
          {
            q: "How do I book a consultation?",
            a: ["You can book through the channels listed on the Contact page. It helps to mention the reason for the consultation briefly and to have your reports ready before the appointment."],
          },
          {
            q: "Do I need a referral from a cardiologist?",
            a: [
              "Please contact the clinic to confirm current booking requirements. If you have a referral letter or reports from your treating cardiologist, bring them — they help make the most of the consultation.",
            ],
          },
          {
            q: "What should I bring to my first consultation?",
            a: [
              "Previous medical reports, blood test results, echocardiogram, scan and angiogram reports and images (and discs, if any), a list of all your medicines and doses, and your questions. You are welcome to bring a family member.",
            ],
          },
          {
            q: "Can I get a second opinion before surgery?",
            a: [
              "Seeking a second opinion before heart surgery is an understandable and legitimate step that many patients take. Contact the clinic to arrange a consultation, and bring all your reports and investigations.",
            ],
          },
        ],
      },
      {
        id: "surgery",
        title: "Surgery & recovery",
        items: [
          {
            q: "How do I prepare for heart surgery?",
            a: [
              "Your team will specify the tests you need and give instructions on medication and fasting. Helpful general steps include stopping smoking, arranging support at home, and writing down your questions. Never stop a medicine without clear instructions.",
              "See also “Preparing for heart surgery” in the Heart Library.",
            ],
          },
          {
            q: "How long does recovery after heart surgery take?",
            a: [
              "It depends on the type of surgery and your health. Many patients go home about a week after open-heart surgery and build up their activity over several weeks; full recovery often takes around two to three months. Your own team will give guidance specific to you.",
            ],
          },
          {
            q: "What is hybrid surgery, and is it suitable for me?",
            a: [
              "It is an approach that combines surgery with catheter-based techniques in one plan. It does not suit every patient; suitability is decided after assessing your condition and investigations.",
            ],
          },
        ],
      },
      {
        id: "information",
        title: "Important information",
        items: [
          {
            q: "Is the information on this website a substitute for medical advice?",
            a: ["No. The content is general health education only and does not replace a direct consultation, diagnosis, or treatment suited to your case."],
          },
          {
            q: "What should I do if I have chest pain right now?",
            a: [
              "Severe or sudden chest pain, or chest pain with breathlessness, sweating, or nausea, is an emergency. Call an ambulance immediately (123 in Egypt) or go to the nearest emergency department — do not wait for a clinic appointment.",
            ],
          },
        ],
      },
    ],
  },
};
