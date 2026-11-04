"use client";

import { useRouter } from "next/navigation";
import { AuthBrandHeader, Button } from "@/components/ui";

export default function DeviceVerificationPage() {
  const router = useRouter();

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#070707] p-6">
      <div className="w-full max-w-[400px]">
        <AuthBrandHeader />
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
          onClick={() => router.push("/home")}
        >
          Continue
        </Button>
        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={() => router.push("/login")}
        >
          Back to log in
        </Button>
      </div>
    </div>
  );
}
