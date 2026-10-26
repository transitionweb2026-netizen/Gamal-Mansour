"use client";

import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { Notice } from "@/components/admin/ui";
import { contactSettingsKeys } from "@/lib/cms/admin/settings-groups";

export default function ContactSettingsPage() {
  return (
    <SettingsEditor
      title="Contact information & social links"
      crumb="Contact & social"
      description="One place for every contact detail. The phone number, WhatsApp, email and social links update the header, hero panel, footer, contact page and structured data together."
      keys={contactSettingsKeys}
    >
      <Notice tone="info" className="mb-5" title="Only verified details">
        Enter only confirmed information. While a field is empty the website shows a clear “coming soon” placeholder instead of a link.
      </Notice>
    </SettingsEditor>
  );
}
