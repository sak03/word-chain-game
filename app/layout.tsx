import type { Metadata } from "next";
import { headers } from "next/headers";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const metadataBase = new URL(host ? `${protocol}://${host}` : "http://localhost:3000");
  return {
    metadataBase,
    applicationName: SITE_NAME,
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: [
      "word chain game",
      "word game for kids",
      "English vocabulary game",
      "two player word game",
      "educational word game",
      "online word antakshari",
    ],
    authors: [{ name: "Sartaj Alam", url: "https://sartajalam.in" }],
    creator: "Sartaj Alam",
    publisher: SITE_NAME,
    category: "games",
    referrer: "origin-when-cross-origin",
    formatDetection: { email: false, address: false, telephone: false },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: metadataBase,
      images: [{ url: "/og.png", width: 1536, height: 1024 }],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: ["/og.png"],
    },
  };
}

const themeScript = `
  try {
    const saved = localStorage.getItem('word-chain-theme') || localStorage.getItem('word-chai-theme');
    const theme = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    if (saved) localStorage.setItem('word-chain-theme', saved);
    localStorage.removeItem('word-chai-theme');
  } catch {}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
