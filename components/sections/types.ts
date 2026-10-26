import type { Localize } from "@/lib/cms/core";
import type { Locale } from "@/lib/i18n";

/** Props every page section receives from <PageView>. `c` is the section content in one language. */
export type SectionProps<T> = {
  lang: Locale;
  c: Localize<T>;
  /** Anchor id of the section (its CMS key). */
  sectionId: string;
  /** Anchor id of the next visible section (for "scroll down" cues). */
  nextId?: string;
};
