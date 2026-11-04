"use client";

import { SectionLabel, EmptyState } from "@/components/ui";

export default function InboxPage() {
  return (
    <div className="p-3 bg-[#070707] min-h-full">

      <SectionLabel>Chats</SectionLabel>
      <EmptyState
        title="No direct chats yet."
        subtitle="Mutual following opens a direct conversation."
      />

      <SectionLabel className="mt-6">Message requests</SectionLabel>
      <EmptyState title="No pending requests." />

      <SectionLabel className="mt-6">Archived chats</SectionLabel>
      <EmptyState title="No archived chats." />
    </div>
  );
}
