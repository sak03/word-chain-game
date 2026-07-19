"use client";

import Link from "next/link";

export function SiteShell({ children }: { children: React.ReactNode }) {
  function toggleTheme() {
    const nextDark = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";
    localStorage.setItem("word-chain-theme", nextDark ? "dark" : "light");
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Word Chain Challenge home">
          <span className="brand-mark" aria-hidden="true">
            <span>W</span><span>C</span>
          </span>
          <span className="brand-copy">
            <strong>Word Chain</strong>
            <small>Challenge</small>
          </span>
        </Link>
        <button
          className="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          title="Toggle color theme"
        >
          <span className="moon-icon" aria-hidden="true">☾</span>
          <span className="sun-icon" aria-hidden="true">☀</span>
        </button>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <p>© 2025 Word Chain Challenge</p>
        <nav aria-label="Legal">
          <Link href="/terms">Terms of Use</Link>
          <span aria-hidden="true">·</span>
          <Link href="/privacy">Privacy Policy</Link>
        </nav>
        <p>
          Maintained by{" "}
          <a href="https://sartajalam.in" target="_blank" rel="noreferrer">
            Sartaj Alam
          </a>
        </p>
      </footer>
    </div>
  );
}
