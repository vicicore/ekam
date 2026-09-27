'use client';

import { useEffect, useMemo, useState } from 'react';
import { notificationApi, NotificationItem } from '@/lib/notificationApi';

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setItems(await notificationApi.list(filter === 'unread')); }
    catch (e: any) { setError(e?.message || 'Unable to load notifications'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filter]);

  const unread = useMemo(() => items.filter(x => !x.read).length, [items]);
  const markRead = async (item: NotificationItem) => {
    if (item.read) return;
    await notificationApi.markRead(item.id);
    setItems(v => v.map(x => x.id === item.id ? { ...x, read: true } : x));
  };

  return <main className="setu-notifications">
    <section className="notification-hero">
      <div><span className="eyebrow">CITIZEN SERVICES</span><h1>Notifications</h1><p>Important updates about your applications, documents, grievances and service requests.</p></div>
      <div className="notification-count"><strong>{unread}</strong><span>unread</span></div>
    </section>
    <div className="notification-toolbar">
      <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All updates</button>
      <button className={filter === 'unread' ? 'active' : ''} onClick={() => setFilter('unread')}>Unread</button>
      <button className="refresh" onClick={load}>Refresh</button>
    </div>
    {loading && <div className="notification-state">Loading notifications…</div>}
    {error && <div className="notification-state error">{error}</div>}
    {!loading && !error && items.length === 0 && <div className="notification-state"><strong>No notifications</strong><span>New service updates will appear here.</span></div>}
    <section className="notification-list">
      {items.map(item => <article key={item.id} className={`notification-card ${item.read ? 'read' : 'unread'} priority-${item.priority}`}>
        <div className="notification-marker" />
        <div className="notification-content">
          <div className="notification-meta"><span>{item.type.replaceAll('_', ' ')}</span><time>{new Date(item.created_at).toLocaleString()}</time></div>
          <h2>{item.title}</h2><p>{item.message}</p>
          <div className="notification-actions">
            {item.link && <a href={item.link}>View service</a>}
            {!item.read && <button onClick={() => markRead(item)}>Mark as read</button>}
          </div>
        </div>
      </article>)}
    </section>
  </main>;
}
