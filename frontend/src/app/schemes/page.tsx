 "use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Scheme = {
  id: string;
  title: string;
  category: string;
  department: string;
  summary: string;
  eligibility: string[];
  benefits: string[];
  documents: string[];
  status: "Open" | "Ongoing";
  tags: string[];
};

const schemes: Scheme[] = [
  {
    id: "maha-scholarship",
    title: "Maharashtra State Scholarship Support",
    category: "Education",
    department: "Higher & Technical Education",
    summary: "Financial support information for eligible students pursuing higher education.",
    eligibility: ["Resident of Maharashtra", "Enrolled in an eligible institution", "Meets applicable income/category conditions"],
    benefits: ["Scholarship assistance", "Application tracking", "Document reuse through SETU"],
    documents: ["Identity proof", "Residence proof", "Income certificate", "Institute admission proof"],
    status: "Open",
    tags: ["Students", "Scholarship"],
  },
  {
    id: "farmer-support",
    title: "Farmer Welfare & Support Services",
    category: "Agriculture",
    department: "Agriculture Department",
    summary: "A unified discovery point for farmer-oriented support services and schemes.",
    eligibility: ["Eligible farmer/applicant", "Applicable land or beneficiary records", "Scheme-specific conditions"],
    benefits: ["Scheme discovery", "Eligibility guidance", "Application status visibility"],
    documents: ["Identity proof", "Bank details", "Land/beneficiary record", "Scheme-specific documents"],
    status: "Ongoing",
    tags: ["Farmers", "Welfare"],
  },
  {
    id: "women-child",
    title: "Women & Child Welfare Services",
    category: "Social Welfare",
    department: "Women & Child Development",
    summary: "Discover welfare support and citizen services for women and children.",
    eligibility: ["Applicant must meet the scheme-specific beneficiary criteria"],
    benefits: ["Centralized information", "Required-document checklist", "Service navigation"],
    documents: ["Identity proof", "Residence proof", "Age/relationship proof where applicable"],
    status: "Open",
    tags: ["Women", "Children", "Welfare"],
  },
  {
    id: "health-support",
    title: "Public Health Assistance",
    category: "Health",
    department: "Public Health Department",
    summary: "Find public health assistance programs and understand the documents and steps involved.",
    eligibility: ["Eligibility varies by program and beneficiary group"],
    benefits: ["Service discovery", "Eligibility guidance", "Application journey support"],
    documents: ["Identity proof", "Residence proof", "Medical/supporting documents where required"],
    status: "Ongoing",
    tags: ["Health", "Citizen Services"],
  },
  {
    id: "housing-support",
    title: "Housing & Urban Assistance",
    category: "Housing",
    department: "Housing / Urban Development",
    summary: "Explore housing-related assistance and citizen service pathways.",
    eligibility: ["Scheme-specific household and income criteria"],
    benefits: ["Scheme discovery", "Checklist", "Journey tracking"],
    documents: ["Identity proof", "Address proof", "Income proof", "Property/household documents where applicable"],
    status: "Open",
    tags: ["Housing", "Urban"],
  },
  {
    id: "senior-support",
    title: "Senior Citizen Welfare Services",
    category: "Social Welfare",
    department: "Social Justice & Special Assistance",
    summary: "A discovery and navigation layer for services relevant to senior citizens.",
    eligibility: ["Age and scheme-specific beneficiary conditions"],
    benefits: ["Service discovery", "Document checklist", "Application navigation"],
    documents: ["Identity proof", "Age proof", "Residence proof", "Bank details where applicable"],
    status: "Ongoing",
    tags: ["Senior Citizens", "Welfare"],
  },
];

const categories = ["All", ...Array.from(new Set(schemes.map((s) => s.category)))];

export default function SchemesPage() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return schemes.filter((scheme) => {
      const matchesCategory = category === "All" || scheme.category === category;
      const text = `${scheme.title} ${scheme.department} ${scheme.summary} ${scheme.tags.join(" ")}`.toLowerCase();
      return matchesCategory && (!q || text.includes(q));
    });
  }, [category, query]);

  return (
    <main className="setu-schemes-page">
      <section className="setu-schemes-hero">
        <div className="setu-container">
          <div className="setu-breadcrumb"><Link href="/">Home</Link><span>/</span><span>Schemes</span></div>
          <div className="setu-section-kicker">GOVERNMENT SCHEMES & BENEFITS</div>
          <h1>Find schemes and understand your eligibility.</h1>
          <p>
            Search citizen welfare and support programs, review eligibility guidance,
            see required documents, and continue into a SETU service journey.
          </p>
        </div>
      </section>

      <section className="setu-container setu-schemes-content">
        <div className="setu-scheme-searchbar">
          <div>
            <label htmlFor="scheme-search">Search schemes</label>
            <input
              id="scheme-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by scheme, department, benefit or category"
            />
          </div>
          <Link className="setu-outline-btn" href="/services">Browse Services</Link>
        </div>

        <div className="setu-filter-row" aria-label="Scheme categories">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="setu-scheme-results-head">
          <div>
            <div className="setu-section-kicker">DISCOVER</div>
            <h2>Available scheme pathways</h2>
          </div>
          <span>{filtered.length} schemes</span>
        </div>

        {filtered.length === 0 ? (
          <div className="setu-empty-state">
            <strong>No schemes matched your search.</strong>
            <p>Try a different keyword or select another category.</p>
          </div>
        ) : (
          <div className="setu-scheme-grid">
            {filtered.map((scheme) => (
              <article className="setu-scheme-card" key={scheme.id}>
                <div className="setu-scheme-card-top">
                  <span className="setu-scheme-category">{scheme.category}</span>
                  <span className="setu-scheme-status">{scheme.status}</span>
                </div>
                <h3>{scheme.title}</h3>
                <p className="setu-scheme-dept">{scheme.department}</p>
                <p>{scheme.summary}</p>
                <div className="setu-tag-row">
                  {scheme.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <div className="setu-scheme-card-actions">
                  <Link href={`/schemes/${scheme.id}`} className="setu-primary-btn">View details</Link>
                  <Link href="/services" className="setu-text-btn">Find service →</Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <section className="setu-eligibility-banner">
          <div>
            <div className="setu-section-kicker">SMART ELIGIBILITY</div>
            <h2>One profile. Multiple possibilities.</h2>
            <p>
              SETU can use your citizen profile and saved documents to guide you
              towards relevant service and scheme pathways without repeatedly asking
              for the same information.
            </p>
          </div>
          <Link href="/profile" className="setu-primary-btn">Open My SETU</Link>
        </section>
      </section>
    </main>
  );
}
