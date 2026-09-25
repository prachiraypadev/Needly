import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jod — Community Needs Marketplace",
  description:
    "A trusted community-based marketplace for needs, resources, rentals, purchases, and services. Say what you need, and let your community fulfill it.",
  keywords: [
    "community marketplace",
    "neighborhood sharing",
    "borrow tools",
    "rent items",
    "local services",
    "apartment society",
  ],
  authors: [{ name: "Jod Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#339966",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)] antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
