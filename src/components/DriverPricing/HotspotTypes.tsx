import { useState, useEffect } from "react";
import {
  Button,
  Card,
  List,
  Typography,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  message,
  Spin,
  Popconfirm,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { LuZap } from "react-icons/lu";
import {
  mockHotspotApi,
  type HotspotType,
} from "../../utilities/mockHotspotApi";

const HotspotTypes = () => {
  const [hotspotTypes, setHotspotTypes] = useState<HotspotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<HotspotType | null>(null);
  const [form] = Form.useForm();

  // Load hotspot types on component mount
  useEffect(() => {
    loadHotspotTypes();
  }, []);

  const loadHotspotTypes = async () => {
    try {
      setLoading(true);
      const types = await mockHotspotApi.getHotspotTypes();
      setHotspotTypes(types);
    } catch (error) {
      message.error("Failed to load hotspot types");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingType(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (type: HotspotType) => {
    setEditingType(type);
    form.setFieldsValue({
      name: type.name,
      addition: type.addition,
      multiplier: type.multiplier,
      isActive: type.isActive,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const success = await mockHotspotApi.deleteHotspotType(id);
      if (success) {
        message.success("Hotspot type deleted successfully");
        loadHotspotTypes();
      } else {
        message.error("Failed to delete hotspot type");
      }
    } catch (error) {
      message.error("Failed to delete hotspot type");
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const updatedType = await mockHotspotApi.toggleHotspotType(id);
      if (updatedType) {
        message.success(
          `Hotspot type ${updatedType.isActive ? "activated" : "deactivated"}`,
        );
        loadHotspotTypes();
      }
    } catch (error) {
      message.error("Failed to toggle hotspot type status");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingType) {
        // Update existing
        const updatedType = await mockHotspotApi.updateHotspotType(
          editingType.id,
          values,
        );
        if (updatedType) {
          message.success("Hotspot type updated successfully");
        }
      } else {
        // Create new
        const newType = await mockHotspotApi.createHotspotType(values);
        if (newType) {
          message.success("Hotspot type created successfully");
        }
      }

      setModalVisible(false);
      loadHotspotTypes();
    } catch (error) {
      message.error("Failed to save hotspot type");
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  if (loading) {
    return (
      <Card size="small">
        <div className="flex justify-center items-center h-32">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          <span className="ml-2">Loading hotspot types...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card size="small">
      <div className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-between w-full">
          <div className="w-full flex items-center gap-2">
            <LuZap className="text-[20px] text-[#0080FF]" />
            <span className="text-[19px] font-semibold p-0 m-0">
              Hotspot Types Management
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <Typography.Title level={5} className="text-lg sm:text-xl">
            Manage Hotspot Types
          </Typography.Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className="w-full sm:w-auto"
          >
            Add Hotspot Type
          </Button>
        </div>

        <List
          itemLayout="horizontal"
          dataSource={hotspotTypes}
          renderItem={(item) => (
            <List.Item>
              <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-white rounded-md border">
                <div className="flex items-center gap-3 flex-1">
                  <LuZap
                    className={`text-lg ${
                      item.isActive ? "text-yellow-500" : "text-gray-400"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="font-semibold">{item.name}</span>
                      <Tag
                        color={item.isActive ? "green" : "red"}
                        className="w-fit"
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </Tag>
                    </div>
                    <span className="text-xs text-gray-600">
                      +₹{item.addition} addition • {item.multiplier}x multiplier
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 items-center justify-end sm:justify-start">
                  <Switch
                    checked={item.isActive}
                    onChange={() => handleToggleActive(item.id)}
                    size="small"
                  />
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(item)}
                    size="small"
                  />
                  <Popconfirm
                    title="Delete hotspot type"
                    description="Are you sure you want to delete this hotspot type?"
                    onConfirm={() => handleDelete(item.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button icon={<DeleteOutlined />} danger size="small" />
                  </Popconfirm>
                </div>
              </div>
            </List.Item>
          )}
        />

        <Modal
          title={editingType ? "Edit Hotspot Type" : "Add Hotspot Type"}
          open={modalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText={editingType ? "Update" : "Create"}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              isActive: true,
              addition: 0,
              multiplier: 1,
            }}
          >
            <Form.Item
              name="name"
              label="Hotspot Type Name"
              rules={[
                { required: true, message: "Please enter hotspot type name" },
              ]}
            >
              <Input placeholder="e.g., Rush Zone" />
            </Form.Item>

            <Form.Item
              name="addition"
              label="Addition Amount (₹)"
              rules={[
                { required: true, message: "Please enter addition amount" },
              ]}
            >
              <InputNumber
                min={0}
                placeholder="40"
                style={{ width: "100%" }}
                addonBefore="₹"
              />
            </Form.Item>

            <Form.Item
              name="multiplier"
              label="Multiplier"
              rules={[{ required: true, message: "Please enter multiplier" }]}
            >
              <InputNumber
                min={0.1}
                step={0.1}
                placeholder="1.0"
                style={{ width: "100%" }}
                addonAfter="x"
              />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Active Status"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Card>
  );
};

export default HotspotTypes;
