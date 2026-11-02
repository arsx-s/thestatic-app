"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

type App = { id: string; status: string; created_at: string; member?: { static_id: string; username: string } };

export default function ApplicationsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/applications")
      .then((r) => r.json())
      .then((d) => { setApps(d.applications ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDecision = async (id: string, decision: "approved" | "rejected") => {
    const res = await fetch("/api/admin/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: decision }),
    });
    if (res.ok) setApps(apps.map((a) => a.id === id ? { ...a, status: decision } : a));
  };

  if (loading) {
    return <div style={{ padding: 24, color: "#8b8b8b", fontFamily: "IBM Plex Mono, ui-monospace, monospace" }}><ShieldAlert style={{ width: 20, height: 20 }} /> Loading applications...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontFamily: "Space Grotesk, ui-sans-serif, system-ui", fontSize: 22, fontWeight: 700, letterSpacing: -0.04, textTransform: "uppercase", color: "#ececec", margin: 0 }}>Applications</h1>
      <div style={{ background: "#0a0a0a", border: "1px solid #2b2b2b", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "IBM Plex Mono, ui-monospace, monospace", fontSize: 12, letterSpacing: 0.14, textTransform: "uppercase" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #2b2b2b" }}>
              <th style={{ textAlign: "left", padding: "12px 16px", color: "#8b8b8b" }}>Static ID</th>
              <th style={{ textAlign: "left", padding: "12px 16px", color: "#8b8b8b" }}>Username</th>
              <th style={{ textAlign: "left", padding: "12px 16px", color: "#8b8b8b" }}>Status</th>
              <th style={{ textAlign: "left", padding: "12px 16px", color: "#8b8b8b" }}>Applied</th>
              <th style={{ textAlign: "left", padding: "12px 16px", color: "#8b8b8b" }}>Decision</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                <td style={{ padding: "12px 16px", color: "#ececec" }}>{a.member?.static_id ?? "-"}</td>
                <td style={{ padding: "12px 16px", color: "#ececec" }}>{a.member?.username ?? "-"}</td>
                <td style={{ padding: "12px 16px", color: "#c9c9c9" }}>{a.status}</td>
                <td style={{ padding: "12px 16px", color: "#c9c9c9" }}>{new Date(a.created_at).toLocaleDateString()}</td>
                <td style={{ padding: "12px 16px" }}>
                  {a.status === "pending" ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleDecision(a.id, "approved")} style={{ color: "#ececec", fontSize: 11, fontFamily: "IBM Plex Mono, ui-monospace, monospace", textDecoration: "underline" }}>Approve</button>
                      <button onClick={() => handleDecision(a.id, "rejected")} style={{ color: "#8b8b8b", fontSize: 11, fontFamily: "IBM Plex Mono, ui-monospace, monospace", textDecoration: "underline" }}>Reject</button>
                    </div>
                  ) : <span style={{ fontSize: 11, color: "#8b8b8b", fontFamily: "IBM Plex Mono, ui-monospace, monospace" }}>{a.status}</span>}
                </td>
              </tr>
            ))}
            {apps.length === 0 && (
              <tr><td colSpan={5} style={{ padding: "32px 16px", color: "#8b8b8b", textAlign: "center" }}>No applications.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
