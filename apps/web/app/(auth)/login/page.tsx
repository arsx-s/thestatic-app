"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@/components/ui";
import { BrandMark } from "@/components/brand-mark";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuthStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Enter your Static ID or username and password.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const { data: resolved, error: invokeError } = await supabase.functions.invoke(
        "login-identifier",
        { body: { identifier } },
      );
      if (invokeError) throw new Error("Sign in is unavailable right now.");
      if (!resolved?.email) throw new Error("Invalid Static ID, username or password.");

      const { data: signedIn, error: signInError } = await supabase.auth.signInWithPassword({
        email: resolved.email,
        password,
      });
      if (signInError || !signedIn.session) {
        throw new Error("Invalid Static ID, username or password.");
      }

      const member = resolved.member;
      setSession(
        {
          id: member.id,
          staticId: member.static_id,
          username: member.username,
          status: member.status,
          role: member.role,
        },
        signedIn.session.access_token,
        signedIn.session.refresh_token,
      );

      const { data: pwCheck } = await supabase.functions.invoke("check-password-change");
      if (pwCheck?.must_change_password) {
        router.replace("/password-change");
      } else {
        router.replace("/home");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Login failed");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (oauthError || !data?.url) {
        throw new Error("Google sign-in isn't available yet. Try again later.");
      }
      window.location.assign(data.url);
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#070707] px-6 py-10">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-3 mb-2">
          <BrandMark size={30} className="text-[#ececec] shrink-0" />
          <span className="font-Space-Grotesk font-bold text-[22px] uppercase tracking-[-0.045em] text-[#ececec]">
            The Static
          </span>
        </div>
        <p className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b] tracking-[0.14em] uppercase mb-8">
          Member login &middot; Restricted access
        </p>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Static ID / Username</Label>
            <Input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="ST-00001 or static/001"
              autoComplete="username"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p role="alert" className="text-[#ffffff] font-IBM-Plex-Mono text-[12px] mb-3">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
            className="w-full"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current rounded-full animate-spin" />
                Sign in
              </span>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
        <div className="mt-6 flex items-center gap-3">
          <span className="flex-1 h-[1px] bg-[#1a1a1a]" />
          <span className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b]">Or</span>
          <span className="flex-1 h-[1px] bg-[#1a1a1a]" />
        </div>
        <Button
          variant="secondary"
          className="w-full mt-4 flex items-center justify-center gap-3"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <span className="w-4 h-4 border-2 border-current rounded-full animate-spin" />
          ) : (
            <GoogleMark />
          )}
          Continue with Google
        </Button>
        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={() => router.push("/forgot-password")}
        >
          Forgot password?
        </Button>
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b]">Not a member?</div>
          <a
            href="https://thestaticcollective.vercel.app/#join"
            className="w-full min-h-[44px] inline-flex items-center justify-center text-[#ececec] underline font-IBM-Plex-Mono text-[13px] text-center"
          >
            Apply to become a Static
          </a>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-3.1-.4-4.6H24v8.7h11.8c-.5 2.8-2.1 5.2-4.5 6.8v5.6h7.2c4.2-3.9 6.6-9.6 6.6-16.5z"
      />
      <path
        fill="#34A853"
        d="M24 46c6 0 11-2 14.7-5.4l-7.2-5.6c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.7-3.9-12.4-9.2H4.2v5.8C8 41.1 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.6 27.9c-.4-1.3-.7-2.6-.7-4s.3-2.7.7-4V14.1H4.2C2.8 17.1 2 20.5 2 24s.8 6.9 2.2 9.9l7.4-6z"
      />
      <path
        fill="#EA4335"
        d="M24 10.7c3.3 0 6.2 1.1 8.5 3.3l6.4-6.4C35 4.1 30 2 24 2 15.4 2 8 6.9 4.2 14.1l7.4 5.8c1.7-5.3 6.6-9.2 12.4-9.2z"
      />
    </svg>
  );
}
