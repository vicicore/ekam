const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

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

export interface Assignment {
  id: string;
  application_id: string;
  service_code: string;
  department: string;
  officer_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  type: string;
  title: string;
  message: string;
  resource_type: string | null;
  resource_id: string | null;
  read: boolean;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  department: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const phase14Api = {
  assign: (applicationId: string, serviceCode: string, officerId: string, department: string) =>
    request<Assignment>(
      `/admin/assignments?application_id=${encodeURIComponent(applicationId)}&service_code=${encodeURIComponent(serviceCode)}`,
      { method: "POST", body: JSON.stringify({ officer_id: officerId, department }) },
    ),
  notifications: () => request<Notification[]>("/admin/notifications"),
  auditEvents: (limit = 100) => request<AuditEvent[]>(`/admin/audit-events?limit=${limit}`),
  reject: (applicationId: string, serviceCode: string, reason: string) =>
    request(`/admin/applications/${encodeURIComponent(applicationId)}/steps/${encodeURIComponent(serviceCode)}/reject`, {
      method: "POST", body: JSON.stringify({ reason }),
    }),
};
