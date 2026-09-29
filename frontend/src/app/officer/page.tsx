"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {officerApi} from "@/lib/officerApi";
import "./officer.css";

export default function OfficerDashboard(){
 const [data,setData]=useState<any>(null); const [queue,setQueue]=useState<any[]>([]); const [error,setError]=useState("");
 useEffect(()=>{Promise.all([officerApi.me(),officerApi.queue()]).then(([m,q])=>{setData(m);setQueue(q)}).catch(e=>setError(e.message))},[]);
 const due=queue.filter(x=>x.sla_due_at && new Date(x.sla_due_at)<new Date()).length;
 return <main className="officer-shell">
  <section className="officer-hero"><div><span className="eyebrow">EKAM • DEPARTMENT OPERATIONS</span><h1>Officer Workspace</h1><p>Review assigned citizen applications, manage workflow actions and stay on top of service-level timelines.</p></div><Link href="/officer/notifications" className="notification-link">Notifications {data?.unread_notifications ? <b>{data.unread_notifications}</b>:null}</Link></section>
  {error&&<div className="alert">{error}</div>}
  <section className="officer-grid stats"><div><span>Officer</span><strong>{data?.officer?.display_name||"—"}</strong><small>{data?.officer?.department||"—"}{data?.officer?.district?` • ${data.officer.district}`:""}</small></div><div><span>Queue</span><strong>{queue.length}</strong><small>Actionable applications</small></div><div><span>SLA attention</span><strong>{due}</strong><small>Past due items</small></div><div><span>Notifications</span><strong>{data?.unread_notifications??0}</strong><small>Unread</small></div></section>
  <section className="panel"><div className="panel-head"><div><span className="eyebrow">DEPARTMENT QUEUE</span><h2>Applications requiring action</h2></div><Link href="/officer/queue" className="secondary-btn">Open full queue</Link></div>
   {queue.length===0?<div className="empty">No applications are currently assigned to this department.</div>:<div className="queue-list">{queue.slice(0,6).map((x:any)=><Link className="queue-row" href={`/officer/queue?application=${encodeURIComponent(x.application_id)}`} key={`${x.application_id}-${x.service_code}`}><div><strong>{x.service_code}</strong><small>Application {x.application_id.slice(0,12)}… • {x.life_event_code}</small></div><span className={`pill ${x.status}`}>{x.status.replaceAll("_"," ")}</span><div className="sla">{x.sla_due_at?new Date(x.sla_due_at).toLocaleDateString():"No SLA"}</div></Link>)}</div>}
  </section>
 </main>
}
