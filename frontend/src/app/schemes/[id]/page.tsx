 "use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const schemeData: Record<string, {
  title: string; category: string; department: string; summary: string;
  eligibility: string[]; benefits: string[]; documents: string[];
}> = {
  "maha-scholarship": {
    title: "Maharashtra State Scholarship Support",
    category: "Education",
    department: "Higher & Technical Education",
    summary: "Financial support information for eligible students pursuing higher education.",
    eligibility: ["Resident of Maharashtra", "Enrolled in an eligible institution", "Meets applicable income/category conditions"],
    benefits: ["Scholarship assistance", "Application tracking", "Document reuse through SETU"],
    documents: ["Identity proof", "Residence proof", "Income certificate", "Institute admission proof"],
  },
  "farmer-support": {
    title: "Farmer Welfare & Support Services",
    category: "Agriculture",
    department: "Agriculture Department",
    summary: "A unified discovery point for farmer-oriented support services and schemes.",
    eligibility: ["Eligible farmer/applicant", "Applicable land or beneficiary records", "Scheme-specific conditions"],
    benefits: ["Scheme discovery", "Eligibility guidance", "Application status visibility"],
    documents: ["Identity proof", "Bank details", "Land/beneficiary record", "Scheme-specific documents"],
  },
  "women-child": {
    title: "Women & Child Welfare Services",
    category: "Social Welfare",
    department: "Women & Child Development",
    summary: "Discover welfare support and citizen services for women and children.",
    eligibility: ["Applicant must meet the scheme-specific beneficiary criteria"],
    benefits: ["Centralized information", "Required-document checklist", "Service navigation"],
    documents: ["Identity proof", "Residence proof", "Age/relationship proof where applicable"],
  },
  "health-support": {
    title: "Public Health Assistance",
    category: "Health",
    department: "Public Health Department",
    summary: "Find public health assistance programs and understand the documents and steps involved.",
    eligibility: ["Eligibility varies by program and beneficiary group"],
    benefits: ["Service discovery", "Eligibility guidance", "Application journey support"],
    documents: ["Identity proof", "Residence proof", "Medical/supporting documents where required"],
  },
  "housing-support": {
    title: "Housing & Urban Assistance",
    category: "Housing",
    department: "Housing / Urban Development",
    summary: "Explore housing-related assistance and citizen service pathways.",
    eligibility: ["Scheme-specific household and income criteria"],
    benefits: ["Scheme discovery", "Checklist", "Journey tracking"],
    documents: ["Identity proof", "Address proof", "Income proof", "Property/household documents where applicable"],
  },
  "senior-support": {
    title: "Senior Citizen Welfare Services",
    category: "Social Welfare",
    department: "Social Justice & Special Assistance",
    summary: "A discovery and navigation layer for services relevant to senior citizens.",
    eligibility: ["Age and scheme-specific beneficiary conditions"],
    benefits: ["Service discovery", "Document checklist", "Application navigation"],
    documents: ["Identity proof", "Age proof", "Residence proof", "Bank details where applicable"],
  },
};

export default function SchemeDetailPage() {
  const params = useParams();
  const scheme = schemeData[String(params.id)];

  if (!scheme) {
    return (
      <main className="setu-container setu-not-found">
        <h1>Scheme not found</h1>
        <p>The requested scheme pathway is not available in this demo dataset.</p>
        <Link href="/schemes" className="setu-primary-btn">Back to schemes</Link>
      </main>
    );
  }

  return (
    <main className="setu-scheme-detail">
      <section className="setu-detail-hero">
        <div className="setu-container">
          <div className="setu-breadcrumb"><Link href="/schemes">Schemes</Link><span>/</span><span>{scheme.category}</span></div>
          <span className="setu-scheme-category">{scheme.category}</span>
          <h1>{scheme.title}</h1>
          <p>{scheme.summary}</p>
          <div className="setu-detail-meta">
            <span><strong>Department</strong>{scheme.department}</span>
            <span><strong>Pathway</strong>Scheme discovery → eligibility → service</span>
          </div>
        </div>
      </section>

      <section className="setu-container setu-detail-grid">
        <div className="setu-detail-main">
          <section className="setu-detail-panel">
            <div className="setu-section-kicker">ELIGIBILITY</div>
            <h2>Who may be eligible</h2>
            <ul>{scheme.eligibility.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section className="setu-detail-panel">
            <div className="setu-section-kicker">BENEFITS / SUPPORT</div>
            <h2>What SETU helps you understand</h2>
            <ul>{scheme.benefits.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section className="setu-detail-panel">
            <div className="setu-section-kicker">DOCUMENT CHECKLIST</div>
            <h2>Keep these documents ready</h2>
            <ul>{scheme.documents.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        </div>

        <aside className="setu-detail-side">
          <div className="setu-apply-card">
            <div className="setu-section-kicker">NEXT STEP</div>
            <h2>Continue with SETU</h2>
            <p>Use the service directory to locate the relevant application pathway, then track the journey from My SETU.</p>
            <Link href="/services" className="setu-primary-btn">Find application service</Link>
            <Link href="/profile" className="setu-outline-btn">Open My SETU</Link>
          </div>
          <div className="setu-note-card">
            <strong>Important</strong>
            <p>This Phase 7 module is a structured discovery/demo layer. Scheme-specific eligibility, benefits and document requirements should be connected to verified department data before production deployment.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
