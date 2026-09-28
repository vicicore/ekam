"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useLanguage } from "@/lib/LanguageProvider";

const DEMO_CITIZENS = [
  {
    name: "Rahul Sharma",
    phone: "9876543210",
    role: "Student / Scholarship Applicant",
    district: "Pune",
  },
  {
    name: "Sunita Patil",
    phone: "9822012345",
    role: "Small Business Entrepreneur",
    district: "Nashik",
  },
  {
    name: "Ramesh Jadhav",
    phone: "9850011223",
    role: "Citizen / Farmer Applicant",
    district: "Chhatrapati Sambhajinagar",
  },
];

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn) router.replace("/services");
  }, [isLoggedIn, router]);

  const handleLogin = async (idToUse?: string) => {
    const val = (idToUse ?? identifier).trim();
    if (!val) return;
    setSubmitting(true);
    setError(null);
    try {
      await login(val);
      router.push("/profile");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error_generic"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="setu-container" style={{ padding: "48px 16px", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: "460px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 12px",
            background: "var(--setu-surface-sunken)",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "var(--setu-navy)",
            marginBottom: "12px",
            border: "1px solid var(--setu-border)"
          }}>
            <span>🏛️</span>
            <span>GOVERNMENT OF MAHARASHTRA</span>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--setu-navy)", margin: "0 0 8px 0" }}>
            Citizen Sign In
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--setu-slate)", margin: 0, lineHeight: 1.5 }}>
            Access My SETU, your unified Document Vault, active service journeys, and consent records.
          </p>
        </div>

        <div style={{
          background: "var(--setu-surface)",
          border: "1px solid var(--setu-border)",
          borderRadius: "var(--setu-radius-lg)",
          padding: "28px",
          boxShadow: "0 4px 20px rgba(16, 42, 67, 0.06)",
        }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <label style={{ display: "block", marginBottom: "16px" }}>
              <span style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--setu-navy)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                Mobile Number or Citizen Identifier
              </span>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9876543210"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--setu-radius-md)",
                  border: "1px solid var(--setu-border)",
                  fontSize: "0.95rem",
                  color: "var(--setu-navy)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </label>

            {error && (
              <div style={{
                background: "#fee2e2",
                border: "1px solid #f87171",
                borderRadius: "var(--setu-radius-md)",
                padding: "10px 12px",
                color: "#991b1b",
                fontSize: "0.82rem",
                marginBottom: "16px",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !identifier.trim()}
              className="setu-btn setu-btn-primary"
              style={{ width: "100%", padding: "12px", fontSize: "0.95rem", justifyContent: "center" }}
            >
              {submitting ? "Signing in..." : "Continue to My SETU →"}
            </button>
          </form>

          <div style={{ margin: "24px 0", borderTop: "1px solid var(--setu-border-subtle)", position: "relative", textAlign: "center" }}>
            <span style={{
              position: "relative",
              top: "-10px",
              background: "var(--setu-surface)",
              padding: "0 10px",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--setu-slate)",
              letterSpacing: "0.05em",
            }}>
              OR SELECT DEMO CITIZEN PROFILE
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {DEMO_CITIZENS.map((c) => (
              <button
                key={c.phone}
                type="button"
                onClick={() => {
                  setIdentifier(c.phone);
                  handleLogin(c.phone);
                }}
                disabled={submitting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "var(--setu-radius-md)",
                  border: "1px solid var(--setu-border)",
                  background: "var(--setu-surface-sunken)",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--setu-navy)" }}>{c.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--setu-slate)" }}>{c.role} · {c.district}</div>
                </div>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--setu-blue)" }}>
                  Use →
                </span>
              </button>
            ))}
          </div>

          <div style={{
            marginTop: "20px",
            padding: "12px",
            background: "#f0fdf4",
            borderRadius: "var(--setu-radius-md)",
            border: "1px solid #bbf7d0",
            fontSize: "0.75rem",
            color: "#166534",
            lineHeight: 1.45,
          }}>
            <strong>Server-Verified Token Authentication:</strong> Signs into real session endpoints via <code>/api/v1/auth/session</code> and generates a cryptographically secured citizen bearer token stored in your browser session.
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "0.82rem" }}>
          <Link href="/" style={{ color: "var(--setu-blue)", textDecoration: "none" }}>
            ← Return to SETU Home
          </Link>
          <span style={{ margin: "0 10px", color: "var(--setu-border)" }}>•</span>
          <Link href="/accessibility" style={{ color: "var(--setu-slate)", textDecoration: "none" }}>
            Accessibility Options
          </Link>
        </div>
      </div>
    </main>
  );
}
