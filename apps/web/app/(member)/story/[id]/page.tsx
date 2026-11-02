"use client";

import { Wordmark, Tagline } from "@/components/ui";

export default function StoryPage() {
  return (
    <div className="p-3 bg-[#070707] min-h-screen">
      <div className="mb-3">
        <Wordmark className="text-[22px]" />
        <Tagline />
      </div>
      <div className="text-[#8b8b8b] font-IBM-Plex-Mono text-[13px]">
        Story viewer &mdash; implementation in progress
      </div>
    </div>
  );
}
