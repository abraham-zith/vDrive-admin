import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  X,
  Zap,
  Trophy,
  Crown,
} from 'lucide-react';
import axios from '../api/axios';
import { ClockCircleOutlined } from '@ant-design/icons';

/* ================= TYPES ================= */

interface RechargePlan {
  id: number;
  planName: string;
  description: string;
  rideLimit: any;
  validityDays: any;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  features: any;
  isActive: boolean;
}

/* ================= COMPONENT ================= */

const RechargePlanPage: React.FC = () => {
  const [plans, setPlans] = useState<RechargePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"plans" | "subscriptions">("plans");
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [loadingActiveSubs, setLoadingActiveSubs] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    planName: '',
    description: '',
    validityDays: '',
    dailyPrice: '',
    weeklyPrice: '',
    monthlyPrice: '',
    features: [] as string[],
    isActive: true,
  });

  /* ---- Fetch Plans ---- */
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/recharge-plans');
      
      // Dev Logging
      if (import.meta.env.DEV) {
        console.group('RECHARGE PLANS API RESPONSE');
        console.log('Full Response:', res.data);
        console.groupEnd();
      }

      // Robust extraction: Handle various nested structures
      const respData = res.data;
      let rawData = [];

      if (Array.isArray(respData)) {
        rawData = respData;
      } else if (respData.data && Array.isArray(respData.data)) {
        rawData = respData.data;
      } else if (respData.data?.data && Array.isArray(respData.data.data)) {
        rawData = respData.data.data;
      } else if (respData.plans && Array.isArray(respData.plans)) {
        rawData = respData.plans;
      } else if (respData.data?.plans && Array.isArray(respData.data.plans)) {
        rawData = respData.data.plans;
      }

      // Map database snake_case to frontend CamelCase
      const mappedPlans = rawData.map((p: any) => ({
        id: p.id,
        planName: p.plan_name || p.planName,
        description: p.description,
        rideLimit: p.ride_limit || p.rideLimit,
        validityDays: p.validity_days || p.validityDays,
        dailyPrice: Number(p.daily_price || p.dailyPrice || 0),
        weeklyPrice: Number(p.weekly_price || p.weeklyPrice || 0),
        monthlyPrice: Number(p.monthly_price || p.monthlyPrice || 0),
        features: (() => {
          const rawFeatures = p.features;
          if (Array.isArray(rawFeatures)) {
            return rawFeatures.filter((f: any) => typeof f === 'string' && f.trim().length > 0);
          }
          if (typeof rawFeatures === 'object' && rawFeatures !== null) {
            // Support legacy flag-based objects or entries where values are true
            return Object.entries(rawFeatures)
              .filter(([_, val]) => val === true || val === 'true')
              .map(([key]) => key);
          }
          return [];
        })(),
        isActive: p.is_active !== undefined ? p.is_active : p.isActive,
      }));
      setPlans(mappedPlans);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchActiveSubscriptions();
  }, []);

  const fetchActiveSubscriptions = async () => {
    try {
      setLoadingActiveSubs(true);
      const res = await axios.get("/api/recharge-plans/active-subscriptions");
      
      const respData = res.data;
      let extractedSubs = [];
      
      if (Array.isArray(respData)) {
        extractedSubs = respData;
      } else if (Array.isArray(respData.data)) {
        extractedSubs = respData.data;
      } else if (respData.data?.data && Array.isArray(respData.data.data)) {
        extractedSubs = respData.data.data;
      } else if (respData.subscriptions && Array.isArray(respData.subscriptions)) {
        extractedSubs = respData.subscriptions;
      }

      setActiveSubscriptions(extractedSubs);
    } catch (err) {
      console.error("Failed to fetch active subscriptions:", err);
    } finally {
      setLoadingActiveSubs(false);
    }
  };

  const formatFeatureLabel = (key: string) => {
    // If it already looks like a sentence, leave it
    if (key.includes(' ')) return key;
    
    // Mapping for common technical keys
    const mapping: Record<string, string> = {
      zero_commission: "Zero Commission",
      oneway_enabled: "One-Way Trips",
      outstation_enabled: "Outstation Trips",
      priority_matching: "Priority Matching",
      instant_requests: "Instant Requests",
      no_surge_pricing: "No Surge Pricing",
      premium_driver_rank: "Premium Driver Rank",
      scheduled_rides: "Scheduled Rides"
    };

    if (mapping[key]) return mapping[key];

    // Fallback: replace underscores/hyphens and capitalize
    return key
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getPlanConfig = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('premium')) {
      return { icon: <Crown size={24} fill="currentColor" /> };
    }
    if (lowerName.includes('elite')) {
      return { icon: <Trophy size={24} fill="currentColor" /> };
    }
    return { icon: <Zap size={24} fill="currentColor" /> };
  };

  /* ---- Handlers ---- */
  const handleOpenModal = (plan?: RechargePlan) => {
    if (plan) {
      setEditingId(plan.id);
      
      setFormData({
        planName: plan.planName,
        description: plan.description || '',
        validityDays: plan.validityDays?.toString() || '',
        dailyPrice: plan.dailyPrice.toString(),
        weeklyPrice: plan.weeklyPrice.toString(),
        monthlyPrice: plan.monthlyPrice.toString(),
        features: Array.isArray(plan.features) ? [...plan.features] : [],
        isActive: plan.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({
        planName: '',
        description: '',
        validityDays: '',
        dailyPrice: '',
        weeklyPrice: '',
        monthlyPrice: '',
        features: [],
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        planName: formData.planName,
        description: formData.description,
        validityDays: Number(formData.validityDays),
        dailyPrice: Number(formData.dailyPrice),
        weeklyPrice: Number(formData.weeklyPrice),
        monthlyPrice: Number(formData.monthlyPrice),
        features: formData.features.filter(f => f.trim()),
        isActive: formData.isActive,
      };

      if (editingId) {
        await axios.patch(`/api/recharge-plans/update/${editingId}`, payload);
        alert('Plan updated successfully!');
      } else {
        await axios.post('/api/recharge-plans/create', payload);
        alert('New plan created successfully!');
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      console.error('Failed to save plan:', err);
      alert('Failed to save plan. Please check all fields.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      try {
        await axios.delete(`/api/recharge-plans/delete/${id}`);
        alert('Plan deleted successfully');
        fetchPlans();
      } catch (err) {
        console.error('Failed to delete plan:', err);
        alert('Failed to delete plan');
      }
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await axios.patch(`/api/recharge-plans/status/${id}`, { isActive: !currentStatus });
      alert(`Plan ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      fetchPlans();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    }
  };

  const filteredPlans = plans.filter((p) =>
    p.planName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#F8F9FC] min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#1d2a5c] tracking-tight">Recharge Plans</h1>
          <p className="text-gray-400 font-medium mt-1">Manage driver subscription and recharge tiered plans</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 border-2 border-[#1d2a5c] text-[#1d2a5c] px-6 py-2.5 rounded-xl transition-all hover:bg-[#1d2a5c]/5 active:scale-95 font-black uppercase tracking-wider text-xs shadow-sm"
        >
          <Plus size={18} />
          Create New Plan
        </button>
      </div>

      <div className="flex gap-8 mb-10 border-b border-gray-200/60">
        <button
          onClick={() => setActiveTab("plans")}
          className={`pb-4 px-2 font-bold transition-all relative ${
            activeTab === "plans"
              ? "text-[#1d2a5c]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Manage Plans
          {activeTab === "plans" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1d2a5c] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`pb-4 px-2 font-bold transition-all relative ${
            activeTab === "subscriptions"
              ? "text-[#1d2a5c]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Active Subscriptions
          {activeTab === "subscriptions" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1d2a5c] rounded-t-full" />
          )}
        </button>
      </div>

  {activeTab === "plans" ? (
    <>
        <div className="mb-10 relative max-w-2xl group">
          <Search
            className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-300 group-focus-within:text-[#1d2a5c] transition-colors"
            size={22}
          />
          <input
            type="text"
            placeholder="Search recharge plans..."
            className="w-full pl-14 pr-6 py-4.5 bg-white border border-gray-200 shadow-sm rounded-[1.25rem] focus:ring-4 focus:ring-[#1d2a5c]/5 focus:border-[#1d2a5c] outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i: number) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-2xl h-64 shadow-sm border border-gray-100" />
          ))
        ) : filteredPlans.length > 0 ? (
          filteredPlans.map((plan) => {
            const isExpanded = expandedPlanId === plan.id;
            const config = getPlanConfig(plan.planName);
            
            return (
              <div
                key={plan.id}
                onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                className={`bg-white rounded-2xl p-6 border border-gray-200 transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                  isExpanded 
                    ? 'col-span-full shadow-2xl ring-1 ring-[#1d2a5c]/20 border-[#1d2a5c]/10 mt-2 mb-4' 
                    : 'shadow-sm hover:shadow-lg hover:-translate-y-1'
                } ${!plan.isActive && !isExpanded ? 'opacity-70 grayscale-[0.5]' : ''}`}
              >
                {/* HEADER ROW: CLEAR VISION */}
                <div className="flex flex-col gap-6 transition-all duration-500">
                  <div className={`flex items-center justify-between ${isExpanded ? 'border-b border-gray-100 pb-6' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-[#1d2a5c] transition-all group-hover:bg-[#1d2a5c] group-hover:text-white shadow-sm border border-gray-200`}>
                        {config.icon}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-[#1d2a5c] tracking-tight capitalize leading-none">
                            {plan.planName}
                          </h3>
                          {/* Pulsed Status - Integrated to Plan Title */}
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 ${plan.isActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${plan.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                              {plan.isActive ? 'Live' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        {!isExpanded && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-[9px] font-black text-gray-500 uppercase tracking-[0.1em]">
                            <ClockCircleOutlined style={{ fontSize: '12px' }} />
                            {plan.validityDays || '0'} Days Validity
                          </div>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="bg-[#1d2a5c] px-5 py-3 rounded-xl flex items-center gap-4 animate-in fade-in zoom-in-95 duration-500 shadow-lg">
                        <div className="text-3xl font-black text-white">
                          {activeSubscriptions.filter(s => s.plan_name?.toLowerCase() === plan.planName?.toLowerCase()).length}
                        </div>
                        <div className="text-[10px] font-black text-white/90 uppercase tracking-widest leading-tight border-l border-white/20 pl-4">
                          Active<br/><span className="text-[8px] text-white/60">Drivers</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {isExpanded ? (
                    <div className="flex flex-col gap-8 animate-in fade-in duration-700 font-bold">
                      {/* CONTENT SECTION: HIGH CONTRAST COLUMNS */}
                      <div className="grid grid-cols-2 gap-10">
                        {/* PRICING */}
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-4 border-l-2 border-[#1d2a5c] pl-3">Plan Pricing</h4>
                          <div className="space-y-3">
                            {[
                              { label: 'Daily Access', price: plan.dailyPrice, period: 1, color: 'text-[#1d2a5c]' },
                              { label: 'Weekly Access', price: plan.weeklyPrice, period: 7, color: 'text-indigo-700' },
                              { label: 'Monthly Access', price: plan.monthlyPrice, period: 30, color: 'text-blue-700' }
                            ].map((tier: any, i: number) => tier.price > 0 && (
                              <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center group/tier hover:bg-white hover:shadow-md hover:border-[#1d2a5c]/20 transition-all">
                                <span className="text-xs font-black text-gray-600 uppercase tracking-tight">{tier.label}</span>
                                <div className="text-right">
                                  <div className={`text-xl font-black ${tier.color}`}>₹{tier.price}</div>
                                  {tier.period > 1 && (
                                    <div className="text-[9px] font-black text-green-600 uppercase tracking-tight">₹{Math.floor(tier.price / tier.period)} / Day Value</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* FEATURES */}
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-4 border-l-2 border-green-500 pl-3">Plan Benefits</h4>
                          <ul className="grid grid-cols-1 gap-2.5">
                            {plan.features.map((feature: string, idx: number) => (
                              <li key={idx} className="flex items-center gap-3 text-xs text-gray-800 font-black bg-gray-50 p-3 rounded-xl border border-gray-200 hover:border-green-200 transition-all">
                                <CheckCircle size={12} className="text-green-600" />
                                <span>{formatFeatureLabel(feature)}</span>
                              </li>
                            ))}
                            <li className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 pt-3 border-t border-gray-100">
                               <ClockCircleOutlined /> Validity: {plan.validityDays || '0'} Days Total
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* BOTTOM SECTION: CLEAR ACTIONS */}
                      <div className="mt-4 pt-6 border-t border-gray-100 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenModal(plan); }}
                            className="border-2 border-[#1d2a5c] text-[#1d2a5c] bg-white px-8 py-3 rounded-xl font-black transition-all hover:bg-[#1d2a5c] hover:text-white hover:shadow-xl flex items-center gap-2 active:scale-95 text-xs"
                          >
                            <Edit2 size={14} />
                            MODIFY PLAN
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleStatus(plan.id, plan.isActive); }}
                            className={`px-8 py-3 rounded-xl font-black border-2 transition-all flex items-center gap-2 active:scale-95 text-xs ${
                              plan.isActive 
                                ? 'border-red-200 text-red-600 bg-white hover:bg-red-600 hover:text-white hover:border-red-600' 
                                : 'border-green-200 text-green-700 bg-white hover:bg-green-600 hover:text-white hover:border-green-600'
                            }`}
                          >
                            {plan.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                            {plan.isActive ? 'DEACTIVATE' : 'GO LIVE NOW'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(plan.id); }}
                            className="ml-4 p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90 border border-transparent hover:border-red-100"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2 opacity-80">
                           <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                           PLAN STATUS: {plan.isActive ? 'ACTIVE' : 'OFFLINE'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* COLLAPSED MINI VIEW: ULTRA CLEAN */
                    <div className="flex flex-col gap-3">
                      <p className="text-gray-400 text-[11px] font-medium leading-relaxed line-clamp-2 pr-12">
                        {plan.description}
                      </p>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                        <div className="flex -space-x-1">
                          {plan.features.slice(0, 3).map((_: any, i: number) => (
                            <div key={i} className="w-5 h-5 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                              <CheckCircle size={8} className="text-green-500 opacity-60" />
                            </div>
                          ))}
                        </div>
                        <div className="text-[#1d2a5c] text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-all">
                          Manage Plan <Plus size={10} strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 bg-white rounded-2xl text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-400">No recharge plans found. Create your first one!</p>
          </div>
        )}
      </div>
    </>
  ) : (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-[#1d2a5c] tracking-tight">Live Driver Subscriptions</h2>
          <p className="text-xs text-gray-400 font-medium mt-1">Real-time status of all active driver recharge plans</p>
        </div>
        <button
          onClick={fetchActiveSubscriptions}
          className="p-3 hover:bg-gray-50 rounded-2xl text-[#1d2a5c] transition-all active:scale-90"
          title="Refresh List"
        >
          <Zap size={20} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Driver Identity</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Plan Details</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Billing Cycle</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timeline</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Expiration</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loadingActiveSubs ? (
              [1, 2, 3].map((i: number) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-8">
                    <div className="h-10 bg-gray-50 rounded-xl w-full"></div>
                  </td>
                </tr>
              ))
            ) : activeSubscriptions.length > 0 ? (
              activeSubscriptions.map((sub: any) => {
                const daysLeft = Math.ceil((new Date(sub.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isExpiring = daysLeft < 3;
                
                return (
                  <tr key={sub.id} className="group hover:bg-gray-50/50 transition-all duration-200">
                    <td className="px-8 py-6">
                      <div className="font-black text-[#1d2a5c] tracking-tight text-base">{sub.driver_name}</div>
                      <div className="text-xs font-bold text-gray-400 mt-0.5">{sub.driver_phone}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1d2a5c]">
                          <Zap size={14} fill="currentColor" />
                        </div>
                        <span className="text-sm font-black text-[#1d2a5c] uppercase tracking-wide">
                          {sub.plan_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                        {sub.billing_cycle}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-gray-500">
                      {new Date(sub.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-[#1d2a5c]">
                          {new Date(sub.expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-tight mt-1 ${
                          isExpiring ? 'text-red-500' : 'text-gray-400'
                        }`}>
                          {daysLeft} days remaining
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest bg-green-50/50 px-4 py-2 rounded-full w-fit border border-green-100/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        Live Active
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-32 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                      <Zap size={40} />
                    </div>
                    <p className="text-gray-400 font-bold">No active driver subscriptions found currently.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )}


      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">{editingId ? 'Edit Plan' : 'Create New Plan'}</h2>
                  <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Configure tiered pricing and dynamic features
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all active:scale-90"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 custom-scrollbar px-8 py-6">
              <div className="space-y-10">
                {/* SECTION: BASIC INFO */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <Zap size={20} fill="currentColor" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Basic Information</h3>
                    </div>
                    {/* PLAN PRESETS */}
                    {!editingId && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Presets:</span>
                        {['Basic', 'Elite', 'Premium'].map((type: string) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              const presets: any = {
                                Basic: {
                                  name: 'Basic Plan',
                                  desc: 'Entry-level plan for drivers who want to operate within their local city with zero commission.',
                                  features: ["Zero commission on all rides", "Access to local city rides only", "Accept instant ride requests", "Basic customer support", "Scheduled rides not available"]
                                },
                                Elite: {
                                  name: 'Elite Plan',
                                  desc: 'Advanced plan for drivers who want more ride options and higher earning opportunities.',
                                  features: ["Zero commission on all rides", "Access to all available ride types", "Scheduled rides enabled (only for weekly and monthly plans)", "Outstation trips enabled", "One-way trips enabled", "Priority ride matching"]
                                },
                                Premium: {
                                  name: 'Premium Plan',
                                  desc: 'Full-featured plan designed for high-performing drivers with maximum ride access and priority support.',
                                  features: ["Zero commission on all rides", "Access to all available ride types", "Scheduled rides enabled (only for weekly and monthly plans)", "All ride categories enabled: Local rides, Outstation trips, One-way trips, Round trips", "Priority ride matching", "24/7 priority support"]
                                }
                              };
                              const p = presets[type];
                              setFormData({
                                ...formData,
                                planName: p.name,
                                description: p.desc,
                                features: p.features
                              });
                            }}
                            className="text-[10px] font-bold px-3 py-1.5 bg-gray-50 hover:bg-[#1d2a5c] hover:text-white rounded-lg border border-gray-100 transition-all active:scale-95"
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2.5">Plan Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#1d2a5c] focus:bg-white rounded-[1.25rem] outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                        placeholder="e.g. Premium Executive Tier"
                        value={formData.planName}
                        onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2.5">Description</label>
                      <textarea
                        rows={3}
                        className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#1d2a5c] focus:bg-white rounded-[1.25rem] outline-none transition-all font-medium text-gray-600 resize-none placeholder:text-gray-300"
                        placeholder="Briefly describe the target audience or benefits..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>


                    <div className="relative group">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                        Validity Period
                        <span className="text-[10px] bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full lowercase font-bold">Days</span>
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#1d2a5c] focus:bg-white rounded-[1.25rem] outline-none transition-all font-black text-gray-900"
                        value={formData.validityDays}
                        onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                      />
                    </div>
                  </div>
                </section>

                <hr className="border-gray-50" />

                {/* SECTION: PRICING TIERS */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                      <Zap size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">Pricing Tiers (₹)</h3>
                      <p className="text-[11px] text-gray-400 font-medium">Define costs for different billing cycles</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight text-center">Daily</label>
                      <input
                        type="number"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#1d2a5c] focus:bg-white rounded-[1.25rem] outline-none transition-all font-bold text-gray-900 text-center"
                        placeholder="0"
                        value={formData.dailyPrice}
                        onChange={(e) => setFormData({ ...formData, dailyPrice: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight text-center">Weekly</label>
                      <input
                        type="number"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#1d2a5c] focus:bg-white rounded-[1.25rem] outline-none transition-all font-bold text-gray-900 text-center"
                        placeholder="0"
                        value={formData.weeklyPrice}
                        onChange={(e) => setFormData({ ...formData, weeklyPrice: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight text-center">Monthly</label>
                      <input
                        type="number"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#1d2a5c] focus:bg-white rounded-[1.25rem] outline-none transition-all font-bold text-gray-900 text-center"
                        placeholder="0"
                        value={formData.monthlyPrice}
                        onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                      />
                    </div>
                  </div>
                </section>

                <hr className="border-gray-50" />

                {/* SECTION: FEATURES */}
                <section className="pb-4">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Included Features</h3>
                      <p className="text-[11px] text-gray-400 font-medium italic">Define what drivers receive with this plan</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const suggestions = [
                          "Zero commission on all rides",
                          "Access to local city rides only",
                          "Access to all available ride types",
                          "Accept instant ride requests",
                          "Scheduled rides enabled (Weekly/Monthly)",
                          "Outstation trips enabled",
                          "One-way trips enabled",
                          "Round trips enabled",
                          "Priority ride matching",
                          "24/7 priority support",
                          "Basic customer support"
                        ];
                        const newFeatures = [...formData.features];
                        suggestions.forEach(s => {
                          if (!newFeatures.includes(s)) newFeatures.push(s);
                        });
                        setFormData({ ...formData, features: newFeatures });
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-[#1d2a5c] hover:text-white hover:bg-[#1d2a5c] bg-[#1d2a5c]/5 px-4 py-2.5 rounded-xl transition-all active:scale-95"
                    >
                      + Quick Add Suggestions
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.features.map((feature: string, index: number) => (
                      <div key={index} className="flex gap-3 group transform transition-all animate-in slide-in-from-left-4 duration-300">
                        <div className="flex-1 relative">
                          <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                          <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#1d2a5c] focus:bg-white rounded-[1.25rem] outline-none transition-all text-sm font-bold text-gray-700"
                            value={feature}
                            onChange={(e) => {
                              const newFeatures = [...formData.features];
                              newFeatures[index] = e.target.value;
                              setFormData({ ...formData, features: newFeatures });
                            }}
                            placeholder="e.g. 24/7 Executive Priority Support"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newFeatures = formData.features.filter((_, i) => i !== index);
                            setFormData({ ...formData, features: newFeatures });
                          }}
                          className="p-3.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-[1.25rem] transition-all active:scale-90"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}
                      className="w-full py-5 border-2 border-dashed border-gray-100 rounded-[1.5rem] text-gray-400 hover:text-[#1d2a5c] hover:border-[#1d2a5c]/30 hover:bg-[#1d2a5c]/5 transition-all font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      <Plus size={18} />
                      Add Custom Feature
                    </button>
                  </div>
                </section>
              </div>
            </form>

            {/* FIXED FOOTER */}
            <div className="p-8 border-t border-gray-50 bg-white sticky bottom-0 z-10">
              <div className="flex justify-end items-center gap-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-sm font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.25rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-200 transition-all active:scale-95 hover:-translate-y-1"
                >
                  {editingId ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RechargePlanPage;
