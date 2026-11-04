"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/auth";
import { BrandMark } from "@/components/brand-mark";

export default function RootPage() {
  const { isAuthenticated, isLoading, setSession, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const restoreSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session?.user) {
        setSession(
          {
            id: session.user.id,
            staticId: session.user.user_metadata?.static_id ?? "",
            username: session.user.user_metadata?.username ?? "",
            status: session.user.user_metadata?.status ?? "active",
            role: session.user.user_metadata?.role ?? "member",
          },
          session.access_token,
          session.refresh_token,
        );
      }
      setLoading(false);
    };

    void restoreSession();
  }, [setSession, setLoading]);

  useEffect(() => {
    if (isLoading) return;
    router.replace(isAuthenticated ? "/home" : "/login");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-5 bg-[#070707]">
        <BrandMark size={44} className="text-[#ececec]" />
        <p className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b]">Loading…</p>
      </div>
    );
  }

  return null;
}
