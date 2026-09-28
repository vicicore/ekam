import { api } from "./api";

export type IntelligenceDistrict = {
  id: string;
  name: string;
  division: string;
  department_count: number;
};

export type IntelligenceDepartment = {
  id: string;
  name: string;
  division: string;
  service_count: number;
};

export type IntelligenceService = {
  id: string;
  name: string;
  department_id: string;
  department_name: string;
  category: string;
  district_id?: string | null;
  application_route: string;
};

export type MaharashtraOverview = {
  districts: IntelligenceDistrict[];
  departments: IntelligenceDepartment[];
  services: IntelligenceService[];
};

export type DistrictIntelligence = {
  district: IntelligenceDistrict;
  departments: IntelligenceDepartment[];
  services: IntelligenceService[];
};

export const maharashtraIntelligenceApi = {
  overview: () => api.request<MaharashtraOverview>("/maharashtra-intelligence"),
  district: (districtId: string) =>
    api.request<DistrictIntelligence>(`/maharashtra-intelligence/districts/${districtId}`),
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
    return api.request<{ items: IntelligenceService[] }>(
      `/maharashtra-intelligence/services?${query.toString()}`,
    );
  },
};
