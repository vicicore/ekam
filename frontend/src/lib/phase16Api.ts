const API_BASE_URL=process.env.NEXT_PUBLIC_API_BASE_URL??"http://localhost:8000/api/v1";

async function request<T>(path:string,options:RequestInit={}):Promise<T>{
  const token=localStorage.getItem("setu-auth-token");
  const r=await fetch(`${API_BASE_URL}${path}`,{...options,headers:{
    "Content-Type":"application/json",
    ...(token?{Authorization:`Bearer ${token}`}:{})
    ,...(options.headers??{})
  }});
  if(!r.ok){const b=await r.json().catch(()=>({}));throw new Error(b.detail??`Request failed (${r.status})`);}
  return r.json();
}

export interface SetuNotification{
 id:string; recipient_id:string; type:string; title:string; message:string;
 resource_type:string|null; resource_id:string|null; read:boolean; created_at:string;
}

export const phase16Api={
 notifications:()=>request<SetuNotification[]>("/notifications/me"),
 markRead:(id:string)=>request<SetuNotification>(`/notifications/${encodeURIComponent(id)}/read`,{method:"POST"})
};
