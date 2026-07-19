import Link from "next/link";
import { SiteShell } from "./site-shell";

interface Section {
  title: string;
  content: React.ReactNode;
}

export function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Section[];
}) {
  return (
    <SiteShell>
      <article className="legal-page">
        <Link className="back-link" href="/">← Back to game</Link>
        <header>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
          <small>Last updated: July 19, 2026</small>
        </header>
        <div className="legal-content">
          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <div>{section.content}</div>
            </section>
          ))}
        </div>
      </article>
    </SiteShell>
  );
}
