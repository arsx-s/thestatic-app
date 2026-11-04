import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ServiceWorkerRegister } from "../components/service-worker-register";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "The Static",
  description: "There's more of us than you think.",
  themeColor: "#070707",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#070707" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="The Static" />
        <link rel="manifest" href="/manifest" />
        <link rel="icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-startup-image" href="/icons/splash.png" />
        <link rel="mask-icon" href="/icons/mask-icon.svg" color="#070707" />
      </head>
      <body className={`${inter.variable} bg-[#070707] text-[#ececec]`}>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
