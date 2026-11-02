import { createAdminClient } from "@/lib/supabase";
import { cookies } from "next/headers";

type Stat = { label: string; value: string | number; sub: string };

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("thestatic:admin:session")?.value;
  const supabase = createAdminClient();
  // set auth for RLS if needed (admin uses service role, bypasses RLS)

  const [memberCount, appCount, reportCount, orderCount] = await Promise.all([
    supabase.from("members").select("*", { head: true }),
    supabase.from("applications").select("*", { head: true }),
    supabase.from("moderation_reports").select("*", { head: true }),
    supabase.from("store_orders").select("*", { head: true }),
  ]);

  const stats: Stat[] = [
    { label: "Active members", value: memberCount.count ?? 0, sub: "Approved accounts" },
    { label: "Pending applications", value: appCount.count ?? 0, sub: "Awaiting review" },
    { label: "Open reports", value: reportCount.count ?? 0, sub: "Community safety" },
    { label: "Store orders", value: orderCount.count ?? 0, sub: "Official merchandise" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: "Space Grotesk, ui-sans-serif, system-ui", fontSize: 26, fontWeight: 700, letterSpacing: -0.04, textTransform: "uppercase", color: "#ececec", margin: 0 }}>
          Overview
        </h1>
        <p style={{ fontSize: 13, color: "#8b8b8b", fontFamily: "IBM Plex Mono, ui-monospace, monospace", letterSpacing: 0.14, textTransform: "uppercase", marginTop: 6 }}>
          Static Control &middot; ISSUE/001
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: "#0a0a0a", border: "1px solid #2b2b2b", borderRadius: 12,
              padding: 20, display: "flex", flexDirection: "column", gap: 8,
            }}
          >
            <span style={{ fontSize: 11, color: "#8b8b8b", fontFamily: "IBM Plex Mono, ui-monospace, monospace", letterSpacing: 0.14, textTransform: "uppercase" }}>
              {s.label}
            </span>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#ececec", fontFamily: "Space Grotesk, ui-sans-serif, system-ui", letterSpacing: -0.02 }}>
              {s.value}
            </span>
            <span style={{ fontSize: 12, color: "#8b8b8b", fontFamily: "IBM Plex Mono, ui-monospace, monospace" }}>
              {s.sub}
            </span>
          </div>
        ))}
      </div>

      <div style={{ background: "#0a0a0a", border: "1px solid #2b2b2b", borderRadius: 12, padding: 20 }}>
        <h2 style={{ fontSize: 14, color: "#8b8b8b", fontFamily: "IBM Plex Mono, ui-monospace, monospace", letterSpacing: 0.14, textTransform: "uppercase", marginTop: 0, marginBottom: 16 }}>
          Recent activity
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid #1a1a1a" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#c9c9c9", fontFamily: "IBM Plex Mono, ui-monospace, monospace" }}>
                <span style={{ color: "#8b8b8b" }}>Member</span> <span>#{10000 + i}</span> performed action
              </div>
              <span style={{ fontSize: 11, color: "#8b8b8b", fontFamily: "IBM Plex Mono, ui-monospace, monospace" }}>just now</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
