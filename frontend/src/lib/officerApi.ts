const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

async function request<T>(path:string, options:RequestInit={}) : Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("setu-auth-token") : null;
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type":"application/json", ...(token ? {Authorization:`Bearer ${token}`} : {}), ...(options.headers||{}) },
  });
  if (!res.ok) throw new Error(await res.text() || `Request failed (${res.status})`);
  return res.json();
}
export const officerApi = {
  me:()=>request<Record<string, unknown>>("/officer/me"),
  queue:(status?:string)=>request<Record<string, unknown>[]>(`/officer/queue${status?`?status=${encodeURIComponent(status)}`:""}`),
  notifications:()=>request<Record<string, unknown>[]>("/officer/notifications"),
  markRead:(id:string)=>request<Record<string, unknown>>(`/officer/notifications/${id}/read`,{method:"POST"}),
  assign:(applicationId:string, officerId:string, note?:string)=>request<Record<string, unknown>>(`/officer/applications/${applicationId}/assign`,{method:"POST",body:JSON.stringify({officer_id:officerId,note})}),
  decision:(applicationId:string, decision:string, note?:string)=>request<Record<string, unknown>>(`/officer/applications/${applicationId}/decision`,{method:"POST",body:JSON.stringify({decision,note})}),
};
