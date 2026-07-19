import type { Metadata } from "next";
import { Game } from "@/components/game";
import { SiteShell } from "@/components/site-shell";
import { PRODUCTION_URL, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: PRODUCTION_URL,
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  inLanguage: "en",
  isAccessibleForFree: true,
  author: {
    "@type": "Person",
    name: "Sartaj Alam",
    url: "https://sartajalam.in",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function HomePage() {
  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Game />
    </SiteShell>
  );
}
