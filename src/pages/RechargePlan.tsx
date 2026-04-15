import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Trash2,
  X,
  Zap,
  Trophy,
  Crown,
  ChevronDown,
  ChevronUp,
  Users,
  Edit3,
  Power,
} from 'lucide-react';
import axios from '../api/axios';
import { Drawer, Select, Button, Space, Tag, Modal } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

/* ================= TYPES ================= */

interface RechargePlan {
  id: number;
  planName: string;
  description: string;
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
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const [subSearchTerm, setSubSearchTerm] = useState("");

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

      // Dev Logging
      if (import.meta.env.DEV) {
        console.group('ACTIVE SUBSCRIPTIONS API RESPONSE');
        console.log('Full Response:', res.data);
        console.groupEnd();
      }

      const respData = res.data;
      let rawSubs = [];

      if (Array.isArray(respData)) {
        rawSubs = respData;
      } else if (Array.isArray(respData.data)) {
        rawSubs = respData.data;
      } else if (respData.data?.data && Array.isArray(respData.data.data)) {
        rawSubs = respData.data.data;
      } else if (respData.subscriptions && Array.isArray(respData.subscriptions)) {
        rawSubs = respData.subscriptions;
      }

      const mappedSubs = rawSubs.map((s: any) => ({
        id: s.id,
        driverName: s.driver_name || s.driverName || 'N/A',
        driverPhone: s.driver_phone || s.driverPhone || 'N/A',
        planName: s.plan_name || s.planName || 'N/A',
        billingCycle: s.billing_cycle || s.billingCycle || 'N/A',
        startDate: s.start_date || s.startDate,
        expiryDate: s.expiry_date || s.expiryDate,
      }));

