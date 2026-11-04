"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Layout,
  Search,
  SquarePlus,
  Inbox,
  User,
  LogOut,
  Shield,
} from "lucide-react";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const nav = [
    { key: "home", label: "Home", icon: Layout, href: "/home" },
    { key: "discover", label: "Discover", icon: Search, href: "/discover" },
    { key: "create", label: "Create", icon: SquarePlus, href: "/create" },
    { key: "inbox", label: "Inbox", icon: Inbox, href: "/inbox" },
    { key: "profile", label: "Profile", icon: User, href: "/profile" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("thestatic:auth:access");
    localStorage.removeItem("thestatic:auth:refresh");
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex flex-col h-screen bg-[#070707] text-[#ececec]">
      <header className="flex items-center justify-between px-4 py-3 bg-[#070707] border-b border-[#1a1a1a]">
        <Wordmark className="text-[20px]" />
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="p-2 text-[#8b8b8b] hover:text-[#ececec]"
          >
            <Shield size={20} />
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">{children}</main>
      <nav className="border-t border-[#1a1a1a] bg-[#070707]">
        <div className="flex justify-around py-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <button
                key={item.key}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center gap-1 px-3 py-2 ${active ? "text-[#ececec]" : "text-[#8b8b8b]"}`}
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

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-Space-Grotesk font-bold ${className} tracking-[-0.045] uppercase text-[#ececec]`}
    >
      THE STATIC
    </span>
  );
}
