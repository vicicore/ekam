"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, citizenApi } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useLanguage } from "@/lib/LanguageProvider";

interface DemoAccount {
  name: string;
  identifier: string;
  phone: string;
  role: string;
  district: string;
  taluka: string;
  isPrimaryDemo?: boolean;
  isAdmin?: boolean;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: "Rahul Sharma",
    identifier: "9876543210",
    phone: "9876543210",
    role: "Student / Scholarship Applicant",
    district: "Pune",
    taluka: "Haveli",
    isPrimaryDemo: true,
  },
  {
    name: "Sunita Patil",
    identifier: "9822012345",
    phone: "9822012345",
    role: "Small Business Entrepreneur",
    district: "Nashik",
    taluka: "Nashik Urban",
  },
  {
    name: "Ramesh Jadhav",
    identifier: "9850011223",
    phone: "9850011223",
    role: "Citizen / Farmer Applicant",
    district: "Chhatrapati Sambhajinagar",
    taluka: "Aurangabad",
  },
  {
    name: "EKAM Signature Journey",
    identifier: "demo-college-admission-scholarship",
    phone: "9811002233",
    role: "College Admission & Scholarship Journey",
    district: "Mumbai Suburban",
    taluka: "Andheri",
  },
  {
    name: "Department Administrator",
    identifier: "admin",
    phone: "9800000001",
    role: "Mantralaya Admin / Operations Officer",
    district: "Mumbai City",
    taluka: "General Administration",
    isAdmin: true,
  },
];

function LoginFormContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggedIn } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const rawRedirect = searchParams.get("redirect") || "/profile";
  const redirectPath =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/profile";

  useEffect(() => {
    if (isLoggedIn) {
      router.replace(redirectPath);
    }
  }, [isLoggedIn, router, redirectPath]);

  const handleLogin = async (idToUse?: string) => {
    const val = (idToUse ?? identifier).trim();
    if (!val) {
      setError("Please enter your mobile number or citizen identifier.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const session = await login(val);
      setSuccess(true);

      // Pre-seed profile details for demo accounts so citizen dashboard / My EKAM has rich data
      const matchedDemo = DEMO_ACCOUNTS.find(
        (c) => c.identifier === val || c.phone === val,
      );
      if (matchedDemo && session?.token && session?.citizen_id) {
        try {
          await citizenApi.upsertProfile(
            session.citizen_id,
            {
              full_name: matchedDemo.name,
              district: matchedDemo.district,
              taluka: matchedDemo.taluka,
              phone: matchedDemo.phone,
              preferred_language: "en",
            },
            session.token,
          );
        } catch {
          // Non-fatal if upsert fails
        }
      }

      router.push(redirectPath);
    } catch (err: unknown) {
      setSuccess(false);
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403) {
          setError("Unable to sign in. Please check your credentials and try again.");
        } else if (err.status === 422) {
          setError("Invalid identifier format. Please enter a valid mobile number or identifier.");
        } else if (err.status >= 500) {
          setError("The authentication service encountered an error. Please try again later.");
        } else {
          setError(err.message || "Unable to sign in. Please check your credentials and try again.");
        }
      } else if (err instanceof TypeError && err.message.toLowerCase().includes("fetch")) {
        setError("Unable to connect to EKAM services. Please verify the service is running and try again.");
      } else {
        setError("Unable to connect to EKAM services. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const primaryDemo = DEMO_ACCOUNTS.find((a) => a.isPrimaryDemo) || DEMO_ACCOUNTS[0];

  return (
    <main
      className="setu-container"
      style={{
        padding: "48px 16px",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: "480px", width: "100%" }}>
        {/* Portal Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ marginBottom: "16px" }}>
            <Image
              src="/ekam-official-logo.png"
              alt="एकम — सर्व सरकारी सेवाएँ • सर्व सरकारी प्रमाणपत्र एकाच ठिकाणी"
              width={200}
              height={200}
              priority
              style={{ margin: "0 auto", height: "auto", maxWidth: "200px" }}
            />
          </div>
          <div
            style={{
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
              border: "1px solid var(--setu-border)",
            }}
          >
            <span>🏛️</span>
            <span>GOVERNMENT OF MAHARASHTRA</span>
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "var(--setu-navy)",
              margin: "0 0 8px 0",
            }}
          >
            {t("nav_login")}
          </h1>
          <p
            style={{
              fontSize: "0.88rem",
              color: "var(--setu-slate)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Access My EKAM, your unified Document Vault, active service journeys, and consent records.
          </p>
        </div>

        {/* Auth Card */}
        <div
          style={{
            background: "var(--setu-surface)",
            border: "1px solid var(--setu-border)",
            borderRadius: "var(--setu-radius-lg)",
            padding: "28px",
            boxShadow: "0 4px 20px rgba(16, 42, 67, 0.06)",
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <label style={{ display: "block", marginBottom: "16px" }}>
              <span
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--setu-navy)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: "6px",
                }}
              >
                Mobile Number or Citizen Identifier
              </span>
              <input
                type="text"
                value={identifier}
                disabled={submitting}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9876543210 or citizen identifier"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "var(--setu-radius-md)",
                  border: "1px solid var(--setu-border)",
                  fontSize: "0.95rem",
                  color: "var(--setu-navy)",
                  outline: "none",
                  boxSizing: "border-box",
                  background: submitting ? "var(--setu-surface-sunken)" : "#ffffff",
                }}
              />
            </label>

            {error && (
              <div
                style={{
                  background: "#fee2e2",
                  border: "1px solid #f87171",
                  borderRadius: "var(--setu-radius-md)",
                  padding: "10px 12px",
                  color: "#991b1b",
                  fontSize: "0.82rem",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span aria-hidden="true">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: "var(--setu-radius-md)",
                  padding: "10px 12px",
                  color: "#166534",
                  fontSize: "0.82rem",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span aria-hidden="true">✓</span>
                <span>Authentication successful! Establishing session and redirecting...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !identifier.trim()}
              className="setu-btn setu-btn-primary"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "0.95rem",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              {submitting ? "Signing in..." : "Continue to My EKAM →"}
            </button>
          </form>

          {/* Quick Demo Sign In Button */}
          <div style={{ marginTop: "12px" }}>
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setIdentifier(primaryDemo.identifier);
                handleLogin(primaryDemo.identifier);
              }}
              className="setu-btn"
              style={{
                width: "100%",
                padding: "11px",
                fontSize: "0.9rem",
                justifyContent: "center",
                fontWeight: 700,
                background: "var(--setu-surface-sunken)",
                border: "1.5px solid var(--setu-saffron, #c47b16)",
                color: "var(--setu-navy, #102a43)",
                borderRadius: "var(--setu-radius-md)",
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>⚡</span>
              <span>Demo Sign In (Instant Access)</span>
            </button>
          </div>

          {/* Divider */}
          <div
            style={{
              margin: "24px 0",
              borderTop: "1px solid var(--setu-border-subtle)",
              position: "relative",
              textAlign: "center",
            }}
          >
            <span
              style={{
                position: "relative",
                top: "-10px",
                background: "var(--setu-surface)",
                padding: "0 10px",
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--setu-slate)",
                letterSpacing: "0.05em",
              }}
            >
              OR SELECT DEMO EVALUATION ACCOUNT
            </span>
          </div>

          {/* Demo Citizen Profile Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {DEMO_ACCOUNTS.map((c) => (
              <button
                key={c.identifier}
                type="button"
                onClick={() => {
                  setIdentifier(c.identifier);
                  handleLogin(c.identifier);
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
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "var(--setu-navy)",
                      }}
                    >
                      {c.name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "4px",
                        background: c.isAdmin ? "#fef3c7" : "#e0f2fe",
                        color: c.isAdmin ? "#92400e" : "#0369a1",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Demo Account
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--setu-slate)" }}>
                    {c.role} · {c.district}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "var(--setu-blue)",
                    whiteSpace: "nowrap",
                    marginLeft: "8px",
                  }}
                >
                  Use →
                </span>
              </button>
            ))}
          </div>

          {/* Server-verified notice */}
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              background: "#f0fdf4",
              borderRadius: "var(--setu-radius-md)",
              border: "1px solid #bbf7d0",
              fontSize: "0.75rem",
              color: "#166534",
              lineHeight: 1.45,
            }}
          >
            <strong>Server-Verified Bearer Authentication:</strong> Authenticates via real backend endpoints (<code>/api/v1/auth/session</code>) and issues cryptographically verified session tokens. Demo accounts are safe mock profiles for evaluation.
          </div>
        </div>

        {/* Footer Navigation */}
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "0.82rem" }}>
          <Link
            href="/"
            style={{ color: "var(--setu-blue)", textDecoration: "none" }}
          >
            ← Return to EKAM Home
          </Link>
          <span style={{ margin: "0 10px", color: "var(--setu-border)" }}>•</span>
          <Link
            href="/accessibility"
            style={{ color: "var(--setu-slate)", textDecoration: "none" }}
          >
            Accessibility Options
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main
          className="setu-container"
          style={{
            padding: "48px 16px",
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center", color: "var(--setu-slate)" }}>
            <Image
              src="/ekam-official-logo.png"
              alt="एकम Loading"
              width={56}
              height={56}
              style={{ margin: "0 auto 12px", height: "auto", width: "56px" }}
            />
            <div>Loading Sign In...</div>
          </div>
        </main>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
