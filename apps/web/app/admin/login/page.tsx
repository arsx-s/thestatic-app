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
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070707]">
      <div className="w-full max-w-[400px] px-6">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert size={24} />
          <span className="font-Space-Grotesk font-bold text-[20px] tracking-[-0.04] uppercase text-[#ececec]">
            STATIC CONTROL
          </span>
        </div>
        <p className="font-IBM-Plex-Mono text-[12px] text-[#8b8b8b] tracking-[0.14] uppercase mb-8">
          Restricted &middot; Administrator access only
        </p>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-IBM-Plex-Mono text-[11px] text-[#8b8b8b] uppercase tracking-[0.14]">
              Email address
            </label>
            <input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@thestatic.example"
              className="bg-[#000] border border-[#3a3a3a] text-[#ececec] px-4 py-3 rounded-[10px] font-Inter text-[15px] w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-IBM-Plex-Mono text-[11px] text-[#8b8b8b] uppercase tracking-[0.14]">
              Password
            </label>
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              className="bg-[#000] border border-[#3a3a3a] text-[#ececec] px-4 py-3 rounded-[10px] font-Inter text-[15px] w-full"
            />
          </div>
          {error && (
            <p className="text-[#ffffff] font-IBM-Plex-Mono text-[12px] mb-3">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full"
          >
            {loading ? <span className="flex items-center gap-2"><Loader2 size={18} /> Sign in</span> : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Button({ children, variant = "primary", className = "", type = "button", disabled = false }: { children: React.ReactNode; variant?: "primary" | "ghost"; className?: string; type?: "reset" | "submit" | "button"; disabled?: boolean }) {
  const base = "font-Space-Grotesk font-bold text-[13px] tracking-[0.06] uppercase px-4 py-3 rounded-[10px]";
  const variants = { primary: "bg-[#ececec] text-[#000]", ghost: "bg-transparent text-[#ececec]" };
  return (
    <button type={type} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
