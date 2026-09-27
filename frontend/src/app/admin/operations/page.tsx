"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import {
  adminOperationsApi,
  AdminApplication,
  AdminGrievance,
} from "@/lib/adminOperationsApi";

export default function AdminOperationsPage() {
  const { role, isLoggedIn } = useAuth();
  const [tab, setTab] = useState<"applications" | "grievances">("applications");
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [grievances, setGrievances] = useState<AdminGrievance[]>([]);
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    setMessage("");
    try {
      const [apps, grvs] = await Promise.all([
        adminOperationsApi.applications({ status: status || undefined, department: department || undefined }),
        adminOperationsApi.grievances({ status: status || undefined, department: department || undefined }),
      ]);
      setApplications(apps);
      setGrievances(grvs);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not load operations data.");
    } finally {
      setBusy(false);
    }
  }, [department, status]);

  useEffect(() => { if (role === "admin") load(); }, [load, role]);

  const pendingSteps = useMemo(
    () => applications.flatMap(a => a.steps.filter(s => s.status === "in_progress")),
    [applications],
  );
  const atRisk = useMemo(
    () => applications.flatMap(a => a.steps.filter(s => s.sla_status === "at_risk" || s.sla_status === "breached")),
    [applications],
  );

  if (!isLoggedIn || role !== "admin") {
    return <main className="mx-auto max-w-6xl px-5 py-12"><div className="rounded-xl border bg-white p-8 text-slate-600">Admin access required.</div></main>;
  }

  async function approve(applicationId: string, serviceCode: string) {
    setMessage("");
    try {
      await adminOperationsApi.approveStep(applicationId, serviceCode);
      setMessage("Department action recorded successfully.");
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not approve service.");
    }
  }

  async function updateGrievance(id: string, next: string) {
    const note = window.prompt("Add an internal resolution note:", "Status updated by department officer.");
    if (!note) return;
    try {
      await adminOperationsApi.updateGrievance(id, next, note);
      setMessage("Grievance status updated.");
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not update grievance.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">SETU · Government Operations</p>
          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-950">Officer Operations Desk</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Review citizen applications, monitor SLA pressure, and process routed grievances from one authenticated workspace.
              </p>
            </div>
            <button onClick={load} className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">Refresh</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-7">
        {message && <div className="mb-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</div>}

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric label="Applications" value={applications.length} />
          <Metric label="Pending steps" value={pendingSteps.length} />
          <Metric label="SLA pressure" value={atRisk.length} />
          <Metric label="Grievances" value={grievances.length} />
        </div>

        <section className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <select value={department} onChange={e => setDepartment(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">All departments</option>
              <option>Revenue</option><option>Higher Education</option><option>Social Justice</option>
              <option>Labour</option><option>Urban Development</option><option>Finance</option><option>Home</option>
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">All statuses</option><option value="in_progress">In progress</option>
              <option value="blocked">Blocked</option><option value="verified">Verified</option>
              <option value="ready">Ready</option><option value="rejected">Rejected</option>
            </select>
            <button onClick={load} className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white">Apply filters</button>
          </div>
        </section>

        <div className="mb-5 flex gap-2 border-b">
          <Tab active={tab === "applications"} onClick={() => setTab("applications")}>Application Queue</Tab>
          <Tab active={tab === "grievances"} onClick={() => setTab("grievances")}>Grievance Queue</Tab>
        </div>

        {busy ? <div className="rounded-xl border bg-white p-8 text-sm text-slate-500">Loading operations data…</div> : (
          tab === "applications" ? (
            <div className="space-y-4">
              {applications.map(app => (
                <article key={app.application_id} className="rounded-xl border bg-white p-5 shadow-sm">
                  <div className="flex flex-col justify-between gap-3 md:flex-row">
                    <div>
                      <p className="font-mono text-xs text-slate-400">{app.application_id}</p>
                      <h2 className="mt-1 font-semibold text-slate-900">{app.life_event_code.replaceAll("_", " ")}</h2>
                      <p className="text-sm text-slate-500">Citizen: {app.citizen_id}</p>
                    </div>
                    <span className="text-xs text-slate-500">{app.is_complete ? "Completed" : "Active"}</span>
                  </div>

                  {app.current_blocker && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Blocker: {app.current_blocker}</div>}

                  <div className="mt-4 space-y-2">
                    {app.steps.map(step => (
                      <div key={step.service_code} className="flex flex-col gap-3 rounded-lg border border-slate-100 p-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{step.display_name}</p>
                          <p className="text-xs text-slate-500">{step.department} · {step.status.replaceAll("_", " ")}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold ${step.sla_status === "breached" ? "text-red-700" : step.sla_status === "at_risk" ? "text-amber-700" : "text-slate-500"}`}>
                            {step.sla_status ? step.sla_status.replaceAll("_", " ") : "SLA —"}
                          </span>
                          {step.status === "in_progress" && step.external_reference && (
                            <button onClick={() => approve(app.application_id, step.service_code)} className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                              Approve
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
              {!applications.length && <Empty text="No applications match the selected filters." />}
            </div>
          ) : (
            <div className="space-y-3">
              {grievances.map(g => (
                <article key={g.id} className="rounded-xl border bg-white p-5 shadow-sm">
                  <div className="flex flex-col justify-between gap-3 md:flex-row">
                    <div>
                      <p className="font-mono text-xs text-slate-400">{g.acknowledgement_number}</p>
                      <h2 className="mt-1 font-semibold text-slate-900">{g.title}</h2>
                      <p className="text-sm text-slate-500">{g.category} · {g.department ?? "Unassigned"} · {g.priority}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{g.status.replaceAll("_", " ")}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {g.status === "submitted" && <button onClick={() => updateGrievance(g.id, "under_review")} className="rounded-lg border px-3 py-2 text-xs font-semibold">Mark under review</button>}
                    {g.status === "under_review" && <button onClick={() => updateGrievance(g.id, "resolved")} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Mark resolved</button>}
                  </div>
                </article>
              ))}
              {!grievances.length && <Empty text="No grievances match the selected filters." />}
            </div>
          )
        )}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border bg-white p-4 shadow-sm"><p className="text-2xl font-bold text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>;
}
function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`border-b-2 px-3 py-3 text-sm font-semibold ${active ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500"}`}>{children}</button>;
}
function Empty({ text }: { text: string }) {
  return <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">{text}</div>;
}
