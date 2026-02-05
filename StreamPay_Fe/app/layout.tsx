import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-streampay-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-streampay-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "StreamPay | Sui Micro-Subscription for Premium PDFs",
  description:
    "Decentralized pay-per-time access for premium PDFs on Sui. Deposit, stream, settle, refund.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${fraunces.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
