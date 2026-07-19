"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

function subscribeTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getThemeSnapshot() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot() {
  return "light" as const;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("word-chain-theme", next);
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Skip to game
      </a>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Word Chain Challenge home">
          <span className="brand-mark" aria-hidden="true">
            <span>W</span>
            <span>C</span>
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
          aria-pressed={theme === "dark"}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          <span className="moon-icon" aria-hidden="true">
            ☾
          </span>
          <span className="sun-icon" aria-hidden="true">
            ☀
          </span>
        </button>
      </header>

      <main id="main">{children}</main>

      <footer className="site-footer">
        <p>© 2026 Word Chain Challenge</p>
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
