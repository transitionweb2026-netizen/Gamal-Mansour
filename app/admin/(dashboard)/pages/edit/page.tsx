"use client";

import { Suspense } from "react";
import { PageEditor } from "@/components/admin/PageEditor";
import { Spinner } from "@/components/admin/ui";

export default function EditPagePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <PageEditor />
    </Suspense>
  );
}
