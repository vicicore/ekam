"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { maharashtraIntelligenceApi } from "@/lib/maharashtraIntelligenceApi";

type District = { id:string; name:string; division:string };
type Department = { id:string; name:string; division:string; service_count:number };
type Service = { id:string; name:string; department_id:string; department_name:string; category:string; application_route:string };

export default function MaharashtraIntelligencePage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [district, setDistrict] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    maharashtraIntelligenceApi.overview()
      .then((data:any) => {
        setDistricts(data.districts || []);
        setDepartments(data.departments || []);
        setServices(data.services || []);
      })
      .catch(() => setError("Maharashtra intelligence data could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      maharashtraIntelligenceApi.services({
        q, district_id: district, department_id: department, category
      }).then((data:any) => setServices(data.items || []))
       .catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [q, district, department, category]);

  const categories = useMemo(
    () => Array.from(new Set(services.map(s => s.category))).sort(),
    [services]
  );

  return (
    <main className="mh-intel">
      <section className="mh-intel__hero">
        <div>
          <span className="eyebrow">MAHARASHTRA SERVICE INTELLIGENCE</span>
          <h1>District → Department → Service</h1>
          <p>
            Explore EKAM's structured Maharashtra service layer and move from
            a citizen's location to the relevant service workflow.
          </p>
        </div>
        <Link href="/maharashtra" className="back-link">← Maharashtra</Link>
      </section>

      <section className="mh-intel__filters">
        <label>Search service
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Income, scholarship, labour..." />
        </label>
        <label>District
          <select value={district} onChange={e=>setDistrict(e.target.value)}>
            <option value="">All districts</option>
            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
        <label>Department
          <select value={department} onChange={e=>setDepartment(e.target.value)}>
            <option value="">All departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
        <label>Category
          <select value={category} onChange={e=>setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </label>
      </section>

      {error && <div className="mh-intel__error">{error}</div>}
      {loading ? <div className="mh-intel__empty">Loading Maharashtra intelligence…</div> :
        <section className="mh-intel__grid">
          {services.map(s => (
            <article className="service-card" key={s.id}>
              <div className="service-card__meta">{s.category}</div>
              <h2>{s.name}</h2>
              <p>{s.department_name}</p>
              <div className="service-card__footer">
                <span>{districts.find(d => d.id === district)?.name || "State / District applicable"}</span>
                <Link href={s.application_route}>Open service →</Link>
              </div>
            </article>
          ))}
          {!services.length && <div className="mh-intel__empty">No matching services found.</div>}
        </section>
      }
    </main>
  );
}
