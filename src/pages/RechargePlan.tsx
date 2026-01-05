import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  Select,
  InputNumber,
  Segmented,
  Modal,
  message,
  Switch,
  Card,
  Spin,
} from "antd";

import { AppstoreOutlined, BarsOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import type { ColumnsType } from "antd/es/table";
import { rechargePlanApi, type RechargePlan, type PlanType, type CreateRechargePlanRequest, type UpdateRechargePlanRequest } from "../api/rechargePlan.api";

const { Option } = Select;


export type FilterValues = {
  planName?: string;
  status?: "Active" | "Inactive";
  sortBy?: "price" | "validity";
};

type FrontendRechargePlanType = {
  id: number;
  name: string;
  planType: PlanType[];
  rideLimit: number | "UNLIMITED";
  validity: number;
  unlimited?: boolean;
  price: number;
  status: "Active" | "Inactive";
  createdDate: string;
  description?: string;
};

const RechargePlan: React.FC = () => {
  const [plans, setPlans] = useState<FrontendRechargePlanType[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<FilterValues>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FrontendRechargePlanType | null>(null);
  const [form] = Form.useForm<FrontendRechargePlanType>();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [sortBy, setSortBy] = useState<"price" | "validity" | undefined>(undefined);

  const MAX_ACTIVE_PLANS = 5;
  const activePlansCount = plans.filter(p => p.status === "Active").length;
  const isActiveLimitReached = activePlansCount >= MAX_ACTIVE_PLANS;

  const mapFrontendToBackend = (frontendPlan: FrontendRechargePlanType): CreateRechargePlanRequest => {
    const backendData = {
      planName: frontendPlan.name,
      planType: frontendPlan.planType,
      description: frontendPlan.description || '',
      rideLimit: frontendPlan.rideLimit === "UNLIMITED" ? 999999 : frontendPlan.rideLimit,
      validityDays: frontendPlan.validity,
      price: frontendPlan.price,
      isActive: frontendPlan.status === "Active",
    };
    console.log('Frontend to Backend Mapping:', {
      input: frontendPlan,
      output: backendData
    });
    return backendData;
  };

  const mapFrontendToBackendUpdate = (frontendPlan: FrontendRechargePlanType): UpdateRechargePlanRequest => {
    const backendData = {
      planName: frontendPlan.name,
      planType: frontendPlan.planType,
      description: frontendPlan.description || '',
      rideLimit: frontendPlan.rideLimit === "UNLIMITED" ? 999999 : frontendPlan.rideLimit,
      validityDays: frontendPlan.validity,
      price: frontendPlan.price,
    };
    console.log('Frontend to Backend Update Mapping:', {
      input: frontendPlan,
      output: backendData
    });
    return backendData;
  };

  const mapBackendToFrontend = (backendPlan: RechargePlan): FrontendRechargePlanType => ({
    id: backendPlan.id,
    name: backendPlan.planName,
    planType: backendPlan.planType,
    description: backendPlan.description,
    rideLimit: backendPlan.rideLimit >= 999999 ? "UNLIMITED" : backendPlan.rideLimit,
    validity: backendPlan.validityDays,
    price: backendPlan.price,
    status: backendPlan.isActive ? "Active" : "Inactive",
    createdDate: new Date(backendPlan.createdAt).toLocaleDateString(),
    
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await rechargePlanApi.getRechargePlans();
      const frontendPlans = response.data.map(mapBackendToFrontend);
      setPlans(frontendPlans);
    } catch (error) {
      message.error("Failed to fetch recharge plans");
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const showAddModal = () => {
    setEditingPlan(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (plan: FrontendRechargePlanType) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      ...plan,
      unlimited: plan.rideLimit === "UNLIMITED",
      rideLimit: plan.rideLimit === "UNLIMITED" ? undefined : plan.rideLimit,
    });
    setIsModalOpen(true);
  };

  const handleStatusToggle = async (id: number, checked: boolean) => {
    try {
      await rechargePlanApi.toggleRechargePlanStatus(id, checked);
      setPlans(prev => prev.map(plan =>
        plan.id === id ? { ...plan, status: checked ? "Active" : "Inactive" } : plan
      ));
      message.success(`Plan ${checked ? "Activated" : "Deactivated"} successfully`);
    } catch (error) {
      message.error("Failed to update plan status");
      console.error("Error toggling status:", error);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      const deletedPlan = plans.find((p) => p.id === deleteId);
      await rechargePlanApi.deleteRechargePlan(deleteId);
      setPlans(prev => prev.filter((p) => p.id !== deleteId));
      message.success(`Plan "${deletedPlan?.name}" has been deleted`);
      setDeleteConfirm(false);
      setDeleteId(null);
    } catch (error) {
      message.error("Failed to delete plan");
      console.error("Error deleting plan:", error);
    }
  };



  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form Values:', values);

      if (!editingPlan && values.status && isActiveLimitReached) {
        message.warning("Only 5 active recharge plans are allowed.");
        return;
      }
      
      const rideLimitValue: number | "UNLIMITED" =
        values.unlimited ? "UNLIMITED" : Number(values.rideLimit);
      
      const planData: FrontendRechargePlanType = {
        id: editingPlan?.id || 0,
        name: values.name,
        planType: values.planType,
        description: values.description,
        rideLimit: rideLimitValue,
        validity: Number(values.validity),
        price: Number(values.price),
        status: values.status ? "Active" : "Inactive",
        createdDate: editingPlan?.createdDate || new Date().toLocaleDateString(),
      };

      console.log('Plan Data before mapping:', planData);

      if (editingPlan) {
        // Update existing plan
        const backendData = mapFrontendToBackendUpdate(planData);
        await rechargePlanApi.updateRechargePlan(editingPlan.id, backendData);
        setPlans(prev =>
          prev.map(p =>
            p.id === editingPlan.id
              ? {
                  ...p,
                  name: values.name,
                  planType: values.planType,
                  description: values.description,
                  rideLimit: rideLimitValue,
                  validity: Number(values.validity),
                  price: Number(values.price),
                  status: values.status ? "Active" : "Inactive",
                }
              : p
          )
        );
        message.success("Recharge plan updated successfully");
      } else {
        // Create new plan
        const backendData = mapFrontendToBackend(planData);
        const response = await rechargePlanApi.createRechargePlan(backendData);
        const newPlan = mapBackendToFrontend(response.data);
        setPlans(prev => [...prev, newPlan]);
        message.success("Recharge plan created successfully");
      }

      setIsModalOpen(false);
      setEditingPlan(null);
      form.resetFields();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      console.error('API Error:', error);
      if (error.response?.data) {
        console.error('Error Response:', error.response.data);
      }
      message.error(editingPlan ? "Failed to update recharge plan" : "Failed to create recharge plan");
    }
  };




  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const finalPlans = plans
    .filter(plan => (!filters.planName ? true : plan.name.toLowerCase().includes(filters.planName.toLowerCase()))
      && (!filters.status ? true : plan.status === filters.status))
    .sort((a, b) => !sortBy ? 0 : Number(a[sortBy]) - Number(b[sortBy]));

  const columns: ColumnsType<FrontendRechargePlanType> = React.useMemo(() => [
    {
      title: "Plan Name", dataIndex: "name", render: (_, record) =>
        <div className="flex flex-col"><span className="font-medium">{record.name}</span>{record.description &&
          <span className="text-sm text-gray-500">{record.description}</span>}</div>
    },

    {
      title: "Plan Type",
      dataIndex: "planType",
      render: (types: PlanType[]) => {
        const planTypeMap: Record<string, string> = {
          "ONE-WAY": "One Way",
          "ROUND-TRIP": "Round Trip",
          "OUT-STATION": "Out Station",
          "SCHEDULE": "Schedule",
        };

        return (
          <span>
            {types?.map(t => planTypeMap[t]).join(", ")}
          </span>
        );
      },
    },

    { title: "Ride Limit", dataIndex: "rideLimit", render: (value) => value === "UNLIMITED" ? "∞ rides" : `${value} rides` },
    { title: "Validity (Days)", dataIndex: "validity", render: (value) => `${value} days` },
    { title: "Price (₹)", dataIndex: "price", render: (price) => `₹${price}` },
    {
      title: "Status", dataIndex: "status", render: (status) => <span
        className={`inline-block px-2 py-[2px] text-xs font-medium rounded-md border
         ${status === "Active" ? "border-[#228B22] bg-[#228B22]/10 text-[#228B22]" : "border-[#DC143C] bg-[#DC143C]/10 text-[#DC143C]"}`}>{status}</span>
    },
    { title: "Created Date", dataIndex: "createdDate" },
    {
      title: "Actions", align: "center", render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <Button type="text" icon={<EditOutlined />} onClick={() => showEditModal(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => { setDeleteId(record.id); setDeleteConfirm(true); }} />
          <Switch size="small" checked={record.status === "Active"} onChange={(checked) => handleStatusToggle(record.id, checked)} />
        </div>
      ),
    },
  ], []);

  return (
    <TitleBar

      title="Recharge Plan Management"
      description="Create and manage recharge plans"
      extraContent={
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white shadow-sm">
            <span className="text-sm font-medium">Active Plans: {activePlansCount}/{MAX_ACTIVE_PLANS}</span>
            <div className="w-24 h-2 bg-gray-300 rounded-full overflow-hidden">
              <div className="h-2 bg-[#101046]" style={{ width: `${(activePlansCount / MAX_ACTIVE_PLANS) * 100}%` }} />
            </div>
          </div>
          <Button type="primary" onClick={showAddModal}>+ Create Plan</Button>
        </div>
      }
    >

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 my-2.5 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <Input placeholder="Search Plan" className="flex-1 min-w-[200px]" value={filters.planName || ""} onChange={(e) => handleFilterChange("planName", e.target.value)} />
        <Select placeholder="All Status" className="w-[150px]" value={filters.status || undefined} onChange={(value) => handleFilterChange("status", value)} allowClear>
          <Option value={undefined}>All Status</Option>
          <Option value="Active">Active</Option>
          <Option value="Inactive">Inactive</Option>
        </Select>
        <Select placeholder="Sort By" className="w-[150px]" value={sortBy} allowClear onChange={(value) => setSortBy(value as "price" | "validity")}>
          <Option value="validity">Validity</Option>
          <Option value="price">Price</Option>
        </Select>
        <Segmented options={[{ label: 'Cards', value: 'cards', icon: <AppstoreOutlined /> }, { label: 'Table', value: 'table', icon: <BarsOutlined /> }]}
          value={viewMode} onChange={(value) => setViewMode(value as "table" | "cards")} className="ml-auto" />
      </div>

      {viewMode === "table" ? (
        <Table rowKey="id"
          columns={columns}
          dataSource={finalPlans}
          pagination={{ pageSize: 5 }}
          size="small"
          scroll={{ x: 900 }}
          loading={loading}
        />
      ) : loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {finalPlans.map(plan => (
            <div key={plan.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg text-gray-900">{plan.name}</h3>
                <span className={`px-2 py-[2px] text-xs font-medium rounded-md border
                   ${plan.status === "Active" ? "border-[#228B22] bg-[#228B22]/10 text-[#228B22]" : "border-[#DC143C] bg-[#DC143C]/10 text-[#DC143C]"}`}>{plan.status}</span>
              </div>
              <Card className="mt-[20px] border-0 shadow-none bg-gray-50 rounded-lg" bodyStyle={{ padding: "12px" }}>
                <div className="flex items-center text-sm text-gray-700">
                  <span className="pr-2">Ride: <b>{plan.rideLimit === "UNLIMITED" ? "∞" : plan.rideLimit}</b></span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="pr-2">Validity: <b>{plan.validity} days</b></span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span>Price: <b>₹{plan.price}</b></span>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}


      <Modal title="Delete Recharge Plan"
        open={deleteConfirm} okText="Delete"
        onOk={handleDelete}
        onCancel={() => setDeleteConfirm(false)}>
        <p>Are you sure you want to delete <b>{plans.find(p => p.id === deleteId)?.name}</b>?</p>
      </Modal>

      
      <Modal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingPlan(null);
        }}
        footer={null}
        width={500}
        centered
        destroyOnClose
        className="recharge-plan-modal"
        styles={{
          body: { padding: '24px', maxHeight: '200vh' }
        }}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-semibold text-gray-900 m-0">
              {editingPlan ? "Edit Recharge Plan" : "Create New Recharge Plan"}
            </h2>
          </div>
          <p className="text-sm text-gray-600">
            {editingPlan ? "Update the plan details below" : "Fill in the details to create a new recharge plan"}
          </p>
        </div>

        <Form 
          layout="vertical" 
          form={form}
          className="recharge-plan-form"
          requiredMark={false}
        >

        
          <Form.Item
            label={<span className="font-medium text-gray-700">Plan Name</span>}
            name="name"
            rules={[{ required: true, message: "Please enter a plan name" }]}
          >
            <Input 
              placeholder="e.g., Daily Commuter, Weekly Pass"
              size="large"
            />
          </Form.Item>

          {/* Plan Type */}
          <Form.Item
            label={<span className="font-medium text-gray-700">Plan Type</span>}
            name="planType"
            rules={[{ required: true, message: "Please select at least one plan type" }]}
          >
            <Select 
              mode="multiple" 
              allowClear
              placeholder="Select plan types"
              size="large"
              maxTagCount={2}
            >
              <Select.Option value="ONE-WAY">
                <div className="flex items-center gap-2">
                  <span>🚗</span> One Way
                </div>
              </Select.Option>
              <Select.Option value="ROUND-TRIP">
                <div className="flex items-center gap-2">
                  <span>🔄</span> Round Trip
                </div>
              </Select.Option>
              <Select.Option value="OUT-STATION">
                <div className="flex items-center gap-2">
                  <span>📍</span> Out Station
                </div>
              </Select.Option>
              <Select.Option value="SCHEDULE">
                <div className="flex items-center gap-2">
                  <span>📅</span> Schedule
                </div>
              </Select.Option>
            </Select>
          </Form.Item>

          {/* Validity + Price */}
          <div className="flex flex-row justify-between sm:flex-row gap-4 w-full">
            <Form.Item
              label={<span className="font-medium text-gray-700">Validity (Days)</span>}
              name="validity"
              rules={[{ required: true, message: "Please enter validity period" }]}
            >
              <InputNumber 
                className="w-50%" 
                min={1} 
                placeholder="30"
                size="large"
                addonAfter="days"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-medium text-gray-700">Price (₹)</span>}
              name="price"
              rules={[{ required: true, message: "Please enter price" }]}
            >
              <InputNumber 
                className="w-full" 
                min={1} 
                placeholder="299"
                size="large"
                formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </div>

          {/* Ride Limit Section */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3 mt-[10px]">
              <Form.Item name="unlimited" valuePropName="checked" className="mb-0">
                <Switch 
                  checkedChildren="Unlimited" 
                  unCheckedChildren="Limited"
                  size="small"
                />
              </Form.Item>
            </div>
            
            <div className="flex flex-row justify-between sm:flex-row gap-4 w-full">
              <Form.Item
                label={<span className="font-medium text-gray-700">Ride Limit</span>}
                name="rideLimit"
                className="mb-0"
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (getFieldValue("unlimited")) return Promise.resolve();
                      if (!value || value <= 0)
                        return Promise.reject("Please enter ride limit");
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber
                  className="w-full"
                  min={1}
                  placeholder="10"
                  size="large"
                  disabled={form.getFieldValue("unlimited")}
                  addonAfter="rides"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-medium text-gray-700 ">Status</span>}
                name="status"
                valuePropName="checked"
                className="mb-0"
              >
                <Switch 
                  checkedChildren="Active" 
                  unCheckedChildren="Inactive"
                  size="small"
                />
              </Form.Item>
            </div>
          </div>

          {/* Description */}
          <Form.Item
            label={<span className="font-medium text-gray-700">Description</span>}
            name="description"
          >
            <Input.TextArea
              rows={3}
              placeholder="Describe the benefits and features of this plan..."
              showCount
              maxLength={200}
            />
          </Form.Item>

          {/* Footer */}
          <div className="flex justify-end items-center pt-4 border-t w-full border-gray-200">
            
            <div className="flex gap-3">
              <Button
                size="large"
                onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                  setEditingPlan(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                onClick={handleOk}
                size="large"
                className="min-w-[100px]"
              >
                {editingPlan ? "Update Plan" : "Create Plan"}
              </Button>
            </div>
          </div>

        </Form>
      </Modal>
    </TitleBar>
  );
};

export default RechargePlan;
