const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export interface AdminApplicationStep {
  service_code: string;
  display_name: string;
  department: string;
  status: string;
  external_reference: string | null;
  submitted_at: string | null;
  sla_due_at: string | null;
  sla_status: string | null;
}

export interface AdminApplication {
  application_id: string;
  citizen_id: string;
  life_event_code: string;
  created_at: string;
  updated_at: string;
  is_complete: boolean;
  current_blocker: string | null;
  steps: AdminApplicationStep[];
}

export interface AdminGrievance {
  id: string;
  citizen_id: string;
  title: string;
  category: string;
  department: string | null;
  priority: string;
  status: string;
  acknowledgement_number: string;
  created_at: string;
  updated_at: string;
  event_count: number;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("setu-auth-token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `Request failed (${response.status})`);
  }
  return response.json();
}

export const adminOperationsApi = {
  applications: (params?: { department?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.department) q.set("department", params.department);
    if (params?.status) q.set("status", params.status);
    return request<AdminApplication[]>(`/admin/applications?${q.toString()}`);
  },

  approveStep: (applicationId: string, serviceCode: string) =>
    request<AdminApplication>(
      `/admin/applications/${encodeURIComponent(applicationId)}/steps/${encodeURIComponent(serviceCode)}/approve`,
      { method: "POST" },
    ),

  grievances: (params?: { department?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.department) q.set("department", params.department);
    if (params?.status) q.set("status", params.status);
    return request<AdminGrievance[]>(`/admin/grievances?${q.toString()}`);
  },

  updateGrievance: (id: string, status: string, note: string) =>
    request<AdminGrievance>(`/admin/grievances/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    }),
};
