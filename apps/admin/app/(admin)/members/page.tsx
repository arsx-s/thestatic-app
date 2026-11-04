"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/members")
      .then((r) => r.json())
      .then((data) => { setMembers(data.members ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24, color: "#8b8b8b", fontFamily: "IBM Plex Mono, ui-monospace, monospace" }}>
        <ShieldAlert style={{ width: 20, height: 20 }} /> Loading members...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontFamily: "Space Grotesk, ui-sans-serif, system-ui", fontSize: 22, fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", color: "#ececec", margin: 0 }}>
          Members
        </h1>
        <Link
          href="/members/create"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            minHeight: 44,
            background: "#ececec", color: "#000",
            paddingTop: 8, paddingRight: 14, paddingBottom: 8, paddingLeft: 14,
            borderRadius: 10,
            fontFamily: "IBM Plex Mono, ui-monospace, monospace", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
          }}
        >
          <ShieldAlert style={{ width: 16, height: 16 }} /> Provision account
        </Link>
      </div>

      <div style={{ background: "#0a0a0a", border: "1px solid #2b2b2b", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "IBM Plex Mono, ui-monospace, monospace", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #2b2b2b" }}>
              <th style={{ textAlign: "left", paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, color: "#8b8b8b" }}>Static ID</th>
              <th style={{ textAlign: "left", paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, color: "#8b8b8b" }}>Username</th>
              <th style={{ textAlign: "left", paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, color: "#8b8b8b" }}>Status</th>
              <th style={{ textAlign: "left", paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, color: "#8b8b8b" }}>Role</th>
              <th style={{ textAlign: "left", paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, color: "#8b8b8b" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                <td style={{ paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, color: "#ececec" }}>{m.static_id}</td>
                <td style={{ paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, color: "#ececec" }}>{m.username}</td>
                <td style={{ paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, color: "#c9c9c9" }}>{m.status}</td>
                <td style={{ paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, color: "#c9c9c9" }}>{m.role}</td>
                <td style={{ paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16 }}>
                  <Link
                    href={`/members/${m.id}`}
                    style={{ color: "#8b8b8b", fontSize: 12 }}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={5} style={{ paddingTop: 32, paddingRight: 16, paddingBottom: 32, paddingLeft: 16, color: "#8b8b8b", textAlign: "center" }}>
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
