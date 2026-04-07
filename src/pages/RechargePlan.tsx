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
      return {
        icon: <Crown size={24} fill="currentColor" />,
        bgColor: 'bg-amber-50',
        textColor: 'bg-amber-50 text-amber-600',
        borderColor: 'border-amber-100',
        accentColor: 'text-amber-600'
      };
    }
    if (lowerName.includes('elite')) {
      return {
        icon: <Trophy size={24} fill="currentColor" />,
        bgColor: 'bg-purple-50',
        textColor: 'bg-purple-50 text-purple-600',
        borderColor: 'border-purple-100',
        accentColor: 'text-purple-600'
      };
    }
    return {
      icon: <Zap size={24} fill="currentColor" />,
      bgColor: 'bg-blue-50',
      textColor: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-100',
      accentColor: 'text-blue-600'
    };
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
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recharge Plans</h1>
          <p className="text-gray-500">Manage driver subscription and recharge tiered plans</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95"
        >
      <Plus size={20} />
      Create New Plan
    </button>
  </div>

  <div className="flex gap-4 mb-8 border-b border-gray-200">
    <button
      onClick={() => setActiveTab("plans")}
      className={`pb-4 px-4 font-bold transition-all ${
        activeTab === "plans"
          ? "text-blue-600 border-b-2 border-blue-600"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      Manage Plans
    </button>
    <button
      onClick={() => setActiveTab("subscriptions")}
      className={`pb-4 px-4 font-bold transition-all ${
        activeTab === "subscriptions"
          ? "text-blue-600 border-b-2 border-blue-600"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      Active Subscriptions
    </button>
  </div>

  {activeTab === "plans" ? (
    <>
      <div className="mb-10 relative max-w-xl group">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by plan name..."
          className="w-full pl-12 pr-6 py-4 bg-white border-2 border-transparent shadow-sm rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:shadow-xl outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-2xl h-64 shadow-sm border border-gray-100" />
          ))
        ) : filteredPlans.length > 0 ? (
          filteredPlans.map((plan) => {
            const config = getPlanConfig(plan.planName);
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all hover:shadow-md ${
                  plan.isActive ? 'border-transparent' : 'border-red-100 opacity-80'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${config.textColor}`}>
                    {config.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(plan)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className={`text-2xl font-black text-gray-900 mb-2 tracking-tight transition-colors group-hover:${config.accentColor}`}>
                  {plan.planName}
                </h3>
                <p className="text-gray-500 text-xs font-semibold leading-relaxed mb-6 line-clamp-2 h-9">
                  {plan.description}
                </p>

                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50/50 text-orange-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-100/50">
                  <ClockCircleOutlined style={{ fontSize: '14px' }} />
                  {typeof plan.validityDays === 'object' && plan.validityDays !== null ? 'Multi' : plan.validityDays} Days
                </div>

                <div className="space-y-3 mb-6">
                  {plan.dailyPrice > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 font-medium lowercase">Daily Price</span>
                      <span className="font-bold text-blue-600">₹{plan.dailyPrice}</span>
                    </div>
                  )}
                  {plan.weeklyPrice > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 font-medium lowercase">Weekly Price</span>
                      <span className="font-bold text-purple-600">₹{plan.weeklyPrice}</span>
                    </div>
                  )}
                  {plan.monthlyPrice > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 font-medium lowercase">Monthly Price</span>
                      <span className="font-bold text-indigo-600">₹{plan.monthlyPrice}</span>
                    </div>
                  )}
                </div>

                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <div className="mb-6 pt-4 border-t border-gray-50">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-3">Included Features</span>
                    <ul className="space-y-2">
                      {plan.features.slice(0, 4).map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                          <CheckCircle size={14} className="text-green-500 shrink-0" />
                          <span className="truncate">{formatFeatureLabel(feature)}</span>
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-[10px] text-blue-500 font-bold ml-5">+{plan.features.length - 4} more features</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
                      plan.isActive ? 'bg-green-100/80 text-green-700' : 'bg-red-100/80 text-red-700'
                    }`}
                  >
                    {plan.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                    {plan.isActive ? 'Active' : 'Disabled'}
                  </div>
                  <button
                    onClick={() => toggleStatus(plan.id, plan.isActive)}
                    className={`text-xs font-black uppercase tracking-wider transition-colors ${
                      plan.isActive ? 'text-red-500 hover:text-red-600' : 'text-green-600 hover:text-green-700'
                    }`}
                  >
                    {plan.isActive ? 'Disable' : 'Enable'}
                  </button>
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
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Live Driver Subscriptions</h2>
        <button
          onClick={fetchActiveSubscriptions}
          className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 transition-colors"
          title="Refresh List"
        >
          <Zap size={18} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Driver</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Active Plan</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cycle</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loadingActiveSubs ? (
              [1, 2, 3].map((i) => (
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
                  <tr key={sub.id} className="group hover:bg-gray-50/80 transition-all duration-200">
                    <td className="px-6 py-6 border-b border-gray-50">
                      <div className="font-black text-gray-900 tracking-tight">{sub.driver_name}</div>
                      <div className="text-xs font-bold text-gray-400 mt-1">{sub.driver_phone}</div>
                    </td>
                    <td className="px-6 py-6 border-b border-gray-50">
                      <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {sub.plan_name}
                      </span>
                    </td>
                    <td className="px-6 py-6 border-b border-gray-50">
                      <span className="text-xs font-black text-gray-500 uppercase tracking-tighter bg-gray-100 px-2 py-1 rounded-md">
                        {sub.billing_cycle}
                      </span>
                    </td>
                    <td className="px-6 py-6 border-b border-gray-50 text-xs font-bold text-gray-500">
                      {new Date(sub.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-6 border-b border-gray-50">
                      <div className="text-xs font-black text-gray-900">
                        {new Date(sub.expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <span className={`ml-2 text-[9px] font-black uppercase tracking-tight px-1.5 py-0.5 rounded-md ${
                          isExpiring ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'
                        }`}>
                          {daysLeft}d left
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 border-b border-gray-50">
                      <div className="flex items-center gap-1.5 text-green-600 text-[10px] font-black uppercase tracking-widest bg-green-50 px-3 py-1.5 rounded-full w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        Active
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
                        {['Basic', 'Elite', 'Premium'].map((type) => (
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
                            className="text-[10px] font-bold px-3 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg border border-gray-100 transition-all active:scale-95"
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
                        className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                        placeholder="e.g. Premium Executive Tier"
                        value={formData.planName}
                        onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2.5">Description</label>
                      <textarea
                        rows={3}
                        className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-600 resize-none placeholder:text-gray-300"
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
                        className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-black text-gray-900"
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
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 text-center"
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
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 text-center"
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
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 text-center"
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
                      className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-xl transition-all active:scale-95"
                    >
                      + Quick Add Suggestions
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-3 group transform transition-all animate-in slide-in-from-left-4 duration-300">
                        <div className="flex-1 relative">
                          <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                          <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all text-sm font-bold text-gray-700"
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
                          className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}
                      className="w-full py-4 border-2 border-dashed border-gray-100 rounded-[1.5rem] text-gray-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/30 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-[0.98]"
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
