"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { grievanceApi } from "@/lib/grievanceApi";
import { useLanguage } from "@/lib/LanguageProvider";

type Grievance = {
  id: string;
  title: string;
  category: string;
  department: string;
  status: "Submitted" | "Under Review" | "Resolved";
  submitted: string;
  updated: string;
  description: string;
  priority: "Normal" | "High";
};

const initialGrievances: Grievance[] = [
  {
    id: "EKAM-GRV-2026-01482",
    title: "Delay in certificate service",
    category: "Certificates & Documents",
    department: "Revenue Department",
    status: "Under Review",
    submitted: "18 Sep 2026",
    updated: "22 Sep 2026",
    description: "Application has exceeded the expected service timeline.",
    priority: "High",
  },
  {
    id: "EKAM-GRV-2026-01317",
    title: "Service information request",
    category: "Citizen Services",
    department: "District Administration",
    status: "Submitted",
    submitted: "14 Sep 2026",
    updated: "14 Sep 2026",
    description: "Request for clarification regarding the required documents.",
    priority: "Normal",
  },
  {
    id: "EKAM-GRV-2026-00964",
    title: "Status update requested",
    category: "Application Tracking",
    department: "Transport Department",
    status: "Resolved",
    submitted: "02 Sep 2026",
    updated: "09 Sep 2026",
    description: "Citizen requested an update on an existing application.",
    priority: "Normal",
  },
];

const categories = [
  "Certificates & Documents",
  "Revenue & Land",
  "Transport",
  "Social Welfare",
  "Education",
  "Health",
  "Citizen Services",
  "Other",
];

