"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import MaharashtraMap from "@/components/MaharashtraMap";

const districts = [
  "Ahmednagar","Akola","Amravati","Aurangabad","Beed","Bhandara","Buldhana",
  "Chandrapur","Dhule","Gadchiroli","Gondia","Hingoli","Jalgaon","Jalna",
  "Kolhapur","Latur","Mumbai City","Mumbai Suburban","Nagpur","Nanded","Nandurbar",
  "Nashik","Dharashiv","Palghar","Parbhani","Pune","Raigad","Ratnagiri",
  "Sangli","Satara","Sindhudurg","Solapur","Thane","Wardha","Washim","Yavatmal"
];

const regions = [
  { name: "Konkan", districts: ["Mumbai City","Mumbai Suburban","Thane","Palghar","Raigad","Ratnagiri","Sindhudurg"] },
  { name: "Pune", districts: ["Pune","Satara","Sangli","Kolhapur","Solapur"] },
  { name: "Nashik", districts: ["Nashik","Dhule","Nandurbar","Jalgaon","Ahmednagar"] },
  { name: "Chhatrapati Sambhajinagar", districts: ["Aurangabad","Jalna","Beed","Latur","Dharashiv","Nanded","Parbhani","Hingoli"] },
  { name: "Amravati", districts: ["Amravati","Akola","Buldhana","Washim","Yavatmal"] },
  { name: "Nagpur", districts: ["Nagpur","Wardha","Bhandara","Gondia","Chandrapur","Gadchiroli"] },
];

const services = [
  ["Certificates & Documents","Birth, death, domicile, income and related citizen certificates"],
  ["Revenue & Land","Land records, revenue services and property-related applications"],
  ["Transport","Driving licence, vehicle and transport-related citizen services"],
  ["Social Welfare","Citizen assistance, pensions, welfare and inclusion programmes"],
  ["Education","Scholarships, student services and education-related applications"],
  ["Health","Public health services, registrations and citizen facilities"],
];

export default function MaharashtraPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(
    () => districts.filter((d) => d.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <main className="setu-container" style={{ padding: "40px 16px 80px 16px" }}>
      <div className="setu-breadcrumb" style={{ marginBottom: "16px" }}>
        <Link href="/" style={{ color: "var(--setu-blue)", textDecoration: "none" }}>Home</Link>
        <span>/</span>
        <span>Maharashtra Services</span>
      </div>

      <header className="setu-state-hero" style={{ marginBottom: "32px" }}>
        <div>
          <p className="setu-eyebrow">MAHARASHTRA GOVERNMENT SERVICES</p>
          <h1>One State. One Access Point.</h1>
          <p>
            Explore citizen services across 36 districts, 6 administrative divisions and state-wide departments.
            SETU brings Maharashtra's public service architecture into a single, cohesive citizen portal.
          </p>
          <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/maharashtra/intelligence" className="setu-btn setu-btn-primary">
              Open Maharashtra Intelligence Console →
            </Link>
            <Link href="/services" className="setu-btn setu-btn-secondary">
              Browse All 14 Services
            </Link>
          </div>
        </div>
        <div className="setu-state-badge">
          <strong>MAHARASHTRA</strong>
          <span>36 districts · 6 divisions · 14 core services</span>
        </div>
      </header>

      {/* Interactive Map Section */}
      <section style={{ marginBottom: "48px" }}>
        <MaharashtraMap onSelectDistrict={(dId: string) => {
          const match = districts.find(d => d.toLowerCase() === dId.toLowerCase() || dId.toLowerCase().includes(d.toLowerCase()));
          if (match) setSelected(match);
        }} />
      </section>

      <section className="setu-state-grid">
        <div className="setu-section">
          <div className="setu-section-heading">
            <div>
              <p className="setu-eyebrow">DISTRICT SERVICES</p>
              <h2>Find services in your district</h2>
            </div>
          </div>

          <div className="setu-district-toolbar">
            <label>
              <span>Search district</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type district name"
                aria-label="Search district"
              />
            </label>
            {selected && (
              <button className="setu-button setu-button-secondary" onClick={() => setSelected(null)}>
                Clear selection
              </button>
            )}
          </div>

          <div className="setu-district-grid">
            {filtered.map((district) => (
              <button
                key={district}
                className={`setu-district-card ${selected === district ? "is-selected" : ""}`}
                onClick={() => setSelected(district)}
              >
                <span className="setu-district-code">
                  {district.slice(0, 2).toUpperCase()}
                </span>
                <strong>{district}</strong>
                <small>View services →</small>
              </button>
            ))}
          </div>
        </div>

        <aside className="setu-section">
          <p className="setu-eyebrow">SELECTED DISTRICT</p>
          {selected ? (
            <>
              <h2 className="setu-selected-district">{selected}</h2>
              <p className="setu-sidebar-copy">
                Services and information can be organised around this district.
              </p>
              <Link href="/services" className="setu-button setu-button-primary">
                Explore services
              </Link>
              <div className="setu-district-links">
                <Link href="/services">Certificates</Link>
                <Link href="/services">Revenue & land</Link>
                <Link href="/services">Social welfare</Link>
                <Link href="/journeys">Track applications</Link>
              </div>
            </>
          ) : (
            <div className="setu-state-empty">
              <span>01</span>
              <strong>Select a district</strong>
              <p>Choose a district to see the service access point.</p>
            </div>
          )}
        </aside>
      </section>

      <section className="setu-section">
        <div className="setu-section-heading">
          <div>
            <p className="setu-eyebrow">ADMINISTRATIVE DIVISIONS</p>
            <h2>Explore Maharashtra by division</h2>
          </div>
        </div>

        <div className="setu-division-grid">
          {regions.map((region) => (
            <article key={region.name} className="setu-division-card">
              <h3>{region.name}</h3>
              <div>
                {region.districts.map((district) => (
                  <button key={district} onClick={() => setSelected(district)}>
                    {district}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="setu-section">
        <div className="setu-section-heading">
          <div>
            <p className="setu-eyebrow">SERVICE CATEGORIES</p>
            <h2>State-wide service access</h2>
          </div>
          <Link href="/services" className="setu-text-button">
            View all services →
          </Link>
        </div>

        <div className="setu-state-service-grid">
          {services.map(([title, detail], index) => (
            <Link href="/services" className="setu-state-service-card" key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <p>{detail}</p>
              <b>Explore →</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="setu-rts-panel">
        <div>
          <p className="setu-eyebrow">RIGHT TO PUBLIC SERVICES</p>
          <h2>Track services with clear responsibility and timelines.</h2>
          <p>
            SETU can surface service timelines, application references and
            escalation information alongside each eligible service.
          </p>
        </div>
        <div className="setu-rts-actions">
          <Link href="/services" className="setu-button setu-button-primary">
            Find a service
          </Link>
          <Link href="/journeys" className="setu-button setu-button-secondary">
            Track an application
          </Link>
        </div>
      </section>
    </main>
  );
}
