
import { RechargePlanRepository } from './rechargePlan.repository';

export const RechargePlanService = {
  
 
  async getPlans(page: number = 1, limit: number = 10) {
    return await RechargePlanRepository.getPlans(page, limit);
  },

 
  async getPlanById(id: number) {
    return await RechargePlanRepository.getById(id);
  },


  async createPlan(data: any, adminId: string) {
    const plan = await RechargePlanRepository.create(data);
    await RechargePlanRepository.recordHistory({
      planId: plan.id,
      adminId,
      action: 'CREATE',
      previousData: null,
      newData: plan,
    });
    return plan;
  },


  async updatePlan(id: number, data: any, adminId: string) {
    const oldPlan = await RechargePlanRepository.getById(id);
    
    // Normalize the old plan to camelCase to ensure a perfect merge with the incoming data
    const normalizedOld = {
      planName: oldPlan.plan_name ?? oldPlan.planName,
      description: oldPlan.description,
      validityDays: oldPlan.validity_days ?? oldPlan.validityDays,
      dailyPrice: oldPlan.daily_price ?? oldPlan.dailyPrice,
      weeklyPrice: oldPlan.weekly_price ?? oldPlan.weeklyPrice,
      monthlyPrice: oldPlan.monthly_price ?? oldPlan.monthlyPrice,
      features: oldPlan.features ?? [],
      isActive: oldPlan.is_active ?? (oldPlan.isActive ?? true),
      tag: oldPlan.tag,
    };

    const mergedData = {
      planName: data.planName !== undefined ? data.planName : normalizedOld.planName,
      description: data.description !== undefined ? data.description : normalizedOld.description,
      validityDays: data.validityDays !== undefined ? data.validityDays : normalizedOld.validityDays,
      dailyPrice: data.dailyPrice !== undefined ? data.dailyPrice : normalizedOld.dailyPrice,
      weeklyPrice: data.weeklyPrice !== undefined ? data.weeklyPrice : normalizedOld.weeklyPrice,
      monthlyPrice: data.monthlyPrice !== undefined ? data.monthlyPrice : normalizedOld.monthlyPrice,
      features: data.features !== undefined ? data.features : normalizedOld.features,
      isActive: data.isActive !== undefined ? data.isActive : normalizedOld.isActive,
      tag: data.tag !== undefined ? (data.tag === "" ? null : data.tag) : normalizedOld.tag,
    };

    const updatedPlan = await RechargePlanRepository.update(id, mergedData);
    await RechargePlanRepository.recordHistory({
      planId: id,
      adminId,
      action: 'UPDATE',
      previousData: oldPlan,
      newData: updatedPlan,
    });
    return updatedPlan;
  },

  
  async toggleStatus(id: number, status: boolean, adminId: string) {
    const oldPlan = await RechargePlanRepository.getById(id);
    const updatedPlan = await RechargePlanRepository.toggle(id, status);
    await RechargePlanRepository.recordHistory({
      planId: id,
      adminId,
      action: 'TOGGLE_STATUS',
      previousData: oldPlan,
      newData: updatedPlan,
    });
    return updatedPlan;
  },

  async getActiveSubscriptions() {
    return await RechargePlanRepository.getActiveSubscriptions();
  },

  async getPlanHistory(id: number) {
    return await RechargePlanRepository.getHistory(id);
  },

  async deletePlan(id: number) {
    return await RechargePlanRepository.delete(id);
  },
};

