"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Card, Wordmark, Tagline, SectionLabel, EmptyState, Avatar } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [stories, setStories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  useEffect(() => {
    void loadStories();
    void loadFeed();
  }, []);

  const loadStories = async () => {
    try {
      const { data, error } = await supabase
        .from("social.stories")
        .select(
          `id, author_id, audience, expires_at, created_at,
           author:author_id (id, username, static_id, profile_photo_url, display_name)`,
        )
        .order("created_at", { ascending: false })
        .limit(12);
      if (!error && data) setStories(data);
    } catch {
      // non-fatal
    }
  };

  const loadFeed = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("social.posts")
        .select(
          `id, author_id, audience, encrypted_content, encrypted_media_reference, created_at,
           author:author_id (id, username, static_id, profile_photo_url, display_name)`,
        )
        .order("created_at", { ascending: false })
        .limit(12);
      if (!error && data) {
        const rows = data as any[];
        setPosts(rows);
        setCursor(rows[rows.length - 1]?.created_at ?? null);
      }
    } catch {
      // handled by empty state
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!cursor) return;
    try {
      const { data, error } = await supabase
        .from("social.posts")
        .select(
          `id, author_id, audience, encrypted_content, encrypted_media_reference, created_at,
           author:author_id (id, username, static_id, profile_photo_url, display_name)`,
        )
        .order("created_at", { ascending: false })
        .lt("created_at", cursor)
        .limit(12);
      if (!error && data) {
        const rows = data as any[];
        setPosts((prev) => [...prev, ...rows]);
        setCursor(rows[rows.length - 1]?.created_at ?? null);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-3 bg-[#070707] min-h-screen">
      <div className="flex items-center justify-between mb-3">
        <Wordmark className="text-[20px]" />
        <button className="p-2 text-[#8b8b8b] hover:text-[#ececec]">
          <span className="font-IBM-Plex-Mono text-[12px]">Hub</span>
        </button>
      </div>

      <SectionLabel>Stories</SectionLabel>
      <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide">
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => {}}
            className="flex flex-col items-center gap-1 w-[72px]"
          >
            <div className="relative w-[56px] h-[56px]">
              <Avatar src={story.author?.profile_photo_url ?? undefined} />
              <div className="absolute -top-1 -left-1 -right-1 -bottom-1 border-2 border-[#ececec] rounded-full" />
            </div>
            <span className="font-IBM-Plex-Mono text-[12px] text-[#c9c9c9] w-[72px] text-center truncate">
              {story.author?.username ?? "Static"}
            </span>
          </button>
        ))}
      </div>

      <SectionLabel className="mt-4">Following feed</SectionLabel>
      <div className="flex items-center justify-between mb-2">
        <span className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b]">Chronological &middot; ISSUE/001</span>
      </div>

      {loading ? (
        <div className="flex gap-4 py-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-[260px]" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState title="No posts yet." subtitle="Follow Statics in Discover to see posts here." />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          <div className="py-8" id="load-more-sentinel" />
        </div>
      )}
    </div>
  );
}

type PostCardProps = { post: any };

function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const staticId = post.author?.static_id ?? "ST-00000";

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar src={post.author?.profile_photo_url ?? undefined} size={44} />
          <div>
            <span className="font-Space-Grotesk font-bold text-[15px] text-[#ececec]">
              {post.author?.username ?? "Static"}
            </span>
            <span className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b]">
              {staticId} &middot; just now
            </span>
          </div>
        </div>
        <button className="p-2 text-[#8b8b8b]">···</button>
      </div>
      <div className="font-Inter text-[15px] text-[#c9c9c9] leading-[22px] mb-3">
        Encrypted post content &mdash; decrypted on device.
      </div>
      {post.encrypted_media_reference && (
        <div className="h-[300px] bg-[#111] border border-[#2b2b2b] rounded-[10px] mb-3" />
      )}
      <div className="flex gap-6">
        <button
          onClick={() => setLiked(!liked)}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-[18px]">{liked ? "\u2665" : "\u2661"}</span>
          <span className="font-IBM-Plex-Mono text-[11px] text-[#8b8b8b]">Like</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <span className="text-[18px]">&middot;</span>
          <span className="font-IBM-Plex-Mono text-[11px] text-[#8b8b8b]">Comment</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <span className="text-[18px]">&rsaquo;</span>
          <span className="font-IBM-Plex-Mono text-[11px] text-[#8b8b8b]">Repost</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <span className="text-[18px]">&rsaquo;</span>
          <span className="font-IBM-Plex-Mono text-[11px] text-[#8b8b8b]">Save</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <span className="text-[18px]">&square;</span>
          <span className="font-IBM-Plex-Mono text-[11px] text-[#8b8b8b]">Share</span>
        </button>
      </div>
    </Card>
  );
}
