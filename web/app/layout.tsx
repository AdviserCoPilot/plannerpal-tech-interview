import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Atlas Academy - After-School Classes",
  description:
    "Book after-school classes. Join the waitlist when classes are full.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="min-h-screen bg-gradient-to-b from-violet-200 via-violet-100 to-violet-50 text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
