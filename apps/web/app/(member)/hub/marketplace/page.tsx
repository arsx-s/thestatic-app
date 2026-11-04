"use client";

import { SectionLabel, EmptyState, Button } from "@/components/ui";

export default function MarketplacePage() {
  return (
    <div className="p-3 bg-[#070707] min-h-full">

      <SectionLabel>Browse listings</SectionLabel>
      <EmptyState title="No listings yet." subtitle="Be the first to list something for sale." />

      <Button variant="primary" className="w-full mt-4" onClick={() => {}}>
        Create listing
      </Button>
    </div>
  );
}
