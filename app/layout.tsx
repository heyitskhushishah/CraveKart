import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CraveKart — Delicious food, delivered fast",
    template: "%s · CraveKart",
  },
  description:
    "Order mouth-watering meals from the best restaurants in town and get them delivered hot to your door. CraveKart.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-cream text-ink-900">
        {children}
      </body>
    </html>
  );
}
