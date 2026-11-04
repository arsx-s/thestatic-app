"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark, Tagline, Button, Input, Label } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      // eslint-disable-next-line no-alert
      window.alert("Enter your Static ID or username.");
      return;
    }
    setLoading(true);
    try {
      await supabase.functions.invoke("login-identifier", {
        body: { identifier, action: "recover" },
      });
      setSent(true);
    } catch (err: any) {
      // eslint-disable-next-line no-alert
      window.alert(err.message || "Recovery failed");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070707] p-6">
        <div className="max-w-[400px]">
          <Wordmark className="mb-2" />
          <Tagline className="mb-8" />
          <div className="text-[#ececec] font-Space-Grotesk font-bold text-[16px] mb-2">
            Password recovery
          </div>
          <p className="font-Inter text-[14px] text-[#c9c9c9] leading-[22px] mb-6 text-center">
            A recovery link has been sent to the verified contact on file for this account.
            Follow the link to set a new password.
          </p>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => router.push("/login")}
          >
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070707] p-6">
      <div className="max-w-[400px]">
        <Wordmark className="mb-2" />
        <Tagline className="mb-8" />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Static ID / Username</Label>
            <Input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="ST-00001 or username"
              autoComplete="username"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full"
          >
            Send recovery link
          </Button>
        </form>
        <Button
          variant="ghost"
          className="w-full mt-6"
          onClick={() => router.push("/login")}
        >
          Back to log in
        </Button>
        {loading && (
          <div className="mt-4 flex justify-center">
            <span className="w-4 h-4 border-2 border-current rounded-full animate-spin text-[#ececec]" />
          </div>
        )}
      </div>
    </div>
  );
}
