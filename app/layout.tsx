import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./mobile-overrides.css";
import "./responsive-fixes.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Chat App",
  description: "A modern chat application with AI capabilities",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} overflow-x-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
