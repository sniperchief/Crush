import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Caveat, DM_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const mono = DM_Mono({
  variable: "--font-dmmono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const hand = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Amarachi — The Unexpected Plot Twist",
  description: "A small, slightly random thing made for Amarachi.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#F6F5F0",
  colorScheme: "light",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${mono.variable} ${hand.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
