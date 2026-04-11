import { PricingFareRulesRepository } from './pricingFareRules.repository';
import { PricingFareRule, FareSummary } from './pricingFareRules.model';
import { DriverTimeSlotsPricingRepository } from './driverTimeSlotsPricing.repository';
import { ExtraKmCheckpointsRepository } from './extraKmCheckpoints.repository';

export const PricingFareRulesService = {
  async getPricingFareRules(
    filters: {
      search?: string;
      area_id?: string;
      district_id?: string;
      is_hotspot?: boolean;
    },
    page: number,
    limit: number,
    includeTimeSlots = false
  ): Promise<{ data: FareSummary[]; total: number }> {
    const result = await PricingFareRulesRepository.getPricingFareRules(
      filters,
      page,
      limit,
      includeTimeSlots
    );

    // Optionally include time slots for each fare rule
    // if (includeTimeSlots && result.data.length > 0) {
    //   for (const fareRule of result.data) {
    //     fareRule.time_slots = await DriverTimeSlotsPricingRepository.getByPricingFareRuleId(
    //       fareRule.id
    //     );
    //   }
    // }

    return result;
  },

  async getPricingFareRuleById(id: string): Promise<FareSummary> {
    const fareRule = await PricingFareRulesRepository.getFareSummaryById(id);
    if (!fareRule) {
      throw { statusCode: 404, message: 'Pricing fare rule not found' };
    }

    // Always include time slots when fetching a single fare rule
    fareRule.time_slots = await DriverTimeSlotsPricingRepository.getByPricingFareRuleId(id);

    return fareRule;
  },

  async createPricingFareRule(data: {
    district_id: string;
    area_id?: string | null;
    global_price: number;
    is_hotspot: boolean;
    hotspot_id?: string | null;
    multiplier?: number | null;
    extra_km_step?: number;
    extra_km_price?: number;
    extra_km_start_multiplier?: number;
  }): Promise<PricingFareRule> {
    // Validate hotspot requirements
    if (data.is_hotspot) {
      if (!data.hotspot_id) {
        throw { statusCode: 400, message: 'Hotspot ID is required when is_hotspot is true' };
      }
      if (!data.multiplier) {
        throw { statusCode: 400, message: 'Multiplier is required when is_hotspot is true' };
      }
    }

    // Check for duplicate area combination (only if area_id is provided)
    if (data.area_id) {
      const isDuplicate = await PricingFareRulesRepository.checkDuplicateArea(
        data.district_id,
        data.area_id
      );
      if (isDuplicate) {
        throw {
          statusCode: 409,
          message: 'A pricing fare rule already exists for this area combination',
        };
      }
    }

    // Validate global_price
    if (data.global_price < 0) {
      throw { statusCode: 400, message: 'Global price cannot be negative' };
    }

    // Validate multiplier if provided
    if (data.multiplier !== null && data.multiplier !== undefined && data.multiplier <= 0) {
      throw { statusCode: 400, message: 'Multiplier must be greater than 0' };
    }

    // Validate extra KM fields
    if (data.extra_km_step !== undefined && data.extra_km_step <= 0) {
      throw { statusCode: 400, message: 'Extra KM step must be greater than 0' };
    }
    if (data.extra_km_price !== undefined && data.extra_km_price < 0) {
      throw { statusCode: 400, message: 'Extra KM price cannot be negative' };
    }
    if (data.extra_km_start_multiplier !== undefined && data.extra_km_start_multiplier <= 0) {
      throw { statusCode: 400, message: 'Extra KM start multiplier must be greater than 0' };
    }

    return await PricingFareRulesRepository.createPricingFareRule(data);
  },

  async updatePricingFareRule(
    id: string,
    data: {
      district_id?: string;
      area_id?: string | null;
      global_price?: number;
      is_hotspot?: boolean;
      hotspot_id?: string | null;
      multiplier?: number | null;
      extra_km_step?: number;
      extra_km_price?: number;
      extra_km_start_multiplier?: number;
    }
  ): Promise<PricingFareRule> {
    // Check if pricing fare rule exists
    const existing = await PricingFareRulesRepository.getPricingFareRuleById(id);
    if (!existing) {
      throw { statusCode: 404, message: 'Pricing fare rule not found' };
    }

    // Merge existing data with updates to validate hotspot requirements
    const mergedData = { ...existing, ...data };
    if (mergedData.is_hotspot) {
      if (!mergedData.hotspot_id) {
        throw { statusCode: 400, message: 'Hotspot ID is required when is_hotspot is true' };
      }
      if (!mergedData.multiplier) {
        throw { statusCode: 400, message: 'Multiplier is required when is_hotspot is true' };
      }
    }

    // If district_id or area_id is being updated, check for duplicates (only if area_id is not null)
    if (data.district_id !== undefined || data.area_id !== undefined) {
      const newDistrictId = data.district_id || existing.district_id;
      const newAreaId = data.area_id !== undefined ? data.area_id : existing.area_id;

      // Only check for duplicates if area_id is provided
      if (newAreaId) {
        const isDuplicate = await PricingFareRulesRepository.checkDuplicateArea(
          newDistrictId,
          newAreaId,
          id
        );
        if (isDuplicate) {
          throw {
            statusCode: 409,
            message: 'A pricing fare rule already exists for this area combination',
          };
        }
      }
    }

    // Validate global_price if provided
    if (data.global_price !== undefined && data.global_price < 0) {
      throw { statusCode: 400, message: 'Global price cannot be negative' };
    }

    // Validate multiplier if provided
    if (data.multiplier !== null && data.multiplier !== undefined && data.multiplier <= 0) {
      throw { statusCode: 400, message: 'Multiplier must be greater than 0' };
    }

    // Validate extra KM fields
    if (data.extra_km_step !== undefined && data.extra_km_step <= 0) {
      throw { statusCode: 400, message: 'Extra KM step must be greater than 0' };
    }
    if (data.extra_km_price !== undefined && data.extra_km_price < 0) {
      throw { statusCode: 400, message: 'Extra KM price cannot be negative' };
    }
    if (data.extra_km_start_multiplier !== undefined && data.extra_km_start_multiplier <= 0) {
      throw { statusCode: 400, message: 'Extra KM start multiplier must be greater than 0' };
    }

    return await PricingFareRulesRepository.updatePricingFareRule(id, data);
  },

  async deletePricingFareRule(id: string): Promise<void> {
    // Check if pricing fare rule exists
    const existing = await PricingFareRulesRepository.getPricingFareRuleById(id);
    if (!existing) {
      throw { statusCode: 404, message: 'Pricing fare rule not found' };
    }

    await PricingFareRulesRepository.deletePricingFareRule(id);
  },

  /**
   * Create pricing fare rule with time slots in a transaction
   */
  async createPricingRuleWithSlots(data: {
    district_id: string;
    area_id?: string | null;
    global_price: number;
    is_hotspot: boolean;
    hotspot_id?: string | null;
    multiplier?: number | null;
    extra_km_step?: number;
    extra_km_price?: number;
    extra_km_start_multiplier?: number;
    extra_km_checkpoints?: Array<{ multiplier: number; sort_order: number }>;
    time_slots: Array<{
      driver_types: string;
      day: string;
      from_time: string;
      to_time: string;
      price: number;
    }>;
  }): Promise<{ pricingRule: PricingFareRule; timeSlots: any[] }> {
    // Validate hotspot requirements
    if (data.is_hotspot) {
      if (!data.hotspot_id) {
        throw { statusCode: 400, message: 'Hotspot ID is required when is_hotspot is true' };
      }
      if (!data.multiplier) {
        throw { statusCode: 400, message: 'Multiplier is required when is_hotspot is true' };
      }
    }

    // Check for duplicate district/area combination (including null area_id)
    const isDuplicate = await PricingFareRulesRepository.checkDuplicateArea(
      data.district_id,
      data.area_id ?? null
    );
    if (isDuplicate) {
      throw {
        statusCode: 409,
        message: 'A pricing fare rule already exists for this district and area combination',
      };
    }

    // Validate global_price
    if (data.global_price < 0) {
      throw { statusCode: 400, message: 'Global price cannot be negative' };
    }

    // Validate multiplier if provided
    if (data.multiplier !== null && data.multiplier !== undefined && data.multiplier <= 0) {
      throw { statusCode: 400, message: 'Multiplier must be greater than 0' };
    }

    // Validate extra KM fields
    if (data.extra_km_step !== undefined && data.extra_km_step <= 0) {
      throw { statusCode: 400, message: 'Extra KM step must be greater than 0' };
    }
    if (data.extra_km_price !== undefined && data.extra_km_price < 0) {
      throw { statusCode: 400, message: 'Extra KM price cannot be negative' };
    }
    if (data.extra_km_start_multiplier !== undefined && data.extra_km_start_multiplier <= 0) {
      throw { statusCode: 400, message: 'Extra KM start multiplier must be greater than 0' };
    }

    // Validate time slots
    if (!data.time_slots || data.time_slots.length === 0) {
      throw { statusCode: 400, message: 'At least one time slot is required' };
    }

    // Create the pricing rule first
    const pricingRule = await PricingFareRulesRepository.createPricingFareRule({
      district_id: data.district_id,
      area_id: data.area_id,
      global_price: data.global_price,
      is_hotspot: data.is_hotspot,
      hotspot_id: data.hotspot_id,
      multiplier: data.multiplier,
      extra_km_step: data.extra_km_step,
      extra_km_price: data.extra_km_price,
      extra_km_start_multiplier: data.extra_km_start_multiplier,
    });

    // Prepare time slots with the pricing rule ID
    const slotsWithRuleId = data.time_slots.map((slot) => ({
      price_and_fare_rules_id: pricingRule.id,
      driver_types: slot.driver_types,
      day: slot.day,
      from_time: slot.from_time,
      to_time: slot.to_time,
      price: slot.price,
    }));

    // Bulk create time slots
    const timeSlots =
      await DriverTimeSlotsPricingRepository.bulkCreateDriverTimeSlotsPricing(slotsWithRuleId);

    // Bulk create extra KM checkpoints if provided
    if (data.extra_km_checkpoints && data.extra_km_checkpoints.length > 0) {
      await ExtraKmCheckpointsRepository.bulkCreate(
        data.extra_km_checkpoints.map((c) => ({
          pricing_fare_rule_id: pricingRule.id,
          multiplier: c.multiplier,
          sort_order: c.sort_order,
        }))
      );
    }

    return { pricingRule, timeSlots };
  },

  /**
   * Update pricing fare rule with time slots in a transaction
   */
  async updatePricingRuleWithSlots(
    id: string,
    data: {
      district_id?: string;
      area_id?: string | null;
      global_price?: number;
      is_hotspot?: boolean;
      hotspot_id?: string | null;
      multiplier?: number | null;
      extra_km_step?: number;
      extra_km_price?: number;
      extra_km_start_multiplier?: number;
      extra_km_checkpoints?: Array<{ multiplier: number; sort_order: number }>;
      time_slots?: Array<{
        driver_types: string;
        day: string;
        from_time: string;
        to_time: string;
        price: number;
      }>;
    }
  ): Promise<{ pricingRule: PricingFareRule; timeSlots: any[] }> {
    // 1. Update the pricing rule itself (validation is handled inside updatePricingFareRule)
    const pricingRule = await PricingFareRulesService.updatePricingFareRule(id, {
      district_id: data.district_id,
      area_id: data.area_id,
      global_price: data.global_price,
      is_hotspot: data.is_hotspot,
      hotspot_id: data.hotspot_id,
      multiplier: data.multiplier,
      extra_km_step: data.extra_km_step,
      extra_km_price: data.extra_km_price,
      extra_km_start_multiplier: data.extra_km_start_multiplier,
    });

    // 2. If time_slots are provided, replace them
    let timeSlots: any[] = [];
    if (data.time_slots && data.time_slots.length > 0) {
      // Delete existing slots
      await DriverTimeSlotsPricingRepository.deleteByPricingFareRuleId(id);

      // Prepare new slots
      const slotsWithRuleId = data.time_slots.map((slot) => ({
        price_and_fare_rules_id: id,
        driver_types: slot.driver_types,
        day: slot.day,
        from_time: slot.from_time,
        to_time: slot.to_time,
        price: slot.price,
      }));

      // Create new slots
      timeSlots =
        await DriverTimeSlotsPricingRepository.bulkCreateDriverTimeSlotsPricing(slotsWithRuleId);
    } else {
      // If time_slots not provided in update, fetch existing ones to return
      timeSlots = await DriverTimeSlotsPricingRepository.getByPricingFareRuleId(id);
    }

    // Always replace extra KM checkpoints when updating (delete + re-insert)
    await ExtraKmCheckpointsRepository.deleteByPricingFareRuleId(id);
    if (data.extra_km_checkpoints && data.extra_km_checkpoints.length > 0) {
      await ExtraKmCheckpointsRepository.bulkCreate(
        data.extra_km_checkpoints.map((c) => ({
          pricing_fare_rule_id: id,
          multiplier: c.multiplier,
          sort_order: c.sort_order,
        }))
      );
    }

    return { pricingRule, timeSlots };
  },
};
