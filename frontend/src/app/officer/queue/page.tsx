"use client";
import {useCallback,useEffect,useState} from "react";
import {officerApi} from "@/lib/officerApi";
import Link from "next/link";
export default function OfficerQueue(){
 const [rows,setRows]=useState<any[]>([]),[filter,setFilter]=useState(""),[selected,setSelected]=useState<any>(null),[note,setNote]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const load=useCallback(() => officerApi.queue(filter||undefined).then(setRows).catch(e=>setError(e.message)),[filter]); useEffect(() => { void load(); },[load]);
 async function decide(d:string){if(!selected)return;setBusy(true);try{await officerApi.decision(selected.application_id,d,note);setSelected(null);setNote("");await load()}catch(e:any){setError(e.message)}finally{setBusy(false)}}
 return <main className="officer-shell"><div className="page-top"><div><span className="eyebrow">OPERATIONS</span><h1>Department Queue</h1><p>Applications visible to your department based on the officer session and workflow state.</p></div><Link href="/officer" className="secondary-btn">Dashboard</Link></div>
 <div className="filters">{[["","All"],["submitted","Submitted"],["in_progress","In progress"]].map(([v,l])=><button className={filter===v?"active":""} onClick={()=>setFilter(v)} key={v}>{l}</button>)}</div>
 {error&&<div className="alert">{error}</div>}<section className="panel"><div className="table-wrap"><table><thead><tr><th>Application</th><th>Service</th><th>Citizen</th><th>Status</th><th>SLA</th><th>Assignment</th><th></th></tr></thead><tbody>{rows.map(x=><tr key={`${x.application_id}-${x.service_code}`}><td><b>{x.application_id.slice(0,12)}â€¦</b><small>{x.life_event_code}</small></td><td>{x.service_code}</td><td>{x.citizen_id}</td><td><span className={`pill ${x.status}`}>{x.status}</span></td><td>{x.sla_due_at?new Date(x.sla_due_at).toLocaleString():"â€”"}</td><td>{x.assignment?.officer_id||"Unassigned"}</td><td><button className="action-btn" onClick={()=>setSelected(x)}>Review</button></td></tr>)}</tbody></table></div>{rows.length===0&&<div className="empty">No matching applications.</div>}</section>
 {selected&&<div className="modal-backdrop"><div className="modal"><button className="close" onClick={()=>setSelected(null)}>Ã—</button><span className="eyebrow">APPLICATION REVIEW</span><h2>{selected.service_code}</h2><p>Application <b>{selected.application_id}</b></p><div className="review-meta"><span>Status <b>{selected.status}</b></span><span>Citizen <b>{selected.citizen_id}</b></span><span>SLA <b>{selected.sla_due_at?new Date(selected.sla_due_at).toLocaleString():"â€”"}</b></span></div><label>Officer note<textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a decision note or request for informationâ€¦"/></label><div className="decision-row"><button disabled={busy} onClick={()=>decide("request_info")}>Request info</button><button disabled={busy} onClick={()=>decide("reject")}>Reject</button><button className="primary" disabled={busy} onClick={()=>decide("approve")}>Approve</button></div></div></div>}
 </main>
}


