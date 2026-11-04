"use client";

import { SectionLabel, Button } from "@/components/ui";

export default function SettingsPage() {
  return (
    <div className="p-3 bg-[#070707] min-h-full">

      <SectionLabel>Privacy &amp; Security</SectionLabel>
      <SettingsRow title="Privacy" sub="Profile visibility and discoverability" />
      <SettingsRow title="Security" sub="Password, session and MFA" />
      <SettingsRow title="Encryption keys" sub="Device identity and recovery key" />
      <SettingsRow title="Active devices" sub="Registered and revoked devices" />
      <SettingsRow title="Blocked members" sub="Manage blocked accounts" />
      <SettingsRow title="Notifications" sub="Push notification preferences" />

      <SectionLabel className="mt-4">Account</SectionLabel>
      <SettingsRow title="Account recovery" sub="Recovery key and device transfer" />
      <SettingsRow title="Delete account" sub="Remove your account and data" variant="danger" />

      <div className="mt-6 text-center">
        <Button variant="ghost" onClick={() => {}}>
          About The Static
        </Button>
      </div>
    </div>
  );
}

function SettingsRow({ title, sub, variant = "default" }: { title: string; sub: string; variant?: "default" | "danger" }) {
  return (
    <button
      onClick={() => {}}
      className={`flex items-center justify-between px-3 py-3 border-b border-[#1a1a1a] ${variant === "danger" ? "text-[#ffffff]" : "text-[#ececec]"}`}
    >
      <div>
        <span className="font-Space-Grotesk font-bold text-[14px] block">{title}</span>
        <span className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b]">{sub}</span>
      </div>
      <span className="text-[#8b8b8b]">›</span>
    </button>
  );
}
