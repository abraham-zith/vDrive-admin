import React, { useState } from "react";
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
  Row,
  Col,
} from "antd";

import {
  AppstoreOutlined,
  BarsOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;

type PlanType = "ROUND_TRIP" | "OUTSTATION" | "DAILY";

export type FilterValues = {
  planName?: string;
  status?: "Active" | "Inactive";
  sortBy?: "price" | "validity";
};

type RechargePlanType = {
  id: number;
  name: string;
  planType: PlanType;
  rideLimit: number | "UNLIMITED";
  validity: number;
  unlimited?: boolean;
  price: number;
  status: "Active" | "Inactive";
  createdDate: string;
  description?: string;
};

const RechargePlan: React.FC = () => {
  const [plans, setPlans] = useState<RechargePlanType[]>([
    {
      id: 1,
      name: "Premium Plan",
      planType: "DAILY",
      description: "Perfect for All Access",
      rideLimit: "UNLIMITED",
      validity: 28,
      price: 1999,
      status: "Active",
      createdDate: new Date().toLocaleDateString(),
    },
    {
      id: 2,
      name: "Basic Plan",
      planType: "ROUND_TRIP",
      description: "Perfect for occasional riders",
      rideLimit: 5,
      validity: 1,
      price: 399,
      status: "Inactive",
      createdDate: new Date().toLocaleDateString(),
    },
    {
      id: 3,
      name: "Mini Plan",
      planType: "OUTSTATION",
      description: "Limited access only",
      rideLimit: 1,
      validity: 1,
      price: 139,
      status: "Active",
      createdDate: new Date().toLocaleDateString(),
    },
    {
      id: 4,
      name: "Gold Plan",
      planType: "DAILY",
      description: "Good for all",
      rideLimit: "UNLIMITED",
      validity: 1,
      price: 299,
      status: "Inactive",
      createdDate: new Date().toLocaleDateString(),
    },
    {
      id: 5,
      name: "Lite Plan",
      planType: "ROUND_TRIP",
      description: "Perfect plan",
      rideLimit: 3,
      validity: 1,
      price: 699,
      status: "Inactive",
      createdDate: new Date().toLocaleDateString(),
    },
  ]);

  const [filters, setFilters] = useState<FilterValues>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<RechargePlanType | null>(null);
  const [form] = Form.useForm<RechargePlanType>();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [sortBy, setSortBy] = useState<"price" | "validity" | undefined>(
    undefined,
  );

  const MAX_ACTIVE_PLANS = 5;
  const activePlansCount = plans.filter((p) => p.status === "Active").length;
  const isActiveLimitReached = activePlansCount >= MAX_ACTIVE_PLANS;

  const showAddModal = () => {
    setEditingPlan(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (plan: RechargePlanType) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      ...plan,
      unlimited: plan.rideLimit === "UNLIMITED",
      rideLimit: plan.rideLimit === "UNLIMITED" ? undefined : plan.rideLimit,
    });
    setIsModalOpen(true);
  };

  const handleStatusToggle = (id: number, checked: boolean) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === id
          ? { ...plan, status: checked ? "Active" : "Inactive" }
          : plan,
      ),
    );
    message.success(
      `Plan ${checked ? "Activated" : "Deactivated"} successfully`,
    );
  };

  const handleDelete = () => {
    if (deleteId === null) return;
    const deletedPlan = plans.find((p) => p.id === deleteId);
    setPlans((prev) => prev.filter((p) => p.id !== deleteId));
    message.success(`Plan "${deletedPlan?.name}" has been deleted`);
    setDeleteConfirm(false);
    setDeleteId(null);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (!editingPlan && values.status && isActiveLimitReached) {
        message.warning("Only 5 active recharge plans are allowed.");
        return;
      }
      const rideLimitValue: number | "UNLIMITED" = values.unlimited
        ? "UNLIMITED"
        : Number(values.rideLimit);
      if (editingPlan) {
        setPlans((prev) =>
          prev.map((p) =>
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
              : p,
          ),
        );

        message.success("Recharge plan updated successfully");
      } else {
        const newPlan: RechargePlanType = {
          id: Date.now(),
          name: values.name,
          planType: values.planType,
          description: values.description,
          rideLimit: rideLimitValue,
          validity: Number(values.validity),
          price: Number(values.price),
          status: values.status ? "Active" : "Inactive",
          createdDate: new Date().toLocaleDateString(),
        };

        setPlans((prev) => [...prev, newPlan]);
        message.success("Recharge plan created successfully");
      }

      setIsModalOpen(false);
      setEditingPlan(null);
      form.resetFields();
    } catch {}
  };

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const finalPlans = plans
    .filter(
      (plan) =>
        (!filters.planName
          ? true
          : plan.name.toLowerCase().includes(filters.planName.toLowerCase())) &&
        (!filters.status ? true : plan.status === filters.status),
    )
    .sort((a, b) => (!sortBy ? 0 : Number(a[sortBy]) - Number(b[sortBy])));

  const columns: ColumnsType<RechargePlanType> = React.useMemo(
    () => [
      {
        title: "Plan Name",
        dataIndex: "name",
        render: (_, record) => (
          <div className="flex flex-col">
            <span className="font-medium">{record.name}</span>
            {record.description && (
              <span className="text-sm text-gray-500">
                {record.description}
              </span>
            )}
          </div>
        ),
      },

      {
        title: "Plan Type",
        dataIndex: "planType",
        render: (type: PlanType) => {
          const planTypeMap: Record<PlanType, string> = {
            ROUND_TRIP: "Round Trip",
            OUTSTATION: "Outstation",
            DAILY: "Daily",
          };
          return planTypeMap[type];
        },
      },

      {
        title: "Ride Limit",
        dataIndex: "rideLimit",
        render: (value) =>
          value === "UNLIMITED" ? "∞ rides" : `${value} rides`,
      },
      {
        title: "Validity (Days)",
        dataIndex: "validity",
        render: (value) => `${value} days`,
      },
      {
        title: "Price (₹)",
        dataIndex: "price",
        render: (price) => `₹${price}`,
      },
      {
        title: "Status",
        dataIndex: "status",
        render: (status) => (
          <span
            className={`inline-block px-2 py-[2px] text-xs font-medium rounded-md border
         ${status === "Active" ? "border-[#228B22] bg-[#228B22]/10 text-[#228B22]" : "border-[#DC143C] bg-[#DC143C]/10 text-[#DC143C]"}`}
          >
            {status}
          </span>
        ),
      },
      { title: "Created Date", dataIndex: "createdDate" },
      {
        title: "Actions",
        align: "center",
        render: (_, record) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setDeleteId(record.id);
                setDeleteConfirm(true);
              }}
            />
            <Switch
              size="small"
              checked={record.status === "Active"}
              onChange={(checked) => handleStatusToggle(record.id, checked)}
            />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <TitleBar
      title="Recharge Plan Management"
      description="Create and manage recharge plans"
      extraContent={
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white shadow-sm">
            <span className="text-sm font-medium">
              Active Plans: {activePlansCount}/{MAX_ACTIVE_PLANS}
            </span>
            <div className="w-24 h-2 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-2 bg-[#101046]"
                style={{
                  width: `${(activePlansCount / MAX_ACTIVE_PLANS) * 100}%`,
                }}
              />
            </div>
          </div>
          <Button type="primary" onClick={showAddModal}>
            + Create Plan
          </Button>
        </div>
      }
    >
      {/* Filters & Sort */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 my-2.5 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <Input
          placeholder="Search Plan"
          className="flex-1 min-w-[200px]"
          value={filters.planName || ""}
          onChange={(e) => handleFilterChange("planName", e.target.value)}
        />
        <Select
          placeholder="All Status"
          className="w-[150px]"
          value={filters.status || undefined}
          onChange={(value) => handleFilterChange("status", value)}
          allowClear
        >
          <Option value={undefined}>All Status</Option>
          <Option value="Active">Active</Option>
          <Option value="Inactive">Inactive</Option>
        </Select>
        <Select
          placeholder="Sort By"
          className="w-[150px]"
          value={sortBy}
          allowClear
          onChange={(value) => setSortBy(value as "price" | "validity")}
        >
          <Option value="validity">Validity</Option>
          <Option value="price">Price</Option>
        </Select>
        <Segmented
          options={[
            { label: "Cards", value: "cards", icon: <AppstoreOutlined /> },
            { label: "Table", value: "table", icon: <BarsOutlined /> },
          ]}
          value={viewMode}
          onChange={(value) => setViewMode(value as "table" | "cards")}
          className="ml-auto"
        />
      </div>

      {viewMode === "table" ? (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={finalPlans}
          pagination={{ pageSize: 5 }}
          size="small"
          scroll={{ x: 900 }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {finalPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg text-gray-900">
                  {plan.name}
                </h3>
                <span
                  className={`px-2 py-[2px] text-xs font-medium rounded-md border
                   ${plan.status === "Active" ? "border-[#228B22] bg-[#228B22]/10 text-[#228B22]" : "border-[#DC143C] bg-[#DC143C]/10 text-[#DC143C]"}`}
                >
                  {plan.status}
                </span>
              </div>
              <Card
                className="mt-[20px] border-0 shadow-none bg-gray-50 rounded-lg"
                bodyStyle={{ padding: "12px" }}
              >
                <div className="flex items-center text-sm text-gray-700">
                  <span className="pr-2">
                    Ride:{" "}
                    <b>
                      {plan.rideLimit === "UNLIMITED" ? "∞" : plan.rideLimit}
                    </b>
                  </span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="pr-2">
                    Validity: <b>{plan.validity} days</b>
                  </span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span>
                    Price: <b>₹{plan.price}</b>
                  </span>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        title="Delete Recharge Plan"
        open={deleteConfirm}
        okText="Delete"
        onOk={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
      >
        <p>
          Are you sure you want to delete{" "}
          <b>{plans.find((p) => p.id === deleteId)?.name}</b>?
        </p>
      </Modal>

      <Modal
        title={
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-gray-900">
              {editingPlan ? "Edit Plan" : "Create New Plan"}
            </span>
            <p className="text-sm text-gray-500">
              Fill in the details to create a new recharge plan
            </p>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingPlan(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsModalOpen(false);
              form.resetFields();
              setEditingPlan(null);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            className="bg-blue-800 text-white hover:bg-blue-900"
            onClick={handleOk}
          >
            {editingPlan ? "Update" : "Create Plan"}
          </Button>,
        ]}
        width={600}
        bodyStyle={{ padding: "24px" }}
        centered
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Plan Name"
                name="name"
                rules={[{ required: true, message: "Enter plan name" }]}
              >
                <Input placeholder="Enter plan name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Plan Type"
                name="planType"
                rules={[{ required: true, message: "Select plan type" }]}
              >
                <Select placeholder="Select plan type">
                  <Select.Option value="ROUND_TRIP">Round Trip</Select.Option>
                  <Select.Option value="OUTSTATION">Outstation</Select.Option>
                  <Select.Option value="DAILY_PASS">Daily</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Validity (Days)"
                name="validity"
                rules={[{ required: true, message: "Enter validity" }]}
              >
                <InputNumber className="w-full" min={1} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Price (₹)"
                name="price"
                rules={[{ required: true, message: "Enter price" }]}
              >
                <InputNumber className="w-full" min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <Form.Item label="Ride Limit" required>
                    <div className="flex items-center gap-3">
                      <Form.Item
                        name="rideLimit"
                        noStyle
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (getFieldValue("unlimited"))
                                return Promise.resolve();
                              if (!value || value <= 0)
                                return Promise.reject("Enter ride limit");
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <InputNumber
                          className="w-[70%]"
                          min={1}
                          placeholder="Ride limit"
                          disabled={form.getFieldValue("unlimited")}
                        />
                      </Form.Item>
                      <Form.Item
                        name="unlimited"
                        valuePropName="checked"
                        noStyle
                      >
                        <Switch
                          checkedChildren="∞"
                          unCheckedChildren="Limited"
                        />
                      </Form.Item>
                    </div>
                  </Form.Item>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Form.Item
                    label="Active Status"
                    name="status"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Active"
                      unCheckedChildren="Inactive"
                    />
                  </Form.Item>
                </div>
              </div>
            </Col>
          </Row>
          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Brief description of the plan" },
            ]}
          >
            <Input.TextArea rows={3} placeholder="Enter description" />
          </Form.Item>
        </Form>
      </Modal>
    </TitleBar>
  );
};

export default RechargePlan;
