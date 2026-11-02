"use client";

import { useRouter } from "next/navigation";
import { Wordmark, Tagline, Button } from "@/components/ui";

export default function DeviceVerificationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070707] p-6">
      <div className="max-w-[400px]">
        <Wordmark className="mb-2" />
        <Tagline className="mb-8" />
        <div className="text-[#ececec] font-Space-Grotesk font-bold text-[16px] mb-2">
          Verify this device
        </div>
        <p className="font-Inter text-[14px] text-[#c9c9c9] leading-[22px] mb-8 text-center">
          Confirm your identity to register this device&apos;s cryptographic keys and
          restore access to your encrypted conversations.
        </p>
        <Button
          variant="primary"
          className="w-full"
          onClick={() => router.push("/(member)")}
        >
          Continue
        </Button>
        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={() => router.push("/(auth)/login")}
        >
          Back to log in
        </Button>
      </div>
    </div>
  );
}