      setActiveSubscriptions(mappedSubs);
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
    Modal.confirm({
      title: 'Delete Plan?',
      content: 'Are you sure you want to delete this plan? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axios.delete(`/api/recharge-plans/delete/${id}`);
          alert('Plan deleted successfully');
          fetchPlans();
        } catch (err) {
          console.error('Failed to delete plan:', err);
          alert('Failed to delete plan');
        }
      },
    });
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

  const filteredPlans = plans.filter((p) => {
    const matchesSearch = p.planName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && p.isActive) ||
      (statusFilter === "inactive" && !p.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 bg-[#F5F7FA] min-h-screen font-sans">
      {/* Header section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recharge Plans</h1>
          <p className="text-slate-500 text-sm mt-1">Manage plans and monitor subscriptions</p>
        </div>
      </div>

      {/* Tabs section */}
      <div className="flex gap-8 mb-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("plans")}
          className={`pb-4 px-1 text-sm font-semibold transition-all relative ${activeTab === "plans"
              ? "text-indigo-600"
              : "text-slate-400 hover:text-slate-600"
            }`}
        >
          Manage Plans <span className="ml-1 opacity-60 font-medium">{plans.length}</span>
          {activeTab === "plans" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`pb-4 px-1 text-sm font-semibold transition-all relative ${activeTab === "subscriptions"
              ? "text-indigo-600"
              : "text-slate-400 hover:text-slate-600"
            }`}
        >
          Active Subscriptions <span className="ml-1 opacity-60 font-medium">{activeSubscriptions.length}</span>
          {activeTab === "subscriptions" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
      </div>

      {activeTab === "plans" ? (
        <>
          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full sm:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search plans..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                defaultValue="all"
                style={{ width: 140, height: 40 }}
                onChange={setStatusFilter}
                className="custom-select"
                suffixIcon={<ChevronDown size={16} className="text-slate-400" />}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 text-indigo-600 border border-indigo-600 hover:bg-indigo-50 px-5 py-2.5 rounded-lg transition-all active:scale-95 text-sm font-semibold"
            >
              <Plus size={18} />
              Create Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map((i: number) => (
                <div key={i} className="animate-pulse bg-white p-8 rounded-2xl h-80 shadow-sm border border-slate-100" />
              ))
            ) : filteredPlans.length > 0 ? (
              filteredPlans.map((plan) => {
                const isExpanded = expandedPlanId === plan.id;
                const activeSubCount = activeSubscriptions.filter(s => s.planName?.toLowerCase() === plan.planName?.toLowerCase()).length;

                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden ${isExpanded
                        ? 'shadow-xl border-indigo-200 ring-1 ring-indigo-50/50'
                        : 'shadow-sm border-slate-200 hover:shadow-md hover:border-slate-300'
                      }`}
                  >
                    {/* Card Header area */}
                    <div
                      className="p-6 cursor-pointer flex-1"
                      onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900 capitalize">{plan.planName}</h3>
                            <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${plan.isActive
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                : 'bg-slate-100 border-slate-200 text-slate-400'
                              }`}>
                              {plan.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-slate-400" title="Active Subscriptions">
                              <Users size={14} />
                              <span className="text-xs font-medium">{activeSubCount}</span>
                            </div>

                          </div>
                        </div>
                        <button className="text-slate-400 p-1 hover:bg-slate-50 rounded-md transition-colors">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>

                      {/* Pricing Blocks */}
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100/50">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Daily</div>
                          <div className="text-sm font-bold text-slate-900">₹{plan.dailyPrice}</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100/50">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Weekly</div>
                          <div className="text-sm font-bold text-slate-900">₹{plan.weeklyPrice}</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100/50">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly</div>
                          <div className="text-sm font-bold text-slate-900">₹{plan.monthlyPrice}</div>
                        </div>
                      </div>

                      {/* Feature List */}
                      <ul className="space-y-2.5">
                        {plan.features.slice(0, 4).map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-500 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                            <span>{formatFeatureLabel(feature)}</span>
                          </li>
                        ))}
                        {plan.features.length > 4 && (
                          <li className="text-[11px] font-bold text-indigo-600 mt-2 ml-3.5">
                            +{plan.features.length - 4} more
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Expanded Actions area */}
                    {isExpanded && (
                      <div className="px-6 py-4 bg-white border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex gap-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenModal(plan); }}
                            className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 py-2 rounded-lg text-xs font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleStatus(plan.id, plan.isActive); }}
                            className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 py-2 rounded-lg text-xs font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                          >
                            <Power size={14} className={plan.isActive ? 'text-rose-500' : 'text-emerald-500'} />
                            {plan.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(plan.id); }}
                            className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-slate-50 rounded-lg transition-all shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-20 bg-white rounded-2xl text-center border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">No plans found. Create your first one!</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Controls Row for Subscriptions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by driver name or phone..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                value={subSearchTerm}
                onChange={(e) => setSubSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchActiveSubscriptions}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              >
                <Zap size={16} />
                Refresh
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Active Subscriptions</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time status of all active driver plans</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Driver</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Plan</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Cycle</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Start</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Expiry</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingActiveSubs ? (
                    [1, 2, 3].map((i: number) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="px-6 py-6">
                          <div className="h-8 bg-slate-50 rounded-lg w-full"></div>
                        </td>
                      </tr>
                    ))
                  ) : activeSubscriptions.filter(s =>
                    s.driverName?.toLowerCase().includes(subSearchTerm.toLowerCase()) ||
                    s.driverPhone?.toLowerCase().includes(subSearchTerm.toLowerCase())
                  ).length > 0 ? (
                    activeSubscriptions
                      .filter(s =>
                        s.driverName?.toLowerCase().includes(subSearchTerm.toLowerCase()) ||
                        s.driverPhone?.toLowerCase().includes(subSearchTerm.toLowerCase())
                      )
                      .map((sub: any) => {
                        const daysLeft = Math.ceil((new Date(sub.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        const isExpiring = daysLeft < 3;

                        return (
                          <tr key={sub.id} className="group hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-5">
                              <div className="font-bold text-slate-900 text-sm">{sub.driverName}</div>
                              <div className="text-[11px] font-medium text-slate-400 mt-0.5">{sub.driverPhone}</div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100/50">
                                {sub.planName}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                                {sub.billingCycle}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-xs font-semibold text-slate-500">
                              {sub.startDate ? new Date(sub.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                            </td>
                            <td className="px-6 py-5">
                              <div className="text-xs font-bold text-slate-700">
                                {sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className={`flex items-center gap-1.5 text-xs font-bold ${isExpiring ? 'text-rose-600' : 'text-emerald-600'
                                }`}>
                                {isNaN(daysLeft) ? 'N/A' : `${daysLeft}d`}
                                {isExpiring && !isNaN(daysLeft) && (
                                  <span className="text-[9px] bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">Soon</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-3 bg-slate-50 rounded-full text-slate-200">
                            <Zap size={32} />
                          </div>
                          <p className="text-slate-400 text-xs font-medium">No active subscriptions found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      <Drawer
        title={
          <div className="flex flex-col">
            <div className="flex justify-between items-center mr-8">
              <span className="text-xl font-bold text-slate-900">{editingId ? 'Edit Plan' : 'Create Plan'}</span>
              {!editingId && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        planName: 'Basic Plan',
                        description: 'Entry-level plan for local operation.',
                        features: ["Zero commission on local rides", "Instant requests", "Basic support"]
                      });
                    }}
                    className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                  >
                    Basic
                  </button>
                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        planName: 'Elite Plan',
                        description: 'Advanced plan for higher earnings.',
                        features: ["Zero commission on all rides", "Outstation trips", "Priority matching"]
                      });
                    }}
                    className="text-[10px] font-bold px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded text-indigo-600 transition-colors"
                  >
                    Elite
                  </button>
                </div>
              )}
            </div>
            <span className="text-xs text-slate-500 font-normal mt-0.5">Configure pricing, validity, and features</span>
          </div>
        }
        placement="right"
        width={520}
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        closeIcon={<X size={20} className="text-slate-400" />}
        styles={{
          header: { borderBottom: '1px solid #f1f5f9', padding: '24px' },
          body: { padding: '24px' },
          footer: { borderTop: '1px solid #f1f5f9', padding: '24px' }
        }}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="px-6 h-10 rounded-lg border-slate-200 text-slate-600 font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="px-8 h-10 rounded-lg text-indigo-600 border-indigo-600 hover:bg-indigo-50 font-semibold"
            >
              {editingId ? 'Save Changes' : 'Create Plan'}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Plan Name & Status */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Name</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-900 shadow-sm"
                placeholder="e.g. Starter"
                value={formData.planName}
                onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
              <Select
                className="w-full h-[42px]"
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(val) => setFormData({ ...formData, isActive: val === 'active' })}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
            <textarea
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-600 shadow-sm min-h-[80px]"
              placeholder="Briefly describe the plan benefits..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Validity */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Validity (Days)</label>
            <input
              type="number"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 shadow-sm"
              value={formData.validityDays}
              onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
            />
          </div>

          {/* Pricing Row */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pricing (₹)</label>
            <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 block ml-1 uppercase">Daily</span>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                  value={formData.dailyPrice}
                  onChange={(e) => setFormData({ ...formData, dailyPrice: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 block ml-1 uppercase">Weekly</span>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                  value={formData.weeklyPrice}
                  onChange={(e) => setFormData({ ...formData, weeklyPrice: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 block ml-1 uppercase">Monthly</span>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                  value={formData.monthlyPrice}
                  onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Features</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const suggestions = ["Zero commission", "Outstation trips", "Scheduled rides", "Priority support"];
                    const current = [...formData.features];
                    suggestions.forEach(s => { if (!current.includes(s)) current.push(s); });
                    setFormData({ ...formData, features: current });
                  }}
                  className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100"
                >
                  Suggestions
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}
                  className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 flex items-center gap-1"
                >
                  <Plus size={10} /> Add
                </button>
              </div>
            </div>
            <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {formData.features.map((feature: string, idx: number) => (
                <div key={idx} className="flex gap-2 group animate-in slide-in-from-right-2 duration-200">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                    placeholder="e.g. Priority Support"
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...formData.features];
                      newFeatures[idx] = e.target.value;
                      setFormData({ ...formData, features: newFeatures });
                    }}
                  />
                  <button
                    onClick={() => {
                      const newFeatures = formData.features.filter((_, i) => i !== idx);
                      setFormData({ ...formData, features: newFeatures });
                    }}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {formData.features.length === 0 && (
                <p className="text-[11px] text-slate-400 italic text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">No features added yet.</p>
              )}
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default RechargePlanPage;
