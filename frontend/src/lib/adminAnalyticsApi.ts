import { ApiError } from "./api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export interface AnalyticsSeriesPoint { label: string; value: number }
export interface AnalyticsDepartment {
  department: string;
  pending: number;
  in_progress: number;
  completed: number;
  rejected: number;
  sla_at_risk: number;
  sla_breached: number;
}
export interface AdminAnalytics {
  summary: {
    total_applications: number;
    active_applications: number;
    completed_applications: number;
    blocked_applications: number;
    total_steps: number;
    pending_steps: number;
    completed_steps: number;
    rejected_steps: number;
    sla_at_risk: number;
    sla_breached: number;
    total_documents: number;
    total_audit_events: number;
  };
  departments: AnalyticsDepartment[];
  application_status: AnalyticsSeriesPoint[];
  document_status: AnalyticsSeriesPoint[];
  recent_activity: Array<{
    id: string;
    actor: string;
    action: string;
    resource_type: string;
    resource_id: string | null;
    created_at: string;
  }>;
}

export async function getAdminAnalytics(token?: string): Promise<AdminAnalytics> {
  const authToken = token ?? (typeof window !== "undefined" ? localStorage.getItem("setu-auth-token") : null);
  const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.detail ?? `Analytics request failed (${response.status})`, response.status);
  }
  return response.json();
}
