import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "PDF Document",
  description: "PDF document view",
};

// Force light color scheme at the browser/meta level.
// This is the MOST authoritative way to prevent Chromium (headless/Docker)
// from activating dark UA rendering caused by Tailwind v4 preflight
// setting  color-scheme: light dark  on :root.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'light',  // injects <meta name="color-scheme" content="light">
};

export default function PDFLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="pdf-document-wrapper"
      style={{ margin: 0, padding: 0, background: '#ffffff', colorScheme: 'light' }}
    >
      {children}
    </div>
  );
}

