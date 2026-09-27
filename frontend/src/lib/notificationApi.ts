import { apiRequest } from './api';

export type NotificationItem = {
  id: string;
  recipient_id: string;
  recipient_type: 'citizen' | 'officer' | 'admin';
  type: string;
  title: string;
  message: string;
  link?: string | null;
  entity_id?: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  created_at: string;
  read_at?: string | null;
  delivery_status: string;
};

export const notificationApi = {
  list: (unreadOnly = false) => apiRequest<NotificationItem[]>(`/notifications/me?unread_only=${unreadOnly}`),
  markRead: (id: string) => apiRequest(`/notifications/${id}/read`, { method: 'POST' }),
};
