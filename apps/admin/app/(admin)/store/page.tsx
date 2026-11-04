"use client";

export default function StorePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontFamily: "Space Grotesk, ui-sans-serif, system-ui", fontSize: 22, fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", color: "#ececec", margin: 0 }}>Store</h1>
      <div style={{ background: "#0a0a0a", border: "1px solid #2b2b2b", borderRadius: 12, padding: 24, color: "#8b8b8b", fontFamily: "IBM Plex Mono, ui-monospace, monospace" }}>
        Merchandise catalogue, orders and fulfilment management.
      </div>
    </div>
  );
}
