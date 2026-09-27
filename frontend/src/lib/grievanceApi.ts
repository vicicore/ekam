const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type GrievanceStatus = "submitted" | "under_review" | "resolved";
export type GrievancePriority = "normal" | "high";

export interface GrievanceEvent {
  id: string;
  status: GrievanceStatus;
  note: string;
  actor: string;
  created_at: string;
}

export interface Grievance {
  id: string;
  citizen_id: string;
  title: string;
  category: string;
  department: string | null;
  description: string;
  priority: GrievancePriority;
  status: GrievanceStatus;
  acknowledgement_number: string;
  created_at: string;
  updated_at: string;
  events: GrievanceEvent[];
}

export interface CreateGrievanceInput {
  title: string;
  category: string;
  department?: string;
  description: string;
  priority: GrievancePriority;
}

class GrievanceApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

function token() {
  try { return localStorage.getItem("setu-auth-token"); } catch { return null; }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = token();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new GrievanceApiError(
      body.detail ?? `Request failed (${response.status})`,
      response.status,
    );
  }
  return response.json();
}

export const grievanceApi = {
  create: (input: CreateGrievanceInput) =>
    request<Grievance>("/grievances", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  mine: () => request<Grievance[]>("/grievances/me"),

  get: (id: string) =>
    request<Grievance>(`/grievances/${encodeURIComponent(id)}`),
};

export { GrievanceApiError };
