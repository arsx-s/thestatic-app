"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Layout, Shield, Users, FileText, ShoppingBag, Package, Calendar, Settings,
  LogOut, Activity, Link as LinkIcon,
} from "lucide-react";

const NAV = [
  { key: "dashboard", label: "Overview", icon: Layout, href: "/dashboard" },
  { key: "members", label: "Members", icon: Users, href: "/members" },
  { key: "applications", label: "Applications", icon: FileText, href: "/applications" },
  { key: "moderation", label: "Reports", icon: Activity, href: "/moderation" },
  { key: "marketplace", label: "Marketplace", icon: ShoppingBag, href: "/marketplace" },
  { key: "store", label: "Store", icon: Package, href: "/store" },
  { key: "events", label: "Events", icon: Calendar, href: "/events" },
  { key: "administration", label: "Administration", icon: Settings, href: "/administration" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    // clear admin session cookie via a POST to /api/auth/logout
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      router.push("/auth/login");
    });
  };

  return (
    <div style={{ display: "flex", minHeight: "100svh", background: "#070707", color: "#ececec" }}>
      <aside
        style={{
          width: collapsed ? 64 : 260,
          background: "#0a0a0a",
          borderRight: "1px solid #2b2b2b",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s ease",
        }}
      >
        <div style={{ padding: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #2b2b2b" }}>
          <Shield style={{ width: 26, height: 26, color: "#ececec" }} />
          <span
            style={{
              fontFamily: "Space Grotesk, ui-sans-serif, system-ui",
              fontSize: collapsed ? 0 : 18,
              fontWeight: 700,
              letterSpacing: -0.04,
              textTransform: "uppercase",
              color: "#ececec",
              opacity: collapsed ? 0 : 1,
              transition: "opacity 0.2s ease",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            STATIC CONTROL
          </span>
        </div>
        <nav style={{ flex: 1, padding: 12, overflowY: "auto" }}>
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: collapsed ? 12 : 10,
                  borderRadius: 10,
                  color: active ? "#ececec" : "#8b8b8b",
                  textDecoration: "none",
                  fontFamily: "IBM Plex Mono, ui-monospace, monospace",
                  fontSize: 12,
                  letterSpacing: 0.14,
                  textTransform: "uppercase",
                  minHeight: 44,
                  justifyContent: collapsed ? "center" : "flex-start",
                  opacity: collapsed ? 0.9 : 1,
                }}
              >
                <Icon
                  style={{ width: 20, height: 20, flexShrink: 0 }}
                  color={active ? "#ececec" : "#8b8b8b"}
                />
                {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: 16, borderTop: "1px solid #2b2b2b" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: collapsed ? 12 : 10,
              borderRadius: 10,
              color: "#8b8b8b",
              fontFamily: "IBM Plex Mono, ui-monospace, monospace",
              fontSize: 12,
              letterSpacing: 0.14,
              textTransform: "uppercase",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            <LogOut style={{ width: 20, height: 20, flexShrink: 0, color: "#8b8b8b" }} />
            {!collapsed && <span>Sign out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              marginTop: 8,
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: "1px solid #3a3a3a",
              color: "#8b8b8b",
              fontFamily: "IBM Plex Mono, ui-monospace, monospace",
              fontSize: 11,
              letterSpacing: 0.14,
              textTransform: "uppercase",
            }}
          >
            {collapsed ? "Expand" : "Collapse"}
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
