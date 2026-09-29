"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/LanguageProvider";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="setu-footer" role="contentinfo">
      <div className="setu-wrap">
        <div className="setu-footer-grid">
          {/* Brand & Purpose */}
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "14px" }}>
              <div
                style={{
                  background: "#ffffff",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                  width: "fit-content",
                  maxWidth: "220px",
                }}
              >
                <Image
                  src="/ekam-logo-full.png"
                  alt="EKAM — One Gateway. Connected Services."
                  width={200}
                  height={189}
                  style={{ width: "100%", height: "auto", objectFit: "contain" }}
                />
              </div>
              <div>
                <strong style={{ fontSize: "1.15rem", letterSpacing: "0.06em", color: "#ffffff", display: "block" }}>
                  EKAM
                </strong>
                <small style={{ display: "block", color: "#9fb5c8", fontSize: "0.72rem", letterSpacing: "0.04em" }}>
                  One Gateway. Connected Services.
                </small>
              </div>
            </div>
            <p style={{ fontSize: "0.82rem", lineHeight: "1.65", color: "#c5d7e5", maxWidth: "420px" }}>
              <strong>EKAM — An Integrated Citizen Service Orchestration Platform</strong> for Maharashtra.
              Built on the principle of <strong>Goal Before Department</strong>: enter details once, verify documents once, and track complete cross-department journeys in one place.
            </p>
            <div style={{ marginTop: "14px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span className="setu-status setu-status-verified" style={{ background: "rgba(35,118,78,0.2)", color: "#9fe4be" }}>
                ✓ One Citizen Profile
              </span>
              <span className="setu-status setu-status-verified" style={{ background: "rgba(35,118,78,0.2)", color: "#9fe4be" }}>
                ✓ One Document Vault
              </span>
              <span className="setu-status setu-status-verified" style={{ background: "rgba(35,118,78,0.2)", color: "#9fe4be" }}>
                ✓ One Consent Layer
              </span>
            </div>
          </div>

          {/* Citizen Services Navigation */}
          <div>
            <h2>Citizen Services</h2>
            <nav aria-label="Footer services navigation">
              <Link href="/services">{t("nav_services")}</Link>
              <Link href="/schemes">{t("nav_schemes")}</Link>
              <Link href="/journeys">{t("nav_journeys")}</Link>
              <Link href="/vault">{t("nav_vault")}</Link>
              <Link href="/profile">{t("nav_profile")}</Link>
              <Link href="/grievance">{t("nav_grievance")}</Link>
              <Link href="/assistant">{t("nav_assistant")}</Link>
            </nav>
          </div>

          {/* Maharashtra Administration & Governance */}
          <div>
            <h2>Government of Maharashtra</h2>
            <nav aria-label="Footer administrative navigation">
              <Link href="/maharashtra">Maharashtra State Overview</Link>
              <Link href="/maharashtra/intelligence">District & Service Intelligence</Link>
              <Link href="/accessibility">{t("nav_accessibility")}</Link>
              <Link href="/notifications">{t("nav_notifications")}</Link>
              <Link href="/officer">Officer Workspace</Link>
              <Link href="/admin">Administrative Command Center</Link>
              <a href="https://aaplesarkar.mahaonline.gov.in" target="_blank" rel="noreferrer">
                Aaple Sarkar Portal ↗
              </a>
              <a href="https://maharashtra.gov.in" target="_blank" rel="noreferrer">
                Official Maharashtra Portal ↗
              </a>
            </nav>
          </div>
        </div>

        {/* Footer Notes & Statutory Boundary */}
        <div className="setu-footer-note">
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
            <div>
              © 2026 Government of Maharashtra · EKAM Citizen Service Orchestration Layer
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Link href="/accessibility">Accessibility Statement</Link>
              <span>·</span>
              <Link href="/grievance">Grievance Redressal</Link>
              <span>·</span>
              <Link href="/assistant">EKAM Assistant</Link>
            </div>
          </div>
          <p style={{ marginTop: "10px", fontSize: "0.72rem", color: "#8ea3b4", lineHeight: "1.5" }}>
            <strong>Demo & Prototype Boundary:</strong> EKAM is an integration-ready citizen service orchestration prototype prepared for Smart India Hackathon (SIH 2026). Departmental adapters, service datasets, and metadata are for demonstration and navigation purposes. Official statutory rules and service eligibility must be validated against authoritative department sources.
          </p>
        </div>
      </div>
    </footer>
  );
}
