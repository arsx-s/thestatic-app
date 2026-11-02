"use client";

import { useState } from "react";
import { Card, Wordmark, Tagline, SectionLabel, EmptyState, Button, Avatar } from "@/components/ui";

const INTERESTS = [
  "Music", "Fashion", "Sneakers", "Football", "Gaming",
  "Photography", "Art", "Film", "Business", "Technology",
];

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);

  const searchMembers = async () => {
    if (!query) {
      setMembers([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabaseQuery(
        "members",
        `id, username, static_id, status`,
        { column: "username", op: "ilike", value: `%${query}%` },
        { column: "status", op: "eq", value: "active" },
        20,
      );
      if (!error && data) setMembers(data);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 bg-[#070707] min-h-screen">
      <div className="mb-3">
        <Wordmark className="text-[22px]" />
        <Tagline />
      </div>

      <Card className="flex flex-col gap-3 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username or Static ID"
          autoCapitalize="none"
          className="bg-[#000] border border-[#3a3a3a] text-[#ececec] px-4 py-3 rounded-[10px] font-Inter text-[15px] flex-1"
        />
        <div className="flex gap-2">
          <Button variant="primary" onClick={searchMembers} className="px-4">
            Search
          </Button>
          <Button variant="ghost" className="px-4">
            Static ID
          </Button>
        </div>
      </Card>

      <SectionLabel>Interests</SectionLabel>
      <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide mb-4">
        {INTERESTS.map((interest) => (
          <button
            key={interest}
            onClick={() => setSelectedInterest(selectedInterest === interest ? null : interest)}
            className={`px-3 py-1.5 rounded-[99px] border border-[#3a3a3a] bg-[#0a0a0a] text-[12px] font-IBM-Plex-Mono ${selectedInterest === interest ? "bg-[#ececec] border-[#ececec] text-[#000]" : "text-[#c9c9c9] border-[#3a3a3a]"}`}
          >
            {interest}
          </button>
        ))}
      </div>

      <SectionLabel>Suggested members</SectionLabel>
      {loading ? (
        <div className="h-[60px] bg-[#0a0a0a] border border-[#2b2b2b] rounded-[10px] mb-2" />
      ) : members.length === 0 ? (
        <EmptyState title="No members found." subtitle="Try searching by username or Static ID." />
      ) : (
        <div className="space-y-1">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => {}}
              className="flex items-center gap-3 px-3 py-3 border-b border-[#1a1a1a]"
            >
              <Avatar src={undefined} size={44} />
              <div className="flex-1">
                <span className="font-Space-Grotesk font-bold text-[14px] text-[#ececec]">
                  {m.username}
                </span>
                <span className="font-IBM-Plex-Mono text-[11px] text-[#8b8b8b]">
                  {m.static_id}
                </span>
              </div>
              <span className="font-IBM-Plex-Mono text-[11px] text-[#8b8b8b]">
                {m.status}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Supabase query helper
async function supabaseQuery(table: string, select: string, filter1: any, filter2: any, limit: number) {
  const { data, error } = await (globalThis as any).supabase
    .from(table)
    .select(select)
    .filter(filter1.column, filter1.op, filter1.value)
    .filter(filter2.column, filter2.op, filter2.value)
    .limit(limit);
  return { data, error };
}
