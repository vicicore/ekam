import { api } from "./api";

export const maharashtraIntelligenceApi = {
  overview: () => api.request("/maharashtra-intelligence"),
  district: (districtId: string) =>
    api.request(`/maharashtra-intelligence/districts/${districtId}`),
  services: (params: {
    q?: string;
    district_id?: string;
    department_id?: string;
    category?: string;
  } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    return api.request(`/maharashtra-intelligence/services?${query.toString()}`);
  },
};
