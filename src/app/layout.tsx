import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MoodScape - Your Mood. Your Wallpaper.",
  description: "Generate beautiful AI wallpapers that match your mood. Create, edit, and customize wallpapers with AI-powered tools.",
  keywords: ["wallpaper", "AI", "generator", "mood", "custom"],
  authors: [{ name: "MoodScape" }],
  openGraph: {
    title: "MoodScape - Your Mood. Your Wallpaper.",
    description: "Generate beautiful AI wallpapers that match your mood.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

