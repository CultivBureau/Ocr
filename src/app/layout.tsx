import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/app/modules/shared/styles/pdf-export.css";
import { Providers } from "./providers";
import HistorySidebarWrapper from "@/app/modules/history/components/HistorySidebarWrapper";
import IframeDetector from "@/app/modules/shared/components/IframeDetector";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HappyLife Travel - PDF Template Generator",
  description: "Convert PDF to editable Next.js templates - HappyLife Travel & Tourism",
};

// Configure viewport for mobile responsiveness
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <IframeDetector />
        <Providers>
          <HistorySidebarWrapper>
            {children}
          </HistorySidebarWrapper>
        </Providers>
      </body>
    </html>
  );
}
