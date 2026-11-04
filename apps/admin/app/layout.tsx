import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Static Control",
  description: "The Static — administrator dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ background: "#070707", color: "#ececec" }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* The dashboard styles itself with inline font-family names, so the
            families must keep their real names instead of next/font hashes. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap"
        />
      </head>
      <body style={{ background: "#070707", color: "#ececec", margin: 0 }}>{children}</body>
    </html>
  );
}
