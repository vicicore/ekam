const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
async function request<T>(path:string, options:RequestInit={}) : Promise<T> {
  const token=typeof window!=="undefined"?localStorage.getItem("setu-auth-token"):null;
  const res=await fetch(`${API}${path}`,{...options,headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{}) ,...(options.headers||{})}});
  if(!res.ok) throw new Error(await res.text()||`Request failed (${res.status})`); return res.json();
}
export const integrationApi={
  list:(applicationId:string)=>request<Record<string, unknown>[]>(`/integration/application/${applicationId}`),
  dispatch:(applicationId:string,serviceCode:string,department:string)=>request<Record<string, unknown>>("/integration/dispatch",{method:"POST",body:JSON.stringify({application_id:applicationId,service_code:serviceCode,department})}),
  refresh:(id:string)=>request<Record<string, unknown>>(`/integration/dispatch/${id}`),
};
export const notificationApi={
  list:()=>request<Record<string, unknown>[]>("/notifications/me"),
  read:(id:string)=>request<Record<string, unknown>>(`/notifications/${id}/read`,{method:"POST"}),
};
