"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/lib/LanguageProvider";
import { useAuth } from "@/lib/useAuth";

const navLinks = [
  { key: "nav_services", href: "/services" },
  { key: "nav_schemes", href: "/schemes" },
  { key: "nav_journeys", href: "/journeys" },
  { key: "nav_vault", href: "/vault" },
  { key: "nav_grievance", href: "/grievance" },
  { key: "nav_maharashtra", href: "/maharashtra" },
  { key: "nav_assistant", href: "/assistant" },
  { key: "nav_profile", href: "/profile" },
] as const;

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();
  const { citizenId, isLoggedIn, logout } = useAuth();

  return (
    <header className="setu-shell-header" role="banner">
      {/* Government Utility Layer */}
      <div className="setu-utility">
        <div className="setu-utility-inner">
          <div className="setu-utility-left">
            <span style={{ fontWeight: 800, color: "#f2c36d", letterSpacing: "0.04em" }}>
              महाराष्ट्र शासन
            </span>
            <span style={{ opacity: 0.6 }}>|</span>
            <span>Government of Maharashtra</span>
            <span style={{ opacity: 0.6 }}>·</span>
            <span style={{ color: "#d2dfea" }}>SETU Citizen Portal</span>
          </div>

          <div className="setu-utility-right">
            <LanguageSwitcher />
            <Link href="/accessibility" style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span>{t("nav_accessibility")}</span>
            </Link>
            <span style={{ opacity: 0.5 }}>|</span>
            <Link href="/notifications" style={{ fontSize: "0.75rem" }}>
              {t("nav_notifications")}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Standardized Navigation Layer */}
      <div className="setu-nav-inner">
        {/* Brand */}
        <Link href="/" className="setu-brand" onClick={() => setMobileOpen(false)}>
          <span className="setu-brand-mark" aria-hidden="true">S</span>
          <div>
            <strong>SETU</strong>
            <small>Seamless Exchange & Transformative Ubiquity</small>
          </div>
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="setu-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </button>

        {/* Desktop & Mobile Menu Navigation */}
        <nav
          className={`setu-nav-links ${mobileOpen ? "is-open" : ""}`}
          aria-label="Primary navigation"
        >
          {navLinks.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "is-active" : ""}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
              >
                {t(item.key)}
              </Link>
            );
          })}

          {/* Citizen Auth State Action */}
          {isLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "6px" }}>
              <Link
                href="/profile"
                className="setu-btn setu-btn-secondary"
                style={{ minHeight: "36px", padding: "0 12px", fontSize: "0.75rem", textDecoration: "none" }}
                onClick={() => setMobileOpen(false)}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "var(--setu-blue)",
                    color: "#fff",
                    display: "inline-grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: "0.7rem",
                  }}
                >
                  {citizenId ? citizenId.slice(0, 1).toUpperCase() : "C"}
                </span>
                <span>{citizenId ? `${citizenId.slice(0, 10)}` : "Citizen"}</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="setu-btn-tertiary"
                style={{ fontSize: "0.75rem", cursor: "pointer", background: "none", border: 0, padding: "4px 8px" }}
                aria-label="Sign out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="setu-btn setu-btn-primary setu-nav-login"
              onClick={() => setMobileOpen(false)}
            >
              {t("nav_login")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default NavBar;
