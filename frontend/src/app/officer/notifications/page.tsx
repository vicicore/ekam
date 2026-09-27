"use client";
import {useCallback,useEffect,useState} from "react";
import {officerApi} from "@/lib/officerApi";
import Link from "next/link";
export default function OfficerNotifications(){const [items,setItems]=useState<any[]>([]);const [error,setError]=useState("");const load=useCallback(()=>officerApi.notifications().then(setItems).catch(e=>setError(e.message)),[]);useEffect(()=>{void load();},[load]);return <main className="officer-shell"><div className="page-top"><div><span className="eyebrow">OFFICER INBOX</span><h1>Notifications</h1><p>Workflow events and assignments sent to your officer account.</p></div><Link href="/officer" className="secondary-btn">Dashboard</Link></div>{error&&<div className="alert">{error}</div>}<section className="panel notification-list">{items.length===0?<div className="empty">No notifications yet.</div>:items.map(n=><article className={n.read?"notification read":"notification"} key={n.id}><div><span className="notification-type">{n.notification_type}</span><h3>{n.title}</h3><p>{n.message}</p><small>{new Date(n.created_at).toLocaleString()}</small></div>{!n.read&&<button className="action-btn" onClick={async()=>{await officerApi.markRead(n.id);load()}}>Mark read</button>}</article>)}</section></main>}


