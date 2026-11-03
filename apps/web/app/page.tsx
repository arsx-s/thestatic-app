"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark, Tagline } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/auth";

export default function RootPage() {
  const { member, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
        if (!isLoading && !isAuthenticated) {
          router.replace("/(auth)/login");
        } else if (!isLoading && isAuthenticated) {
          router.replace("/home");
        }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070707]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#ececec] border-t-transparent rounded-full animate-spin" />
          <p className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b]">Loading…</p>
        </div>
      </div>
    );
  }

  return null;
}
