import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

// Used for the wordmark, buttons and numbers only — it is close to unreadable
// at body size, so body copy stays on Geist.
const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WattLah! — save energy, level up your block",
  description: "Turn your apartment's energy use into a game. LifeHack 2026.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${pressStart.variable} min-h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
