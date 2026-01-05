import axiosIns from './axios';

export type PlanType = "ONE-WAY" | "ROUND-TRIP" | "OUT-STATION" | "SCHEDULE";

export interface RechargePlan {
  id: number;
  planName: string;
  planType: PlanType[];
  description?: string;
  rideLimit: number;
  validityDays: number;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRechargePlanRequest {
  planName: string;
  planType: PlanType[];
  description?: string;
  rideLimit: number;
  validityDays: number;
  price: number;
  isActive?: boolean;
}

export interface UpdateRechargePlanRequest {
  planName?: string;
  planType?: PlanType[];
  description?: string;
  rideLimit?: number;
  validityDays?: number;
  price?: number;
}

export interface RechargePlansResponse {
  message: string;
  data: RechargePlan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RechargePlanResponse {
  message: string;
  data: RechargePlan;
}

export const rechargePlanApi = {
  // Get all recharge plans
  getRechargePlans: async (page = 1, limit = 10): Promise<RechargePlansResponse> => {
    const response = await axiosIns.get(`/api/recharge-plans?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get recharge plan by ID
  getRechargePlanById: async (id: number): Promise<RechargePlanResponse> => {
    const response = await axiosIns.get(`/api/recharge-plans/${id}`);
    return response.data;
  },

  // Create new recharge plan
  createRechargePlan: async (planData: CreateRechargePlanRequest): Promise<RechargePlanResponse> => {
    console.log('API: Creating plan with data:', JSON.stringify(planData, null, 2));
    try {
      const response = await axiosIns.post('/api/recharge-plans/create', planData);
      return response.data;
    } catch (error: any) {
      console.error('API Error Details:', error.response?.data);
      throw error;
    }
  },

  // Update recharge plan
  updateRechargePlan: async (id: number, planData: UpdateRechargePlanRequest): Promise<RechargePlanResponse> => {
    const response = await axiosIns.patch(`/api/recharge-plans/update/${id}`, planData);
    return response.data;
  },

  // Toggle recharge plan status
  toggleRechargePlanStatus: async (id: number, isActive: boolean): Promise<RechargePlanResponse> => {
    const response = await axiosIns.patch(`/api/recharge-plans/status/${id}`, { isActive });
    return response.data;
  },

  // Delete recharge plan
  deleteRechargePlan: async (id: number): Promise<{ message: string }> => {
    const response = await axiosIns.delete(`/api/recharge-plans/delete/${id}`);
    return response.data;
  },
};
