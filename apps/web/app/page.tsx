"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark, Tagline } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/auth";
import { AUTH_STORAGE_KEY } from "@/lib/supabase";

export default function RootPage() {
  const { member, isAuthenticated, isLoading, setSession, setLoading } =
    useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const accessToken = localStorage.getItem(
        `${AUTH_STORAGE_KEY}:access`
      );
      if (accessToken) {
        try {
          const { data, error } = await supabase.auth.getUser();
          if (data.user && !error) {
            setSession(
              {
                id: data.user.id,
                staticId:
                  data.user.user_metadata?.static_id ?? "",
                username:
                  data.user.user_metadata?.username ?? "",
                status:
                  data.user.user_metadata?.status ?? "active",
                role:
                  data.user.user_metadata?.role ?? "member",
              },
              accessToken,
              ""
            );
          }
        } catch {
          // Session invalid, clear it
          localStorage.removeItem(`${AUTH_STORAGE_KEY}:access`);
          localStorage.removeItem(`${AUTH_STORAGE_KEY}:refresh`);
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

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