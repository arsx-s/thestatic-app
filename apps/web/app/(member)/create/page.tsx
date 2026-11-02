"use client";

import { useState } from "react";
import { Card, Wordmark, Tagline, SectionLabel, Button, Input, Label } from "@/components/ui";

const AUDIENCES = [
  { value: "followers", label: "Followers" },
  { value: "in_sync", label: "In Sync" },
  { value: "all_members", label: "All Statics" },
  { value: "custom", label: "Custom audience" },
];

export default function CreatePage() {
  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState("followers");
  const [allowComments, setAllowComments] = useState(true);
  const [mediaCount, setMediaCount] = useState(0);

  return (
    <div className="p-3 bg-[#070707] min-h-screen">
      <div className="mb-4">
        <Wordmark className="text-[22px]" />
        <Tagline />
      </div>

      <Card className="mb-4">
        <Label>Caption</Label>
        <Input
          multiline
          rows={5}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What&apos;s on your frequency?"
        />
      </Card>

      <Card className="mb-4">
        <Label>Media</Label>
        <div className="flex gap-2 flex-wrap">
          <Button variant="primary" onClick={() => setMediaCount(1)} className="px-3">
            1 photo
          </Button>
          <Button variant="primary" onClick={() => setMediaCount(3)} className="px-3">
            Multiple photos
          </Button>
          <Button variant="primary" onClick={() => setMediaCount(-1)} className="px-3">
            Video
          </Button>
          <Button variant="primary" onClick={() => setMediaCount(-2)} className="px-3">
            Music attachment
          </Button>
        </div>
        {mediaCount > 0 && <div className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b] mt-1">{mediaCount} media item(s) selected</div>}
        {mediaCount === -1 && <div className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b]">Video selected</div>}
        {mediaCount === -2 && <div className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b]">Music attachment (external link)</div>}
      </Card>

      <Card className="mb-4">
        <Label>Audience</Label>
        {AUDIENCES.map((a) => (
          <button
            key={a.value}
            onClick={() => setAudience(a.value)}
className={`w-full px-3 py-2 rounded-[10px] border text-left mb-1 font-IBM-Plex-Mono text-[13px] ${audience === a.value ? "bg-[#ececec] border-[#ececec] text-[#000]" : "bg-[#000] border-[#3a3a3a] text-[#c9c9c9]"}`}
          >
            {a.label}
          </button>
        ))}
      </Card>

      <Card>
        <div className="flex items-center justify-between py-3 border-b border-[#1a1a1a]">
          <span className="font-IBM-Plex-Mono text-[13px] text-[#c9c9c9]">Allow comments</span>
          <span className="font-IBM-Plex-Mono text-[13px] text-[#8b8b8b]">{allowComments ? "On" : "Off"}</span>
        </div>
      </Card>

      <Button variant="primary" className="w-full mt-4" onClick={() => {}}>
        Publish
      </Button>
      <Button variant="ghost" className="w-full mt-2" onClick={() => {}}>
        Draft
      </Button>
    </div>
  );
}
