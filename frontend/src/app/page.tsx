 "use client";

import Link from "next/link";

const quick = [
  ["Find a Service", "Search citizen services and application pathways.", "/services"],
  ["Explore Schemes", "Discover welfare and support scheme pathways.", "/schemes"],
  ["Track Application", "Check application stages and next actions.", "/journeys"],
  ["Document Vault", "Review and reuse your saved documents.", "/vault"],
];

const services = [
  ["Certificates & Documents", "Birth, income, residence and other citizen documentation.", "/services"],
  ["Revenue & Land", "Explore revenue, land and property-related pathways.", "/services"],
  ["Transport", "Find transport-related services and application journeys.", "/services"],
  ["Social Welfare", "Access welfare-oriented services and support.", "/services"],
  ["Education", "Explore education services and scheme pathways.", "/services"],
  ["Health", "Find public health services and assistance.", "/services"],
];

export default function Home() {
  return (
    <main className="setu-final-home">
      <section className="setu-final-hero">
        <div className="setu-final-container setu-hero-grid">
          <div>
            <div className="setu-final-kicker">MAHARASHTRA CITIZEN SERVICES</div>
            <h1>One place to discover, apply and track government services.</h1>
            <p>
              SETU brings services, schemes, documents, application journeys and
              citizen support into one organized digital experience.
            </p>
            <div className="setu-hero-actions">
              <Link href="/services" className="setu-final-primary">Find a service</Link>
              <Link href="/assistant" className="setu-final-secondary">Ask SETU Assistant</Link>
            </div>
            <div className="setu-hero-note">
              <span>✓</span> Reuse eligible profile and document information across service journeys.
            </div>
          </div>
          <div className="setu-hero-panel">
            <div className="setu-hero-panel-head">
              <span>MY SETU</span><b>Citizen Dashboard</b>
            </div>
            <div className="setu-mini-stat-grid">
              <div><strong>04</strong><span>Active journeys</span></div>
              <div><strong>12</strong><span>Saved documents</span></div>
              <div><strong>03</strong><span>Pending actions</span></div>
              <div><strong>07</strong><span>Completed services</span></div>
            </div>
            <Link href="/profile" className="setu-panel-link">Open My SETU →</Link>
          </div>
        </div>
      </section>

      <section className="setu-final-container setu-quick-section">
        <div className="setu-final-section-head">
          <div><div className="setu-final-kicker">QUICK ACCESS</div><h2>Start with what you need</h2></div>
          <Link href="/services">View all services →</Link>
        </div>
        <div className="setu-quick-grid">
          {quick.map(([title, text, href], i) => (
            <Link href={href} className="setu-quick-card" key={title}>
              <span>0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div><b>→</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="setu-final-state">
        <div className="setu-final-container setu-state-grid-final">
          <div>
            <div className="setu-final-kicker">MAHARASHTRA GOVERNMENT LAYER</div>
            <h2>Navigate services by district and administrative division.</h2>
            <p>
              Explore Maharashtra districts, service categories and public-service
              pathways through one structured interface.
            </p>
            <Link href="/maharashtra" className="setu-final-primary">Explore Maharashtra</Link>
          </div>
          <div className="setu-district-visual">
            <div className="setu-map-outline">MAHARASHTRA</div>
            <div className="setu-map-points"><span>36 Districts</span><span>6 Divisions</span><span>Citizen Services</span></div>
          </div>
        </div>
      </section>

      <section className="setu-final-container setu-services-section">
        <div className="setu-final-section-head">
          <div><div className="setu-final-kicker">SERVICE DIRECTORY</div><h2>Government services</h2></div>
          <Link href="/services">Browse directory →</Link>
        </div>
        <div className="setu-service-grid-final">
          {services.map(([title, text, href], i) => (
            <Link href={href} key={title} className="setu-service-card-final">
              <span>0{i + 1}</span><h3>{title}</h3><p>{text}</p><b>Explore →</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="setu-final-support">
        <div className="setu-final-container setu-support-grid">
          <div>
            <div className="setu-final-kicker">CITIZEN SUPPORT</div>
            <h2>Need help understanding a service?</h2>
            <p>Ask SETU Assistant for guided navigation across services, schemes, documents, journeys and grievances.</p>
          </div>
          <div className="setu-support-actions">
            <Link href="/assistant" className="setu-final-primary">Open SETU Assistant</Link>
            <Link href="/grievance" className="setu-final-secondary">Raise a grievance</Link>
          </div>
        </div>
      </section>

      <section className="setu-final-container setu-final-process">
        <div className="setu-final-section-head">
          <div><div className="setu-final-kicker">HOW SETU WORKS</div><h2>A connected citizen journey</h2></div>
        </div>
        <div className="setu-process-grid">
          {[
            ["01", "Create your profile", "Keep essential citizen information organized in one place."],
            ["02", "Discover", "Find a service or scheme using structured categories and guidance."],
            ["03", "Prepare", "Review eligibility and required documents before applying."],
            ["04", "Apply & track", "Continue through a journey and monitor its progress."],
            ["05", "Get support", "Use the assistant or grievance channel when you need help."],
          ].map(([n, title, text]) => (
            <div key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></div>
          ))}
        </div>
      </section>
    </main>
  );
}
