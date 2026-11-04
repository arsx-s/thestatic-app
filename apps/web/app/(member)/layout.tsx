"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Layout,
  Search,
  SquarePlus,
  Inbox,
  User,
  LogOut,
} from "lucide-react";
import { Wordmark } from "@/components/ui";
import { BrandMark } from "@/components/brand-mark";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/auth";

const nav = [
  { key: "home", label: "Home", icon: Layout, href: "/home" },
  { key: "discover", label: "Discover", icon: Search, href: "/discover" },
  { key: "create", label: "Create", icon: SquarePlus, href: "/create" },
  { key: "inbox", label: "Inbox", icon: Inbox, href: "/inbox" },
  { key: "profile", label: "Profile", icon: User, href: "/profile" },
];

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { clearSession } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearSession();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#070707] text-[#ececec]">
      <header className="flex items-center justify-between px-4 py-3 bg-[#070707] border-b border-[#1a1a1a] shrink-0">
        <div className="flex items-center gap-2.5">
          <BrandMark size={22} className="text-[#ececec]" />
          <Wordmark className="text-[18px]" />
        </div>
        <button
          onClick={handleLogout}
          aria-label="Sign out"
          className="p-2 -mr-2 text-[#8b8b8b] hover:text-[#ececec] min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <LogOut size={20} />
        </button>
      </header>
      <main className="flex-1 overflow-y-auto">{children}</main>
      <nav className="border-t border-[#1a1a1a] bg-[#070707] shrink-0">
        <div
          className="flex justify-around py-2"
          style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
        >
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <button
                key={item.key}
                onClick={() => router.push(item.href)}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-3 py-2 min-h-[44px] ${
                  active ? "text-[#ececec]" : "text-[#8b8b8b]"
                }`}
              >
                <Icon size={20} />
                <span className="font-IBM-Plex-Mono text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