export default function GrievancePage() {
  const { t } = useLanguage();
  const [grievances, setGrievances] = useState<Grievance[]>(initialGrievances);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    grievanceApi.mine().then((mine) => {
      if (mine && mine.length > 0) {
        const mapped: Grievance[] = mine.map((g) => ({
          id: g.acknowledgement_number || g.id,
          title: g.title,
          category: g.category,
          department: g.department || "General Administration",
          status: g.status === "resolved" ? "Resolved" : g.status === "under_review" ? "Under Review" : "Submitted",
          submitted: new Date(g.created_at).toLocaleDateString(),
          updated: new Date(g.updated_at).toLocaleDateString(),
          description: g.description,
          priority: g.priority === "high" ? "High" : "Normal",
        }));
        setGrievances((existing) => {
          const ids = new Set(mapped.map((m) => m.id));
          return [...mapped, ...existing.filter((e) => !ids.has(e.id))];
        });
      }
    }).catch(() => {});
  }, []);

  const [form, setForm] = useState({
    title: "",
    category: categories[0],
    department: "",
    description: "",
    priority: "Normal",
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return grievances;
    return grievances.filter((g) =>
      `${g.id} ${g.title} ${g.category} ${g.department} ${g.status}`.toLowerCase().includes(q)
    );
  }, [query, grievances]);

  async function submitGrievance(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await grievanceApi.create({
        title: form.title,
        category: form.category,
        department: form.department || undefined,
        description: form.description,
        priority: form.priority.toLowerCase() as "normal" | "high",
      });
      const ackId = created.acknowledgement_number || created.id;
      const newItem: Grievance = {
        id: ackId,
        title: created.title,
        category: created.category,
        department: created.department || form.department || "Relevant Department",
        status: created.status === "resolved" ? "Resolved" : created.status === "under_review" ? "Under Review" : "Submitted",
        submitted: "Today",
        updated: "Today",
        description: created.description,
        priority: created.priority === "high" ? "High" : "Normal",
      };
      setGrievances((items) => [newItem, ...items]);
      setSubmittedId(ackId);
    } catch {
      // Demo-safe graceful fallback if user is in demo mode or server is offline
      const fallbackId = `EKAM-GRV-${new Date().getFullYear()}-${String(grievances.length + 1540).padStart(5, "0")}`;
      const newItem: Grievance = {
        id: fallbackId,
        title: form.title,
        category: form.category,
        department: form.department || "Relevant Department",
        status: "Submitted",
        submitted: "Today",
        updated: "Today",
        description: form.description,
        priority: form.priority as "Normal" | "High",
      };
      setGrievances((items) => [newItem, ...items]);
      setSubmittedId(fallbackId);
    } finally {
      setSubmitting(false);
      setForm({ title: "", category: categories[0], department: "", description: "", priority: "Normal" });
      setShowForm(false);
    }
  }

  return (
    <main className="setu-grievance-page">
      <section className="setu-grievance-hero">
        <div className="setu-container">
          <div className="setu-breadcrumb">
            <Link href="/">{t("home")}</Link><span>/</span><span>{t("grievance")}</span>
          </div>
          <div className="setu-section-kicker">CITIZEN GRIEVANCE & SUPPORT</div>
          <h1>{t("grievance_hero_title")}</h1>
          <p>{t("grievance_hero_desc")}</p>
          <div className="setu-grievance-hero-actions">
            <button className="setu-primary-btn" onClick={() => setShowForm(true)}>{t("grievance_new_btn")}</button>
            <a className="setu-hero-link" href="#track">Track an existing grievance →</a>
          </div>
        </div>
      </section>

      <section className="setu-container setu-grievance-content">
        {submittedId && (
          <div className="setu-success-banner" role="status">
            <div>
              <strong>Grievance registered successfully.</strong>
              <span>Your acknowledgement number is <b>{submittedId}</b>.</span>
            </div>
            <button onClick={() => setSubmittedId("")}>Dismiss</button>
          </div>
        )}

        <div className="setu-grievance-stat-grid">
          <div><span>Active grievances</span><strong>{grievances.filter(g => g.status !== "Resolved").length}</strong></div>
          <div><span>Under review</span><strong>{grievances.filter(g => g.status === "Under Review").length}</strong></div>
          <div><span>Resolved</span><strong>{grievances.filter(g => g.status === "Resolved").length}</strong></div>
          <div><span>Support channel</span><strong>EKAM</strong></div>
        </div>

        <div className="setu-grievance-layout">
          <div className="setu-grievance-main" id="track">
            <div className="setu-panel-heading">
              <div>
                <div className="setu-section-kicker">MY GRIEVANCES</div>
                <h2>Track submitted complaints</h2>
              </div>
              <button className="setu-outline-btn" onClick={() => setShowForm(true)}>+ New grievance</button>
            </div>

            <div className="setu-track-search">
              <label htmlFor="grievance-search">Search by acknowledgement number, title or department</label>
              <input
                id="grievance-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("grievance_search_placeholder")}
              />
            </div>

            <div className="setu-grievance-list">
              {filtered.map((item) => (
                <article className="setu-grievance-card" key={item.id}>
                  <div className="setu-grievance-card-header">
                    <div>
                      <span className="setu-grievance-id">{item.id}</span>
                      <h3>{item.title}</h3>
                    </div>
                    <span className={`setu-status-pill ${item.status.toLowerCase().replaceAll(" ", "-")}`}>{item.status}</span>
                  </div>
                  <p>{item.description}</p>
                  <div className="setu-grievance-meta">
                    <span><b>Department</b>{item.department}</span>
                    <span><b>Category</b>{item.category}</span>
                    <span><b>Submitted</b>{item.submitted}</span>
                    <span><b>Last updated</b>{item.updated}</span>
                  </div>
                  <div className="setu-grievance-card-footer">
                    <span className={item.priority === "High" ? "setu-priority high" : "setu-priority"}>{item.priority} priority</span>
                    <Link href={`/grievance/${encodeURIComponent(item.id)}`}>View timeline →</Link>
                  </div>
                </article>
              ))}
              {filtered.length === 0 && (
                <div className="setu-empty-state"><strong>No matching grievances.</strong><p>Check the acknowledgement number or try another search.</p></div>
              )}
            </div>
          </div>

          <aside className="setu-grievance-side">
            <div className="setu-grievance-info-card">
              <div className="setu-section-kicker">HOW IT WORKS</div>
              <h2>Four simple steps</h2>
              <ol>
                <li><b>Register</b><span>Describe the issue and select the relevant category.</span></li>
                <li><b>Acknowledgement</b><span>EKAM generates a unique grievance number.</span></li>
                <li><b>Review</b><span>The grievance is routed to the appropriate workflow.</span></li>
                <li><b>Resolution</b><span>Updates and the final response remain visible to the citizen.</span></li>
              </ol>
            </div>
            <div className="setu-grievance-info-card muted">
              <strong>Need a service instead?</strong>
              <p>If you have not submitted a grievance and simply need a government service, start from the service directory.</p>
              <Link href="/services" className="setu-text-btn">Browse services →</Link>
            </div>
          </aside>
        </div>
      </section>

      {showForm && (
        <div className="setu-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="grievance-title">
          <form className="setu-grievance-modal" onSubmit={submitGrievance}>
            <div className="setu-modal-header">
              <div>
                <div className="setu-section-kicker">NEW GRIEVANCE</div>
                <h2 id="grievance-title">{t("grievance_new_btn")}</h2>
              </div>
              <button type="button" className="setu-modal-close" onClick={() => setShowForm(false)} aria-label="Close">×</button>
            </div>

            <div className="setu-form-grid">
              <label>{t("grievance_title_label")}
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Briefly describe the issue" />
              </label>
              <label>{t("grievance_cat_label")}
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label>{t("grievance_dept_label")}
                <input value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="Department / office name" />
              </label>
              <label>{t("grievance_priority_label")}
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                  <option>Normal</option><option>High</option>
                </select>
              </label>
              <label className="full">{t("grievance_desc_label")}
                <textarea required rows={6} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Explain the issue, relevant application number, dates and other useful details." />
              </label>
            </div>

            <div className="setu-form-note">
              Do not enter passwords, OTPs, bank PINs or other confidential authentication information in the grievance description.
            </div>
            <div className="setu-modal-actions">
              <button type="button" className="setu-outline-btn" onClick={() => setShowForm(false)}>{t("cancel")}</button>
              <button type="submit" className="setu-primary-btn">{submitting ? t("loading") : t("grievance_submit_btn")}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
