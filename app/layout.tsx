import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "arjun.systems",
  description: "Internal tools and infrastructure hub.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
