"use client";

import Link from "next/link";
import Image from "next/image";
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
  const { citizenId, role, name, isLoggedIn, logout } = useAuth();

  const linksToRender = isLoggedIn
    ? navLinks.filter((item) => item.href !== "/profile")
    : navLinks;

  const getInitials = () => {
    if (role === "admin") return "A";
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    return citizenId ? citizenId.slice(0, 1).toUpperCase() : "C";
  };

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
            <span style={{ color: "#d2dfea" }}>EKAM Citizen Portal</span>
          </div>

          <div className="setu-utility-right">
            <LanguageSwitcher />
            <Link
              href="/accessibility"
              style={{
                fontSize: "0.75rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
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
          <Image
            src="/ekam-emblem.png"
            alt="EKAM Emblem"
            width={40}
            height={40}
            priority
            style={{ width: "40px", height: "40px", objectFit: "contain", flexShrink: 0 }}
          />
          <div>
            <strong>EKAM</strong>
            <small>One Gateway. Connected Services.</small>
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
          {linksToRender.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
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
            <div className="setu-nav-user-container">
              <Link
                href="/profile"
                className="setu-nav-user-pill"
                onClick={() => setMobileOpen(false)}
                title="Open My EKAM Citizen Dashboard"
              >
                <span className={`setu-nav-avatar ${role === "admin" ? "is-admin" : ""}`}>
                  {getInitials()}
                </span>
                <div className="setu-nav-user-details">
                  <span className="setu-nav-user-name">
                    {name || (role === "admin" ? "Admin Officer" : "Demo Citizen")}
                  </span>
                  <span className="setu-nav-user-tag">
                    {role === "admin" ? "Administrator" : "Demo Citizen"}
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="setu-nav-signout-btn"
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
