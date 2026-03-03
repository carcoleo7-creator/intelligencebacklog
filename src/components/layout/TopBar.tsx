"use client";

import { IngestDialog } from "@/components/ingest/IngestDialog";

export function TopBar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 shrink-0">
      <IngestDialog />
    </header>
  );
}
