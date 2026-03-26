import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  notification,
  Segmented,
  Modal,
  Descriptions,
  Tag,
  Row,
  Col,
  Tooltip,
  Badge,
  Divider,
} from "antd";
import {
  PlusOutlined,
  LeftOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import TaxTable from "../components/TaxTable/TaxTable";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchTaxes,
  addTax,
  updateTax,
  updateTaxStatus,
  deleteTax,
} from "../store/slices/taxSlice";
import type { Tax, TaxType, TaxPayload } from "../store/slices/taxSlice";

const { TextArea } = Input;

// ── Constants ─────────────────────────────────────────────────────────────────

// Dropdown list — frontend display only, not stored in DB
const INDIAN_TAXES = [
  { label: "Goods and Services Tax (GST)", value: "GST" },
  { label: "Central GST (CGST)", value: "CGST" },
  { label: "State GST (SGST)", value: "SGST" },
  { label: "Integrated GST (IGST)", value: "IGST" },
  { label: "Union Territory GST (UTGST)", value: "UTGST" },
  { label: "Tax Deducted at Source (TDS)", value: "TDS" },
  { label: "Tax Collected at Source (TCS)", value: "TCS" },
  { label: "Value Added Tax (VAT)", value: "VAT" },
  { label: "Professional Tax (PT)", value: "PT" },
  { label: "Surcharge", value: "SURCHARGE" },
];

// Auto-derive taxType from the dropdown selection
const TAX_TYPE_MAP: Record<string, TaxType> = {
  GST: "COMPOSITE",
  CGST: "CENTRAL",
  IGST: "CENTRAL",
  TDS: "CENTRAL",
  TCS: "CENTRAL",
  SURCHARGE: "CENTRAL",
  SGST: "STATE",
  VAT: "STATE",
  PT: "STATE",
  UTGST: "UNION_TERRITORY",
};

const TAX_TYPE_OPTIONS: { label: string; value: TaxType }[] = [
  { label: "Central", value: "CENTRAL" },
  { label: "State", value: "STATE" },
  { label: "Union Territory", value: "UNION_TERRITORY" },
  { label: "Composite", value: "COMPOSITE" },
];

