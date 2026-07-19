import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const metadataBase = new URL(host ? `${protocol}://${host}` : "http://localhost:3000");
  const description =
    "A playful word-chain game for kids. Challenge WordBot or take turns with a friend.";

  return {
    metadataBase,
    title: {
      default: "Word Chai Challenge",
      template: "%s | Word Chai Challenge",
    },
    description,
    openGraph: {
      title: "Word Chai Challenge",
      description,
      type: "website",
      images: [{ url: "/og.png", width: 1536, height: 1024 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Word Chai Challenge",
      description,
      images: ["/og.png"],
    },
  };
}

const themeScript = `
  try {
    const saved = localStorage.getItem('word-chai-theme');
    const theme = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
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
