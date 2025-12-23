import { useState } from "react";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import { Table, Button, Card, Modal, Form, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, AccountBookOutlined } from "@ant-design/icons";

export const BaseFareCalculation = () => {
  const [fareRules, setFareRules] = useState<FareRule[]>([
    {
      key: "1",
      title: "Base Fare",
      perunit: "Per Trip",
      price: "₹50",
    },
    {
      key: "2",
      title: "Waiting Fare",
      perunit: "Per Minute",
      price: "₹12",
    },
    {
      key: "3",
      title: "Driver Allowance",
      perunit: "Per Trip",
      price: "₹2",
    },
    {
      key: "4",
      title: "Return Compensation",
      perunit: "Per Hour",
      price: "₹2",
    },
    {
      key: "5",
      title: "Night Charge",
      perunit: "Per Trip",
      price: "₹20",
    },
    {
      key: "6",
      title: "GST",
      perunit: "Percentage",
      price: "18%",
    },
    {
      key: "7",
      title: "Platform Fee",
      perunit: "Per Trip",
      price: "₹20",
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<FareRule | null>(null);
  const [form] = Form.useForm();

  interface FareRule {
    key: string;
    title: string;
    perunit: string;
    price: string;
  }

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      setFareRules((prev) =>
        prev.map((rule) =>
          rule.key === editingRule?.key ? { ...rule, ...values } : rule
        )
      );

      setIsModalOpen(false);
      setEditingRule(null);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setEditingRule(null);
    form.resetFields();
  };

  const handleEdit = (record: FareRule) => {
    setEditingRule(record);
    form.setFieldsValue({
      title: record.title,
      perunit: record.perunit,
      price: record.price,
    });
    setIsModalOpen(true);
  };

  const columns: ColumnsType<FareRule> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Per Unit",
      dataIndex: "perunit",
      key: "perunit",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        ></Button>
      ),
    },
  ];

  //   const data: FareRule[] = [
  //     {
  //       key: "1",
  //       title: "Base Fare",
  //       perunit: "Per Trip",
  //       price: "₹50",
  //     },
  //     {
  //       key: "2",
  //       title: "Waiting Fare",
  //       perunit: "Per Minute",
  //       price: "₹12",
  //     },
  //     {
  //       key: "3",
  //       title: "Driver Allowance",
  //       perunit: "Per Trip",
  //       price: "₹2",
  //     },
  //     {
  //       key: "4",
  //       title: "Return Compensation",
  //       perunit: "Per Hour",
  //       price: "₹2",
  //     },
  //     {
  //       key: "5",
  //       title: "Night Charge",
  //       perunit: "Per Trip",
  //       price: "₹20",
  //     },
  //     {
  //       key: "6",
  //       title: "GST",
  //       perunit: "Percentage",
  //       price: "18%",
  //     },
  //     {
  //       key: "7",
  //       title: "Platform Fee",
  //       perunit: "Per Trip",
  //       price: "₹20",
  //     },
  //   ];

  return (
    <div className="w-full">
      <TitleBar
        title="Fare Configuration"
        description="Where your trip’s pricing begins."
      />

      <div className="flex w-full gap-4 mt-4">
        <div className="w-[70%]">
          <Table
            columns={columns}
            dataSource={fareRules}
            pagination={false}
            bordered
            size="middle"
            rowClassName={(_, index) =>
              index % 2 === 0 ? "fare-row-even" : "fare-row-odd"
            }
          />
        </div>

        <div className="w-[30%]">
          <Card
            title={
              <span className="flex items-center gap-2 text-black font-semibold text-base">
                <AccountBookOutlined
                  style={{ color: "#7c3aed", marginRight: 6 }}
                />
                Fare Breakdown
              </span>
            }
            className="rounded-xl shadow-sm bg-white border border-violet-200"
            bodyStyle={{ padding: 16 }}
          >
            <div className="divide-y divide-violet-100">
              {fareRules.map((rule) => (
                <div
                  key={rule.key}
                  className="flex items-center justify-between py-3 px-2 rounded-md transition hover:bg-violet-50"
                >
                  {/* Left */}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {rule.title}
                    </p>
                    <p className="text-xs text-gray-500">{rule.perunit}</p>
                  </div>

                  {/* Right */}
                  <div className="text-sm font-semibold text-violet-700">
                    {rule.price}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal */}
      <Modal
        title={`Edit ${editingRule?.title}`}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Title" name="title">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Per Unit"
            name="perunit"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Price" name="price" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
