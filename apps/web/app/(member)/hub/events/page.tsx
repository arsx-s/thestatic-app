"use client";

import { Wordmark, Tagline, SectionLabel, EmptyState } from "@/components/ui";

export default function EventsPage() {
  return (
    <div className="p-3 bg-[#070707] min-h-screen">
      <div className="mb-3">
        <Wordmark className="text-[22px]" />
        <Tagline />
      </div>

      <SectionLabel>Upcoming events</SectionLabel>
      <EmptyState title="No upcoming events." subtitle="Application phases and events are announced here." />
    </div>
  );
}
