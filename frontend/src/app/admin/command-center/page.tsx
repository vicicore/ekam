"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminAnalytics, type AdminAnalytics } from "@/lib/adminAnalyticsApi";
import "./globals-phase23.css";

function MetricCard({ label, value, hint, danger = false }: { label: string; value: number; hint: string; danger?: boolean }) {
  return <div className={`cc-card metric-card ${danger ? "metric-danger" : ""}`}><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-hint">{hint}</div></div>;
}

function BarList({ rows }: { rows: Array<{ label: string; value: number }> }) {
  const max = Math.max(...rows.map(r => r.value), 1);
  return <div className="bar-list">{rows.length ? rows.map(row => <div className="bar-row" key={row.label}><div className="bar-meta"><span>{row.label}</span><strong>{row.value}</strong></div><div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(4, row.value / max * 100)}%` }} /></div></div>) : <div className="empty-state">No activity data available yet.</div>}</div>;
}

export default function AdminCommandCenterPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setError("");
    try {
      const result = await getAdminAnalytics();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load command center");
    } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { void load(); }, []);

  const departmentRows = useMemo(() => data?.departments.map(d => ({ label: d.department, value: d.pending + d.in_progress + d.sla_at_risk + d.sla_breached })) ?? [], [data]);

  if (loading) return <main className="cc-shell"><div className="cc-loading">Loading command center…</div></main>;
  if (error) return <main className="cc-shell"><div className="cc-error"><strong>Command center unavailable</strong><p>{error}</p><button onClick={() => { setLoading(true); void load(); }}>Retry</button></div></main>;
  if (!data) return null;

  const s = data.summary;
  return <main className="cc-shell">
    <header className="cc-header">
      <div><div className="eyebrow">SETU ADMINISTRATION</div><h1>Command Center</h1><p>Operational visibility across applications, departments, SLAs and audit activity.</p></div>
      <button className="refresh-btn" disabled={refreshing} onClick={() => { setRefreshing(true); void load(); }}>{refreshing ? "Refreshing…" : "Refresh data"}</button>
    </header>

    <section className="metric-grid">
      <MetricCard label="Total applications" value={s.total_applications} hint={`${s.active_applications} active`} />
      <MetricCard label="Completed" value={s.completed_applications} hint={`${s.total_applications ? Math.round(s.completed_applications / s.total_applications * 100) : 0}% of applications`} />
      <MetricCard label="Blocked" value={s.blocked_applications} hint="Needs attention" danger={s.blocked_applications > 0} />
      <MetricCard label="SLA at risk" value={s.sla_at_risk} hint="Due within 48 hours" danger={s.sla_at_risk > 0} />
      <MetricCard label="SLA breached" value={s.sla_breached} hint="Requires escalation" danger={s.sla_breached > 0} />
      <MetricCard label="Audit events" value={s.total_audit_events} hint="Recorded activity" />
    </section>

    <section className="dashboard-grid">
      <article className="cc-card panel"><div className="panel-heading"><div><h2>Application status</h2><span>Current workflow distribution</span></div></div><BarList rows={data.application_status} /></article>
      <article className="cc-card panel"><div className="panel-heading"><div><h2>Department workload</h2><span>Pending and active operational load</span></div></div><BarList rows={departmentRows} /></article>
    </section>

    <section className="cc-card panel department-panel"><div className="panel-heading"><div><h2>Department performance</h2><span>Operational breakdown derived from persisted application state</span></div></div>
      <div className="table-wrap"><table><thead><tr><th>Department</th><th>Pending</th><th>In progress</th><th>Completed</th><th>Rejected</th><th>At risk</th><th>Breached</th></tr></thead><tbody>{data.departments.map(d => <tr key={d.department}><td><strong>{d.department}</strong></td><td>{d.pending}</td><td>{d.in_progress}</td><td>{d.completed}</td><td>{d.rejected}</td><td className={d.sla_at_risk ? "warn" : ""}>{d.sla_at_risk}</td><td className={d.sla_breached ? "danger" : ""}>{d.sla_breached}</td></tr>)}</tbody></table></div>
    </section>

    <section className="cc-card panel activity-panel"><div className="panel-heading"><div><h2>Recent audit activity</h2><span>Latest recorded platform events</span></div></div>{data.recent_activity.length ? <div className="activity-list">{data.recent_activity.map(item => <div className="activity-row" key={item.id}><div className="activity-dot"/><div className="activity-main"><strong>{item.action}</strong><span>{item.resource_type}{item.resource_id ? ` · ${item.resource_id}` : ""}</span></div><div className="activity-time">{new Date(item.created_at).toLocaleString()}</div></div>)}</div> : <div className="empty-state">No audit activity has been recorded yet.</div>}</section>

    <p className="data-note">Analytics are calculated from SETU’s persisted application and audit records. This dashboard does not imply live connectivity to external government department systems.</p>
  </main>;
}
