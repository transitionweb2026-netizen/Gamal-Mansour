import type { L10n } from "@/lib/i18n";
import type { PhotoName } from "@/lib/photos";

/**
 * Published videos. Add an entry with a real YouTube video ID to show it on the site.
 * Playback uses a click-to-load facade with youtube-nocookie.com — no server or API key needed.
 */
export type Video = {
  youtubeId: string;
  title: L10n;
  description: L10n;
  topic: L10n;
  /** Optional local poster; otherwise YouTube's thumbnail is used. */
  poster?: PhotoName;
  durationLabel?: string;
};

export const videos: Video[] = [];

/** Topics planned for the video library — shown as "in preparation" while `videos` is empty. */
export const plannedTopics: Array<{ title: L10n; text: L10n; image: PhotoName }> = [
  {
    title: { ar: "ماذا يحدث في استشارة جراحة القلب؟", en: "What happens in a cardiac surgery consultation?" },
    text: { ar: "جولة مبسّطة في خطوات الاستشارة الأولى وما تحتاج إلى تجهيزه.", en: "A simple walk-through of the first consultation and what to prepare." },
    image: "consultation-notes",
  },
  {
    title: { ar: "جراحة الترقيع خطوة بخطوة", en: "Bypass surgery, step by step" },
    text: { ar: "كيف تُنشئ الجراحة مسارًا جديدًا للدم حول الشريان الضيق.", en: "How surgery creates a new route for blood around a narrowed artery." },
    image: "ecg-screen",
  },
  {
    title: { ar: "إصلاح الصمام أم استبداله؟", en: "Valve repair or replacement?" },
    text: { ar: "الفرق بين الخيارين، ومتى يُفضَّل كل منهما.", en: "The difference between the two options, and when each is preferred." },
    image: "heart-model-white",
  },
  {
    title: { ar: "الجراحة الهجينة ببساطة", en: "Hybrid surgery, simply explained" },
    text: { ar: "كيف تجتمع الجراحة وتقنيات القسطرة في خطة واحدة.", en: "How surgery and catheter techniques come together in one plan." },
    image: "hybrid-or",
  },
  {
    title: { ar: "أسابيعك الأولى في المنزل", en: "Your first weeks at home" },
    text: { ar: "نصائح عامة للحركة والعناية بالجرح بعد جراحة القلب.", en: "General advice on activity and wound care after heart surgery." },
    image: "stethoscope-heart-light",
  },
  {
    title: { ar: "أسئلة تطرحها قبل الجراحة", en: "Questions to ask before surgery" },
    text: { ar: "قائمة عملية تساعدك على الخروج من الاستشارة بإجابات واضحة.", en: "A practical list to help you leave your consultation with clear answers." },
    image: "stethoscope-heart-dark",
  },
];

const videosPageAr = {
  meta: {
    title: "فيديوهات صحة القلب",
    description: "مكتبة فيديو تثقيفية عن أمراض القلب وجراحاته والتحضير للعمليات والتعافي بعدها — قيد الإعداد.",
  },
  hero: {
    eyebrow: "فيديوهات",
    title: "صحة القلب بالصوت والصورة",
    lead: "شروحات قصيرة وواضحة تساعدك على فهم حالتك والاستعداد لخطوتك التالية.",
  },
  featured: {
    badge: "قيد الإعداد",
    title: "مكتبة الفيديو تُطلق قريبًا",
    text: "نعمل على سلسلة فيديوهات تثقيفية تشرح أمراض القلب وجراحاته بلغة بسيطة. إلى أن تُنشر، تجد في مكتبة القلب مقالات مفصّلة عن الموضوعات نفسها.",
    cta: "اقرأ في مكتبة القلب",
    imageAlt: "شاشة مراقبة تعرض تخطيط القلب",
  },
  planned: {
    eyebrow: "الموضوعات القادمة",
    title: "ما الذي نُعدّه لك",
    badge: "قريبًا",
  },
  published: { eyebrow: "أحدث الفيديوهات", title: "شاهد الآن", play: "تشغيل الفيديو" },
};

export const videosPage: L10n<typeof videosPageAr> = {
  ar: videosPageAr,
  en: {
    meta: {
      title: "Heart health videos",
      description: "An educational video library on heart conditions and surgery, preparing for operations, and recovery — in preparation.",
    },
    hero: {
      eyebrow: "Videos",
      title: "Heart health, seen and heard",
      lead: "Short, clear explanations to help you understand your condition and prepare for your next step.",
    },
    featured: {
      badge: "In preparation",
      title: "The video library launches soon",
      text: "We are preparing a series of educational videos explaining heart conditions and surgery in simple language. Until they are published, the Heart Library has detailed articles on the same topics.",
      cta: "Read the Heart Library",
      imageAlt: "A patient monitor displaying a heart rhythm",
    },
    planned: {
      eyebrow: "Coming up",
      title: "What we are preparing for you",
      badge: "Soon",
    },
    published: { eyebrow: "Latest videos", title: "Watch now", play: "Play video" },
  },
};
