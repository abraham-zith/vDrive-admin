import React, { useState } from "react";
import { Table, Button, Form, Input, Select, InputNumber, Drawer, Segmented, Modal, message, Switch, Card } from "antd";
import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

import TitleBar from "../components/TitleBarCommon/TitleBar";
// import type { Config } from "tailwindcss";

const { Option } = Select;


export type FilterValues = {
  planName?: string;
  status?: "Active" | "Inactive";
  sortBy?: "price" | "validity";
};

type RechargePlanType = {
  id: number;
  name: string;
  rideLimit: number | "UNLIMITED";
  validity: number;
  unlimited?: boolean;
  price: number;
  status: "Active" | "Inactive";
  createdDate: string;
  description?: string;
};
//comment
const RechargePlan: React.FC = () => {
  const [plans, setPlans] = useState<RechargePlanType[]>([
    {
      id: 1,
      name: "Premium Plan",
      description: "Perfect for All Access",
      rideLimit: 100,
      validity: 28,
      price: 1999,
      status: "Active",
      createdDate: new Date().toLocaleDateString(),
    },
    {
      id: 2,
      name: "basic Plan",
      description: "Perfect for occasional riders",
      rideLimit: 200,
      validity: 56,
      price: 399,
      status: "Inactive",
      createdDate: new Date().toLocaleDateString(),
    },
    {
      id: 3,
      name: "Mini Plan",
      description: "Limited acess only",
      rideLimit: 200,
      validity: 86,
      price: 139,
      status: "Active",
      createdDate: new Date().toLocaleDateString(),
    },
    {
      id: 4,
      name: "gold Plan",
      description: "good for all",
      rideLimit: 200,
      validity: 96,
      price: 299,
      status: "Inactive",
      createdDate: new Date().toLocaleDateString(),
    },
    {
      id: 5,
      name: "Lite Plan",
      description: "Perfect plan",
      rideLimit: 200,
      validity: 96,
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
  const [sortBy, setSortBy] = useState<"price" | "validity" | undefined>(undefined);





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
    setPlans(prev =>
      prev.map(plan =>
        plan.id === id
          ? {
            ...plan,
            status: checked ? "Active" : "Inactive",
          }
          : plan
      )
    );

    message.success(
      `Plan ${checked ? "Activated" : "Deactivated"} successfully`
    );
  };



  const MAX_ACTIVE_PLANS = 5;

  const activePlansCount = plans.filter(p => p.status === "Active").length;
  const isActiveLimitReached = activePlansCount >= MAX_ACTIVE_PLANS;



  // const handleCreateOrActivatePlan = (newStatus: "Active" | "Inactive") => {
  //   if (newStatus === "Active" && isActiveLimitReached) {
  //     message.warning(
  //       "Only 5 active recharge plans are allowed. Please deactivate an existing plan."
  //     );
  //     return;
  //   }
  // };




  const handleDelete = () => {
    if (deleteId === null) return;

    const deletedPlan = plans.find((p) => p.id === deleteId);

    setPlans((prev) => prev.filter((p) => p.id !== deleteId));

    message.success(
      `Plan "${deletedPlan?.name}" has been deleted`
    );

    setDeleteConfirm(false);
    setDeleteId(null);
  };





  const handleOk = async () => {
    const values = await form.validateFields();
    if (!editingPlan && values.status && isActiveLimitReached) {
      message.warning(
        "Only 5 active recharge plans are allowed."
      );
      return;
    }

    const rideLimitValue: number | "UNLIMITED" = values.unlimited
      ? "UNLIMITED"
      : Number(values.rideLimit);

    if (editingPlan) {
      setPlans(prev =>
        prev.map(p =>
          p.id === editingPlan.id
            ? {
              ...p,
              ...values,
              rideLimit: rideLimitValue,
              status: values.status ? "Active" : "Inactive",
            }
            : p
        )
      );
    } else {
      const newPlan: RechargePlanType = {
        id: Date.now(),
        name: values.name,
        rideLimit: rideLimitValue,
        validity: Number(values.validity),
        price: Number(values.price),
        status: values.status ? "Active" : "Inactive",
        description: values.description,
        createdDate: new Date().toLocaleDateString(),
      };

      setPlans(prev => [...prev, newPlan]);
    }

    setIsModalOpen(false);
    form.resetFields();
  };





  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const filteredPlans = plans.filter((plan) => {
    const nameMatch = filters.planName ? plan.name.toLowerCase().includes(filters.planName.toLowerCase())
      : true;
    const statusMatch = filters.status ? plan.status === filters.status : true;

    return nameMatch && statusMatch;
  })
    .sort((a, b) => {
      if (filters.sortBy === "validity") return a.validity - b.validity;
      if (filters.sortBy === "price") return a.price - b.price;
      return 0;
    });

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    if (!sortBy) return 0; // no sorting
    return Number(a[sortBy]) - Number(b[sortBy]); // always ascending
  });




  const columns = [
    {
      title: "Plan Name",
      dataIndex: "name",
      render: (_: any, record: RechargePlanType) => (
        <div className="flex flex-col">
          <span className="font-medium">{record.name}</span>
          {record.description && (
            <span className="text-sm text-gray-500">{record.description}</span>
          )}
        </div>
      ),
    },
    {
      title: "Ride Limit",
      dataIndex: "rideLimit",
      render: (value: number | "UNLIMITED") =>
        value === "UNLIMITED" ? "∞ rides" : `${value} rides`,
    },


    { title: "Validity (Days)", dataIndex: "validity", render: (value: number) => `${value} days`, },
    { title: "Price (₹)", dataIndex: "price", render: (price: number) => `₹${price}`, },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: "Active" | "Inactive") => (
        <span
          className={`inline-block px-2 py-[2px] text-xs font-medium rounded-md border
        ${status === "Active"
              ? "border-[#228B22] bg-[#228B22]/10 text-[#228B22]"
              : "border-[#DC143C] bg-[#DC143C]/10 text-[#DC143C]"
            }
      `}
        >
          {status}
        </span>
      ),
    },

    { title: "Created Date", dataIndex: "createdDate" },
    {
      title: "Actions",
      render: (_: any, record: RechargePlanType) => (
        <div className="flex gap-2">


          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          />
          <Button
            type="link"
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              setDeleteId(record.id);
              setDeleteConfirm(true);
            }}
          />

          <Switch
            size="small"
            checked={record.status === "Active"}
            disabled={record.status !== "Active" && isActiveLimitReached}
            onChange={(checked) => {
              if (checked && isActiveLimitReached) {
                message.warning(
                  "Only 5 active recharge plans are allowed."
                );
                return;
              }
              handleStatusToggle(record.id, checked);
            }}
          />





        </div>
      ),
    },
  ];


  const onFinish = (values: any) => {
    console.log("Form Values:", values);
  };

  return (
    <TitleBar
      title="Recharge Plan Management"
      description="Create and manage recharge plans"
      extraContent={
        <div className="flex gap-2">


          <button className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm w-64">
            <span className="font-medium text-gray-700">
              Active Plans: {activePlansCount}/{MAX_ACTIVE_PLANS}
            </span>

            <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-2 bg-[#101046] rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    (activePlansCount / MAX_ACTIVE_PLANS) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </button>



          <Button type="primary" onClick={showAddModal}
          >
            + Create Plan
          </Button>
        </div>
      }


    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 my-2.5 flex gap-3">

        <Input
          placeholder="Search Plan"
          className="w-[50%]"
          value={filters.planName || ""}
          onChange={(e) => handleFilterChange("planName", e.target.value)}
        />

        <Select
          placeholder="All Status"
          className="w-[15%]"
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
          className="w-[15%]"
          value={sortBy}
          allowClear
          onChange={(value) => setSortBy(value as "price" | "validity")}
        >
          <Option value="validity">Sort By Validity</Option>
          <Option value="price">Sort By Price</Option>
        </Select>


        <Segmented
          options={[
            { label: 'Cards', value: 'cards', icon: <AppstoreOutlined /> },
            { label: 'Table', value: 'table', icon: <BarsOutlined /> }
          ]}
          value={viewMode}
          onChange={(value) => setViewMode(value as "table" | "cards")}
        />

      </div>


      {viewMode === "table" ? (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={sortedPlans}
          pagination={{ pageSize: 5 }}
          size="small"
        />) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {sortedPlans.map(plan => (
            <div
              key={plan.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col"

            //            key={plan.id}
            // className="
            //   bg-white
            //   rounded-xl
            //   shadow-md
            //   hover:shadow-lg
            //   transition-shadow
            //   p-4
            //   flex
            //   flex-col
            //   border-t-[10px]
            //   border-t-blue-500
            // "
            >

              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg text-gray-900">
                  {plan.name}
                </h3>

                <span
                  className={`px-2 py-[2px] text-xs font-medium rounded-md border
            ${plan.status === "Active"
                      ? "border-[#228B22] bg-[#228B22]/10 text-[#228B22]"
                      : "border-[#DC143C] bg-[#DC143C]/10 text-[#DC143C]"
                    }`}
                >
                  {plan.status}
                </span>
              </div>

              <Card
                className="
          mt-[20px]
          border-0
          shadow-none
          bg-gray-50
          rounded-lg
        "
                bodyStyle={{ padding: "12px" }}
              >
                <div className="flex items-center text-sm text-gray-700">
                  <span className="pr-2">
                    Ride: <b>{plan.rideLimit === "UNLIMITED" ? "∞" : plan.rideLimit}</b>
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
      )
      }



      <Modal
        title="Delete Recharge Plan"
        open={deleteConfirm}
        okText="Delete"
        onOk={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
      >
        <p>
          Are you sure you want to delete
          <b> {plans.find(p => p.id === deleteId)?.name}</b>?
        </p>
      </Modal>


      <Drawer
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
        onClose={() => setIsModalOpen(false)}
        footer={
          <div className="flex justify-between">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              className="bg-blue-800 text-white hover:bg-blue-900"
              onClick={handleOk}
            >
              {editingPlan ? "Update" : "Create Plan"}
            </Button>
          </div>
        }
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
        >
          <Form.Item
            label="Plan Name"
            name="name"
            rules={[{ required: true, message: "Enter plan name" }]}
          >
            <Input />
          </Form.Item>


          <Form.Item label="Ride Limit" required>
            <div className="flex items-center gap-3">

              <Form.Item
                name="rideLimit"
                noStyle
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (getFieldValue("unlimited")) {
                        return Promise.resolve();
                      }
                      if (!value || value <= 0) {
                        return Promise.reject("Enter ride limit");
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber
                  className="w-full"
                  min={1}
                  placeholder="Ride limit"
                  disabled={form.getFieldValue("unlimited")} // disable if unlimited
                />
              </Form.Item>

              {/* Unlimited Switch */}
              <Form.Item
                name="unlimited"
                valuePropName="checked"
                initialValue={false}
                noStyle
              >
                <Switch checkedChildren="∞" unCheckedChildren="Limited" />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item
            label="Validity (Days)"
            name="validity"
            rules={[{ required: true, message: "Enter validity" }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item
            label="Price (₹)"
            name="price"
            rules={[{ required: true, message: "Enter price" }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>


          <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
            <div>
              <p className="font-medium text-gray-800">Active Status</p>
              <p className="text-sm text-gray-500">
                Enable to make this plan available
              </p>
            </div>


            <Form.Item
              name="status"
              valuePropName="checked"
              noStyle
            >
              <Switch
                checkedChildren="Active"
                unCheckedChildren="Inactive"
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Brief Description of the plan...." }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Drawer>
    </TitleBar>
  );
};

export default RechargePlan;
