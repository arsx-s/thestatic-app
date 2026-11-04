"use client";

import { SectionLabel, EmptyState } from "@/components/ui";

export default function EventsPage() {
  return (
    <div className="p-3 bg-[#070707] min-h-full">

      <SectionLabel>Upcoming events</SectionLabel>
      <EmptyState title="No upcoming events." subtitle="Application phases and events are announced here." />
    </div>
  );
}
