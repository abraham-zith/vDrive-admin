import { useState } from "react";
import {
  Button,
  Card,
  List,
  Typography,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Spin,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { LuZap } from "react-icons/lu";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  addHotspot,
  updateHotspot,
  deleteHotspot,
  type Hotspot,
} from "../../store/slices/hotspotSlice";

const HotspotTypes = () => {
  const dispatch = useAppDispatch();
  const { hotspots, loading } = useAppSelector((state) => state.hotspot);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<Hotspot | null>(null);
  const [form] = Form.useForm();

  // Load hotspot types on component mount
  // Fetching moved to parent page (DriverPricing)

  const handleAdd = () => {
    setEditingType(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (type: Hotspot) => {
    setEditingType(type);
    form.setFieldsValue({
      hotspot_name: type.hotspot_name,
      fare: type.fare,
      multiplier: type.multiplier,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteHotspot(id)).unwrap();
      message.success("Hotspot type deleted successfully");
    } catch {
      message.error("Failed to delete hotspot type");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingType) {
        // Update existing
        await dispatch(
          updateHotspot({ id: editingType.id, data: values })
        ).unwrap();
        message.success("Hotspot type updated successfully");
      } else {
        // Create new
        await dispatch(
          addHotspot({ ...values, id: crypto.randomUUID() })
        ).unwrap(); // Generating ID purely for optimistic UI if needed, or if backend requires it as per previous analysis
        message.success("Hotspot type created successfully");
      }

      setModalVisible(false);
    } catch {
      message.error("Failed to save hotspot type");
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  if (loading && hotspots.length === 0) {
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
          dataSource={hotspots}
          renderItem={(item) => (
            <List.Item>
              <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-white rounded-md border">
                <div className="flex items-center gap-3 flex-1">
                  <LuZap className="text-lg text-yellow-500" />
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="font-semibold">{item.hotspot_name}</span>
                    </div>
                    <span className="text-xs text-gray-600">
                      +₹{item.fare} fare • {item.multiplier}x multiplier
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 items-center justify-end sm:justify-start">
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
              fare: 0,
              multiplier: 1,
            }}
          >
            <Form.Item
              name="hotspot_name"
              label="Hotspot Type Name"
              rules={[
                { required: true, message: "Please enter hotspot type name" },
              ]}
            >
              <Input placeholder="e.g., Rush Zone" />
            </Form.Item>

            <Form.Item
              name="fare"
              label="Fare (₹)"
              rules={[{ required: true, message: "Please enter fare amount" }]}
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
          </Form>
        </Modal>
      </div>
    </Card>
  );
};

export default HotspotTypes;