const TAX_TYPE_COLORS: Record<string, string> = {
  CENTRAL: "gold",
  STATE: "green",
  UNION_TERRITORY: "purple",
  COMPOSITE: "blue",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

// "CGST" + 9   → "CGST_9"
// "TDS"  + 2.5 → "TDS_2_5"
function generateTaxCode(selectedTax: string, percentage: number | undefined): string {
  if (!selectedTax || percentage == null || percentage <= 0) return "";
  return `${selectedTax}_${String(percentage).replace(".", "_")}`;
}

// "CGST" + 9 → "CGST – 9%"
function generateTaxName(selectedTax: string, percentage: number | undefined): string {
  if (!selectedTax || percentage == null || percentage <= 0) return "";
  return `${selectedTax} – ${percentage}%`;
}

// Form values match TaxPayload exactly — indianTax is now included in payload
type TaxFormValues = TaxPayload;

// ── Component ─────────────────────────────────────────────────────────────────

type Segment = "List" | "Add" | "Edit";

const TaxPage: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<Segment>("List");
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [viewingTax, setViewingTax] = useState<Tax | null>(null);
  const [form] = Form.useForm<TaxFormValues>();

  // Watch the two user-editable fields that drive auto-generation
  const watchedIndianTax: string = Form.useWatch("indian_tax", form);
  const watchedPercentage: number = Form.useWatch("percentage", form);

  const dispatch = useAppDispatch();
  const { taxes, isLoading, error } = useAppSelector((state) => state.tax);

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    dispatch(fetchTaxes());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      notification.error({ message: "Error", description: error });
    }
  }, [error]);

  // Auto-generate taxCode, taxName, taxType whenever dropdown or percentage changes
  useEffect(() => {
    if (watchedIndianTax) {
      const autoType = TAX_TYPE_MAP[watchedIndianTax];
      if (autoType) form.setFieldValue("tax_type", autoType);
    }
    if (watchedIndianTax && watchedPercentage != null) {
      form.setFieldValue("tax_code", generateTaxCode(watchedIndianTax, watchedPercentage));
      form.setFieldValue("tax_name", generateTaxName(watchedIndianTax, watchedPercentage));
    }
  }, [watchedIndianTax, watchedPercentage, form]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAddClick = () => {
    setEditingTax(null);
    form.resetFields();
    form.setFieldsValue({ is_active: true, is_default: false });
    setActiveSegment("Add");
  };

  const handleEdit = (tax: Tax) => {
    setEditingTax(tax);
    form.setFieldsValue({
      indian_tax: tax.indian_tax,
      tax_name: tax.tax_name,
      tax_code: tax.tax_code,
      tax_type: tax.tax_type,
      percentage: tax.percentage,
      description: tax.description,
      is_active: tax.is_active,
      is_default: tax.is_default,
    });
    setActiveSegment("Edit");
  };

  const handleView = (tax: Tax) => setViewingTax(tax);

  const handleDelete = (id: string) => {
    dispatch(deleteTax(id)).then((res: any) => {
      if (!res.hasOwnProperty("error")) {
        notification.success({ message: "Tax deleted successfully" });
      }
    });
  };

  const handleToggleStatus = (id: string, is_active: boolean) => {
    dispatch(updateTaxStatus({ id, is_active }));
  };

  const handleBack = () => {
    setActiveSegment("List");
    setEditingTax(null);
    form.resetFields();
  };

  const onFinish = (values: TaxFormValues) => {
    if (editingTax) {
      dispatch(updateTax({ id: editingTax.id, taxData: values })).then((res: any) => {
        if (!res.hasOwnProperty("error")) {
          notification.success({ message: "Tax updated successfully" });
          handleBack();
        }
      });
    } else {
      dispatch(addTax(values)).then((res: any) => {
        if (!res.hasOwnProperty("error")) {
          notification.success({ message: "Tax added successfully" });
          handleBack();
        }
      });
    }
  };

  // ── Derived preview ────────────────────────────────────────────────────────

  const previewCode = generateTaxCode(watchedIndianTax, watchedPercentage);
  const previewName = generateTaxName(watchedIndianTax, watchedPercentage);
  const previewType = watchedIndianTax ? TAX_TYPE_MAP[watchedIndianTax] : null;
  const showPreview = !!previewCode;

  // ── Form ──────────────────────────────────────────────────────────────────

  const renderForm = () => (
    <Card
      title={
        <Space>
          <Button type="text" icon={<LeftOutlined />} onClick={handleBack} />
          <span style={{ fontWeight: 700, fontSize: 16 }}>
            {editingTax ? "Edit Tax" : "Add New Tax"}
          </span>
          <Tag color="blue" style={{ marginLeft: 4 }}>
            {editingTax ? "Editing" : "New"}
          </Tag>
        </Space>
      }
      style={{ borderRadius: 12 }}
      styles={{ body: { padding: "24px 28px" } }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ isActive: true, isDefault: false }}
        style={{ maxWidth: 900 }}
      >
        <Row gutter={[16, 0]}>

          {/* ── Step 1 ── */}
          <Col span={24}>
            <Divider orientation={"left" as any} orientationMargin="0">
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                Step 1 — Select Tax &amp; Enter Percentage
              </span>
            </Divider>
          </Col>

          {/* Frontend-only dropdown — drives auto-generation */}
          <Col xs={24} md={12}>
            <Form.Item
              name="indian_tax"
              label="Indian Tax Type"
              rules={[{ required: true, message: "Please select a tax type" }]}
              tooltip="Tax Code, Tax Name and Tax Type will be auto-generated from this selection."
            >
              <Select
                placeholder="Select an Indian tax..."
                options={INDIAN_TAXES}
                showSearch
                size="large"
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="percentage"
              label="Tax Percentage (%)"
              rules={[
                { required: true, message: "Please enter a percentage" },
                { type: "number", min: 0.01, max: 100, message: "Must be between 0.01 and 100" },
              ]}
            >
              <InputNumber
                min={0.01}
                max={100}
                step={0.5}
                precision={2}
                formatter={(value) => `${value}%`}
                parser={(value) => Number(value!.replace("%", "")) as any}
                style={{ width: "100%" }}
                size="large"
                placeholder="e.g. 18"
              />
            </Form.Item>
          </Col>

          {/* ── Preview Banner ── */}
          {showPreview && (
            <Col span={24}>
              <div
                style={{
                  background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)",
                  border: "1px solid #bfdbfe",
                  borderRadius: 10,
                  padding: "14px 20px",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <Space size={4}>
                  <ThunderboltOutlined style={{ color: "#6366f1" }} />
                  <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Auto-Generated
                  </span>
                </Space>
                <Divider type="vertical" />
                <Space wrap size={8}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>Name:</span>
                  <Tag color="geekblue" style={{ fontWeight: 700, fontSize: 13 }}>{previewName}</Tag>
                  <span style={{ fontSize: 12, color: "#64748b" }}>Code:</span>
                  <Tag color="purple" style={{ fontWeight: 700, fontFamily: "monospace", fontSize: 13 }}>{previewCode}</Tag>
                  {previewType && (
                    <>
                      <span style={{ fontSize: 12, color: "#64748b" }}>Type:</span>
                      <Tag color={TAX_TYPE_COLORS[previewType]} style={{ fontWeight: 600 }}>
                        {previewType.replace(/_/g, " ")}
                      </Tag>
                    </>
                  )}
                </Space>
              </div>
            </Col>
          )}

          {/* ── Step 2 ── */}
          <Col span={24}>
            <Divider orientation={"left" as any} orientationMargin="0">
              <Space size={6}>
                <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                  Step 2 — Auto-Filled Details
                </span>
                <Tooltip title="Generated from your selections. Read-only.">
                  <InfoCircleOutlined style={{ color: "#94a3b8", cursor: "pointer" }} />
                </Tooltip>
              </Space>
            </Divider>
          </Col>

          {/* taxName — maps to DB tax_name */}
          <Col xs={24} md={8}>
            <Form.Item
              name="tax_name"
              label={
                <Space size={4}>
                  Tax Name
                  <Badge count="Auto" style={{ backgroundColor: "#6366f1", fontSize: 10, height: 16, lineHeight: "16px", minWidth: 32 }} />
                </Space>
              }
              rules={[{ required: true }]}
            >
              <Input
                readOnly
                size="large"
                placeholder="Auto-generated"
                style={{ background: "#f8fafc", cursor: "not-allowed", color: "#475569", fontWeight: 600 }}
                suffix={showPreview ? <ThunderboltOutlined style={{ color: "#6366f1" }} /> : null}
              />
            </Form.Item>
          </Col>

          {/* taxCode — maps to DB tax_code */}
          <Col xs={24} md={8}>
            <Form.Item
              name="tax_code"
              label={
                <Space size={4}>
                  Tax Code
                  <Badge count="Auto" style={{ backgroundColor: "#6366f1", fontSize: 10, height: 16, lineHeight: "16px", minWidth: 32 }} />
                </Space>
              }
              rules={[{ required: true }]}
            >
              <Input
                readOnly
                size="large"
                placeholder="Auto-generated"
                style={{ background: "#f8fafc", cursor: "not-allowed", color: "#475569", fontWeight: 700, fontFamily: "monospace" }}
                suffix={showPreview ? <ThunderboltOutlined style={{ color: "#6366f1" }} /> : null}
              />
            </Form.Item>
          </Col>

          {/* taxType — maps to DB tax_type */}
          <Col xs={24} md={8}>
            <Form.Item
              name="tax_type"
              label={
                <Space size={4}>
                  Tax Type
                  <Badge count="Auto" style={{ backgroundColor: "#6366f1", fontSize: 10, height: 16, lineHeight: "16px", minWidth: 32 }} />
                </Space>
              }
              rules={[{ required: true }]}
            >
              <Select
                options={TAX_TYPE_OPTIONS}
                size="large"
                placeholder="Auto-derived"
                disabled
              />
            </Form.Item>
          </Col>

          {/* ── Step 3 ── */}
          <Col span={24}>
            <Divider orientation={"left" as any} orientationMargin="0">
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                Step 3 — Settings
              </span>
            </Divider>
          </Col>

          {/* description — maps to DB description */}
          <Col xs={24} md={12}>
            <Form.Item name="description" label="Description">
              <TextArea rows={3} placeholder="Optional notes about this tax..." size="large" />
            </Form.Item>
          </Col>

          {/* isActive — maps to DB is_active */}
          <Col xs={24} md={6}>
            <Form.Item name="is_active" label="Active Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked />
            </Form.Item>
          </Col>

          {/* isDefault — maps to DB is_default */}
          <Col xs={24} md={6}>
            <Form.Item name="is_default" label="Default Tax" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>

        </Row>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            paddingTop: 20,
            borderTop: "1px solid #e2e8f0",
            marginTop: 8,
          }}
        >
          <Button size="large" onClick={handleBack}>Cancel</Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={isLoading}
            disabled={!showPreview}
          >
            {editingTax ? "Update Tax" : "Add Tax"}
          </Button>
        </div>
      </Form>
    </Card>
  );

  // ── View Modal ─────────────────────────────────────────────────────────────

  const renderViewModal = () => (
    <Modal
      title={
        <Space>
          <span style={{ fontWeight: 700 }}>Tax Details</span>
          {viewingTax && (
            <Tag color={viewingTax.is_active ? "success" : "error"}>
              {viewingTax.is_active ? "Active" : "Inactive"}
            </Tag>
          )}
        </Space>
      }
      open={!!viewingTax}
      onCancel={() => setViewingTax(null)}
      footer={[
        <Button
          key="edit"
          type="primary"
          onClick={() => { setViewingTax(null); if (viewingTax) handleEdit(viewingTax); }}
        >
          Edit
        </Button>,
        <Button key="close" onClick={() => setViewingTax(null)}>Close</Button>,
      ]}
      width={580}
    >
      {viewingTax && (
        <Descriptions
          bordered
          column={1}
          size="small"
          style={{ marginTop: 12 }}
          labelStyle={{ fontWeight: 600, width: 150, background: "#f8fafc" }}
        >
          <Descriptions.Item label="Indian Tax">
            <strong>{viewingTax.indian_tax}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Tax Name">
            <strong>{viewingTax.tax_name}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Tax Code">
            <code style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
              {viewingTax.tax_code}
            </code>
          </Descriptions.Item>
          <Descriptions.Item label="Tax Type">
            <Tag color={TAX_TYPE_COLORS[viewingTax.tax_type] || "default"} style={{ fontWeight: 600 }}>
              {viewingTax.tax_type?.replace(/_/g, " ")}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Percentage">
            <Tag color="geekblue" style={{ fontWeight: 700, fontSize: 14 }}>
              {viewingTax.percentage}%
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={viewingTax.is_active ? "success" : "error"}>
              {viewingTax.is_active ? "Active" : "Inactive"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Default">
            {viewingTax.is_default
              ? <Tag color="warning">Yes — Default Tax</Tag>
              : <span style={{ color: "#94a3b8" }}>No</span>}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {viewingTax.description || <span style={{ color: "#94a3b8" }}>—</span>}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(viewingTax.created_at).toLocaleString("en-IN")}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {new Date(viewingTax.updated_at).toLocaleString("en-IN")}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );

  // ── Main Render ────────────────────────────────────────────────────────────

  return (
    <TitleBar
      title="Tax Management"
      description="Manage taxes and percentages for your ride-hailing platform"
      extraContent={
        activeSegment === "List" ? (
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleAddClick}>
            Add New Tax
          </Button>
        ) : null
      }
    >
      <div className="w-full h-full flex flex-col gap-4 p-4 overflow-y-auto">

        {activeSegment === "List" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <Segmented
                options={["List", "Add"]}
                value={activeSegment === "List" ? "List" : "Add"}
                onChange={(value) => {
                  if (value === "Add") handleAddClick();
                  else setActiveSegment("List");
                }}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() => dispatch(fetchTaxes())}
                loading={isLoading}
              >
                Refresh
              </Button>
            </div>
            <div className="flex-grow bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <TaxTable
                data={taxes}
                loading={isLoading}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            </div>
          </>
        )}

        {(activeSegment === "Add" || activeSegment === "Edit") && renderForm()}

      </div>

      {renderViewModal()}
    </TitleBar>
  );
};

export default TaxPage;