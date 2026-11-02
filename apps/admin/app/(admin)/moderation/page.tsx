"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

export default function ModerationPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((d) => { setReports(d.reports ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: 24, color: "#8b8b8b", fontFamily: "IBM Plex Mono, ui-monospace, monospace" }}><ShieldAlert style={{ width: 20, height: 20 }} /> Loading reports...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontFamily: "Space Grotesk, ui-sans-serif, system-ui", fontSize: 22, fontWeight: 700, letterSpacing: -0.04, textTransform: "uppercase", color: "#ececec", margin: 0 }}>Reports</h1>
      <div style={{ background: "#0a0a0a", border: "1px solid #2b2b2b", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "IBM Plex Mono, ui-monospace, monospace", fontSize: 12, letterSpacing: 0.14, textTransform: "uppercase" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #2b2b2b" }}>
              <th style={{ textAlign: "left", padding: "12px 16px", color: "#8b8b8b" }}>ID</th>
              <th style={{ textAlign: "left", padding: "12px 16px", color: "#8b8b8b" }}>Target</th>
              <th style={{ textAlign: "left", padding: "12px 16px", color: "#8b8b8b" }}>Status</th>
              <th style={{ textAlign: "left", padding: "12px 16px", color: "#8b8b8b" }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                <td style={{ padding: "12px 16px", color: "#ececec" }}>{r.id}</td>
                <td style={{ padding: "12px 16px", color: "#ececec" }}>{r.target_type} #{r.target_id}</td>
                <td style={{ padding: "12px 16px", color: "#c9c9c9" }}>{r.status}</td>
                <td style={{ padding: "12px 16px", color: "#c9c9c9" }}>{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr><td colSpan={4} style={{ padding: "32px 16px", color: "#8b8b8b", textAlign: "center" }}>No reports.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
