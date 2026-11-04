"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/auth";
import { BrandMark } from "@/components/brand-mark";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setSession } = useAuthStore();
  const [message, setMessage] = useState("Completing sign in…");
  const [isMemberless, setIsMemberless] = useState(false);
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const oauthError = params.get("error_description") || params.get("error");

    if (oauthError) {
      setMessage("Google cancelled this sign-in. Try again.");
      setTimeout(() => router.replace("/login"), 2000);
      return;
    }
    if (!code) {
      router.replace("/login");
      return;
    }

    void (async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data?.session) {
        setMessage("That sign-in link has expired. Try again.");
        setTimeout(() => router.replace("/login"), 2000);
        return;
      }

      const user = data.session.user;
      const { data: member } = await supabase
        .from("membership.members")
        .select("id, static_id, username, status, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!member || member.status !== "active") {
        setIsMemberless(true);
        setMessage("This Google account isn't linked to a Static membership yet.");
        return;
      }

      setSession(
        {
          id: member.id,
          staticId: member.static_id,
          username: member.username,
          status: member.status,
          role: member.role,
        },
        data.session.access_token,
        data.session.refresh_token,
      );
      router.replace("/home");
    })();
  }, [router, setSession]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#070707] px-6">
      <div className="w-full max-w-[400px] flex flex-col items-center gap-4 text-center">
        <BrandMark size={44} className="text-[#ececec]" />
        {isMemberless ? (
          <>
            <p className="font-IBM-Plex-Mono text-[13px] text-[#ececec] leading-relaxed">
              {message}
            </p>
            <a
              href="https://thestaticcollective.vercel.app/#join"
              className="font-IBM-Plex-Mono text-[13px] text-[#ececec] underline"
            >
              Apply to become a Static
            </a>
            <button
              onClick={() => router.replace("/login")}
              className="font-IBM-Plex-Mono text-[11px] uppercase tracking-[0.14em] text-[#8b8b8b]"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <div className="w-10 h-10 border-2 border-[#ececec] border-t-transparent rounded-full animate-spin" />
            <p className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b]">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
