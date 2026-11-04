"use client";

import { useRouter } from "next/navigation";
import { AuthBrandHeader, Button } from "@/components/ui";

export default function AccountRecoveryPage() {
  const router = useRouter();

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#070707] p-6">
      <div className="w-full max-w-[400px]">
        <AuthBrandHeader />
        <div className="text-[#ececec] font-Space-Grotesk font-bold text-[16px] mb-2">
          Account recovery
        </div>
        <p className="font-Inter text-[14px] text-[#c9c9c9] leading-[22px] mb-8 text-center">
          Recovery uses the recovery key generated on your device during login.
          Enter your recovery key to restore access to your account and re-register
          your device.
        </p>
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="w-[44px] h-[48px] bg-[#000] border border-[#3a3a3a] rounded-[10px]"
            />
          ))}
        </div>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => router.push("/login")}
        >
          Back to log in
        </Button>
      </div>
    </div>
  );
}
