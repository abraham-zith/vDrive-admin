import { useRef } from "react";
import { Table, Tag, Switch, Button, Space, Popconfirm, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { useGetHeight } from "../../utilities/customheightWidth";
import type { Tax } from "../../store/slices/taxSlice";

interface TaxTableProps {
  data: Tax[];
  onEdit: (tax: Tax) => void;
  onView: (tax: Tax) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  loading?: boolean;
}

const TAX_TYPE_COLORS: Record<string, string> = {
  CENTRAL: "gold",
  STATE: "green",
  UNION_TERRITORY: "purple",
  COMPOSITE: "blue",
};

const TaxTable = ({
  data,
  onEdit,
  onView,
  onDelete,
  onToggleStatus,
  loading,
}: TaxTableProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const tableHeight = useGetHeight(contentRef);

  const columns: TableColumnsType<Tax> = [
    {
      title: "Tax Name",
      dataIndex: "tax_name",         // ← taxName (DB: tax_name)
      key: "taxName",
      minWidth: 160,
      sorter: (a, b) => a.tax_name.localeCompare(b.tax_name),
      render: (name: string, record: Tax) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontWeight: 600 }}>{name}</span>
          <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
            {record.tax_code}
          </span>
        </div>
      ),
    },
    {
      title: "Indian Tax",
      dataIndex: "indian_tax",       // ← indianTax (DB: indian_tax)
      key: "indianTax",
      minWidth: 120,
      render: (val: string) => val || <span style={{ color: "#cbd5e1" }}>—</span>,
    },
    {
      title: "Tax Type",
      dataIndex: "tax_type",         // ← taxType (DB: tax_type)
      key: "taxType",
      minWidth: 130,
      render: (type: string) => (
        <Tag color={TAX_TYPE_COLORS[type] || "cyan"} style={{ fontWeight: 600 }}>
          {type?.replace(/_/g, " ")}
        </Tag>
      ),
    },
    {
      title: "Percentage",
      dataIndex: "percentage",
      key: "percentage",
      minWidth: 110,
      sorter: (a, b) => a.percentage - b.percentage,
      render: (percent: number) => (
        <Tag color="geekblue" style={{ fontWeight: 700 }}>
          {percent}%
        </Tag>
      ),
    },
    {
      title: "Default",
      dataIndex: "is_default",       // ← isDefault (DB: is_default)
      key: "isDefault",
      minWidth: 90,
      render: (isDefault: boolean) =>
        isDefault ? (
          <Tag color="warning">Default</Tag>
        ) : (
          <span style={{ color: "#cbd5e1" }}>—</span>
        ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      minWidth: 200,
      ellipsis: true,
      render: (desc: string) => desc || <span style={{ color: "#cbd5e1" }}>—</span>,
    },
    {
      title: "Status",
      dataIndex: "is_active",        // ← isActive (DB: is_active)
      key: "isActive",
      minWidth: 120,
      render: (isActive: boolean, record: Tax) => (
        <Switch
          checked={isActive}
          onChange={(checked) => onToggleStatus(record.id, checked)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record: Tax) => (
        <Space size="small">
          <Tooltip title="View Detail">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Tax"
            description={`Are you sure you want to delete "${record.tax_name}"?`}
            onConfirm={() => onDelete(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div ref={contentRef} className="h-full w-full">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={false}
        loading={loading}
        scroll={{ y: tableHeight ? tableHeight - 40 : 400, x: "max-content" }}
        className="tax-table"
      />
    </div>
  );
};

export default TaxTable;