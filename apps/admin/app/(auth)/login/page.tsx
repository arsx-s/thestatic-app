"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Admin login failed");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", background: "#070707" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <ShieldAlert style={{ width: 24, height: 24, color: "#ececec" }} />
          <span style={{ fontFamily: "Space Grotesk, ui-sans-serif, system-ui", fontSize: 20, fontWeight: 700, letterSpacing: -0.04, textTransform: "uppercase", color: "#ececec" }}>
            STATIC CONTROL
          </span>
        </div>
        <p style={{ fontSize: 12, color: "#8b8b8b", fontFamily: "IBM Plex Mono, ui-monospace, monospace", letterSpacing: 0.14, textTransform: "uppercase", marginBottom: 26 }}>
          Restricted &middot; Administrator access only
        </p>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, color: "#8b8b8b", fontFamily: "IBM Plex Mono, ui-monospace, monospace", letterSpacing: 0.14, textTransform: "uppercase" }}>
              Email address
            </label>
            <input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@thestatic.example"
              style={{
                background: "#000", border: "1px solid #3a3a3a", color: "#ececec",
                padding: 12, borderRadius: 10, fontSize: 15, width: "100%",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, color: "#8b8b8b", fontFamily: "IBM Plex Mono, ui-monospace, monospace", letterSpacing: 0.14, textTransform: "uppercase" }}>
              Password
            </label>
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              style={{
                background: "#000", border: "1px solid #3a3a3a", color: "#ececec",
                padding: 12, borderRadius: 10, fontSize: 15, width: "100%",
              }}
            />
          </div>
          {error && (
            <p style={{ fontSize: 12, color: "#ffffff", fontFamily: "IBM Plex Mono, ui-monospace, monospace", marginBottom: 10 }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#ececec", color: "#000", fontFamily: "Space Grotesk, ui-sans-serif, system-ui",
              fontWeight: 700, fontSize: 13, letterSpacing: 0.06, textTransform: "uppercase",
              padding: 12, borderRadius: 10, width: "100%",
            }}
          >
            {loading ? <Loader2 style={{ width: 18, height: 18, marginRight: 6 }} /> : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
