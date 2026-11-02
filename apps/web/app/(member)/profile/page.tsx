"use client";

import { Wordmark, Tagline, SectionLabel, Card, Avatar, Stat, Chip, Button, EmptyState } from "@/components/ui";

export default function ProfilePage() {
  return (
    <div className="p-3 bg-[#070707] min-h-screen">
      <Card className="mb-4 p-5 text-center">
        <Avatar src={undefined} size={96} />
        <span className="font-Space-Grotesk font-bold text-[20px] text-[#ececec] mt-3 block">
          static.username
        </span>
        <span className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b] tracking-[0.14] uppercase block mt-1">
          STATIC ID / ST-00001
        </span>
        <span className="font-IBM-Plex-Mono text-[11px] text-[#8b8b8b] uppercase block mt-2">
          MEMBER
        </span>
        <p className="font-Inter text-[14px] text-[#c9c9c9] leading-[22px] mt-4">
          Just existing somewhere between music and everything else.
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Stat value="24" label="Posts" />
          <Stat value="95" label="Following" />
          <Stat value="0" label="In Sync" />
        </div>
        <div className="flex gap-2 justify-center mt-3">
          <Chip>Music</Chip>
          <Chip>Gaming</Chip>
          <Chip>Fashion</Chip>
          <Chip>Photography</Chip>
        </div>
        <Button variant="primary" className="w-full mt-4" onClick={() => {}}>
          Edit profile
        </Button>
      </Card>

      <SectionLabel>Posts</SectionLabel>
      <EmptyState title="No posts yet." />
    </div>
  );
}
