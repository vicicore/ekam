 "use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const stages = [
  { title: "Grievance registered", date: "18 Sep 2026", state: "done", text: "Acknowledgement number generated and grievance received by SETU." },
  { title: "Department review", date: "22 Sep 2026", state: "active", text: "The concerned workflow is reviewing the grievance and supporting details." },
  { title: "Action / response", date: "Pending", state: "pending", text: "Department response will appear here once an action is recorded." },
  { title: "Closure", date: "Pending", state: "pending", text: "Citizen can view the final response and closure details." },
];

export default function GrievanceDetailPage() {
  const params = useParams();
  const id = decodeURIComponent(String(params.id));

  return (
    <main className="setu-grievance-page">
      <section className="setu-detail-hero">
        <div className="setu-container">
          <div className="setu-breadcrumb"><Link href="/grievance">Grievance</Link><span>/</span><span>Track</span></div>
          <div className="setu-section-kicker">GRIEVANCE TRACKING</div>
          <h1>{id}</h1>
          <p>View the current grievance status, workflow stage and recorded updates.</p>
        </div>
      </section>

      <section className="setu-container setu-grievance-detail-grid">
        <div>
          <div className="setu-detail-summary">
            <span><b>Status</b><em>Under Review</em></span>
            <span><b>Category</b>Certificates & Documents</span>
            <span><b>Department</b>Revenue Department</span>
            <span><b>Priority</b>High</span>
          </div>
          <section className="setu-timeline-panel">
            <div className="setu-section-kicker">STATUS TIMELINE</div>
            <h2>Grievance journey</h2>
            <div className="setu-grievance-timeline">
              {stages.map((stage, index) => (
                <div className={`setu-g-timeline-item ${stage.state}`} key={stage.title}>
                  <div className="setu-g-timeline-marker">{index + 1}</div>
                  <div>
                    <div className="setu-g-timeline-top"><h3>{stage.title}</h3><span>{stage.date}</span></div>
                    <p>{stage.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="setu-detail-side">
          <div className="setu-apply-card">
            <div className="setu-section-kicker">NEXT ACTION</div>
            <h2>Keep your acknowledgement number</h2>
            <p>Use this number whenever you contact the concerned office about the grievance.</p>
            <button className="setu-outline-btn" onClick={() => navigator.clipboard?.writeText(id)}>Copy acknowledgement</button>
            <Link href="/grievance" className="setu-primary-btn">Back to grievances</Link>
          </div>
          <div className="setu-note-card">
            <strong>Demo workflow</strong>
            <p>This timeline is a Phase 8 interface layer. Production status events should come from the grievance workflow API and department integrations.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
