"use client";

import { Wordmark, Tagline, SectionLabel, EmptyState, Button } from "@/components/ui";

export default function MarketplacePage() {
  return (
    <div className="p-3 bg-[#070707] min-h-screen">
      <div className="mb-3">
        <Wordmark className="text-[22px]" />
        <Tagline />
      </div>

      <SectionLabel>Browse listings</SectionLabel>
      <EmptyState title="No listings yet." subtitle="Be the first to list something for sale." />

      <Button variant="primary" className="w-full mt-4" onClick={() => {}}>
        Create listing
      </Button>
    </div>
  );
}
