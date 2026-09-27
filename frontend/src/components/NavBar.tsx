"use client";

import Link from "next/link";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../lib/LanguageProvider";

const links = [
  ["nav_services", "/services"],
  ["nav_schemes", "/schemes"],
  ["nav_journeys", "/journeys"],
  ["nav_vault", "/vault"],
  ["nav_maharashtra", "/maharashtra"],
  ["nav_grievance", "/grievance"],
] as const;

export function NavBar() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="setu-final-header">
      <div className="setu-utility-bar">
        <div className="setu-final-container">
          <span>Government Citizen Services</span>
          <div className="setu-utility-links">
            <LanguageSwitcher />
            <span className="setu-utility-divider" />
            <span>{t("nav_accessibility")}</span>
          </div>
        </div>
      </div>

      <div className="setu-main-header">
        <div className="setu-final-container setu-header-inner">
          <Link href="/" className="setu-brand" onClick={() => setOpen(false)}>
            <span className="setu-brand-mark">S</span>
            <span><strong>SETU</strong><small>Citizen Services Portal</small></span>
          </Link>

          <button
            className="setu-mobile-toggle"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            <span /><span /><span />
          </button>

          <nav className={open ? "setu-final-nav open" : "setu-final-nav"} aria-label="Primary navigation">
            {links.map(([key, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>{t(key)}</Link>
            ))}
            <Link className="setu-nav-assistant" href="/assistant" onClick={() => setOpen(false)}>
              {t("nav_assistant")}
            </Link>
            <Link className="setu-nav-login" href="/login" onClick={() => setOpen(false)}>
              {t("nav_login")}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}


export default NavBar;
