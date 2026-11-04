"use client";

import { SectionLabel, EmptyState } from "@/components/ui";

export default function StorePage() {
  return (
    <div className="p-3 bg-[#070707] min-h-full">

      <SectionLabel>Catalogue</SectionLabel>
      <EmptyState title="No products yet." subtitle="Merchandise drops appear here when published by administrators." />
    </div>
  );
}
