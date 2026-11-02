"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark, Tagline, Button, Input, Label, Card } from "@/components/ui";
import { supabase, persistSession } from "@/lib/supabase";
import { useAuthStore } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { setSession, setLoading: setAuthLoading } = useAuthStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      const { data: resolved, error: resolveError } = await supabase.functions.invoke(
        "login-identifier",
        { body: { identifier, password } },
      );
      if (resolveError || !resolved?.access_token) {
        throw new Error(resolved?.error || "Invalid Static ID, username or password.");
      }
      await persistSession(resolved.access_token, resolved.refresh_token ?? "");
      setSession(
        {
          id: resolved.member.id,
          staticId: resolved.member.static_id,
          username: resolved.member.username,
          status: resolved.member.status,
          role: resolved.member.role,
        },
        resolved.access_token,
        resolved.refresh_token ?? "",
      );

      // Check if password change is required
      const { data: pwCheck, error: pwError } = await supabase.functions.invoke(
        "check-password-change",
      );
      if (!pwError && pwCheck?.must_change_password) {
        // Redirect to mandatory password change screen
        router.replace("/(member)/password-change");
        router.refresh();
      } else {
        router.replace("/(member)");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070707]">
      <div className="w-full max-w-[400px] px-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[#ececec]">STATIC CONTROL</span>
        </div>
        <p className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b] tracking-[0.14] uppercase mb-8">
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
              autoComplete="password"
            />
          </div>
          {error && (
            <p className="text-[#ffffff] font-IBM-Plex-Mono text-[12px] mb-3">
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
        <div className="mt-8 flex items-center gap-2">
          <span className="w-full h-[1px] bg-[#1a1a1a]" />
          <span className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b]">Or</span>
          <span className="w-full h-[1px] bg-[#1a1a1a]" />
        </div>
        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={() => router.push("/(auth)/forgot-password")}
        >
          Forgot password?
        </Button>
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b"]>Not a member?</div>
          <Button
            variant="ghost"
            className="w-full text-[#ececec] underline"
            onClick={() => {
              window.open("https://thestatic.example/apply", "_blank");
            }}
          >
            Apply to become a Static
          </Button>
        </div>
      </div>
    </div>
  );
}
