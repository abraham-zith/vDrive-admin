import React, { useRef, useState, useMemo } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Modal,
  Descriptions,
  message,
  type TableColumnsType,
  type TableColumnType,
  type InputRef,
} from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { format } from "date-fns-tz";
import type { Deduction, Driver } from "../../store/slices/deductionSlice";
import { useGetHeight } from "../../utilities/customheightWidth";

interface DeductionTableProps {
  data: Deduction[];
}

type DataIndex = keyof Deduction;

const DeductionTable: React.FC<DeductionTableProps> = ({ data }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const tableHeight = useGetHeight(contentRef);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState<DataIndex | "">("");
  const searchInput = useRef<InputRef>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState<Deduction | null>(null);

  const showModal = (record: Deduction) => {
    setSelectedDeduction(record);
    setIsModalVisible(true);
  };

  const handleDownload = (record: Deduction) => {
    try {
      const headers = ["Field", "Value"];
      const rows = [
        ["Deduction ID", record.id],
        ["Driver Name", record.driver?.fullName || "N/A"],
        ["Driver ID", record.driver?.id || "N/A"],
        ["Driver Phone", record.driver?.phone || "N/A"],
        ["Amount", record.amount],
        ["Trip ID", record.trip],
        ["Type", record.type],
        ["Status", record.status],
        ["Date", record.date ? format(new Date(record.date), "PPP p") : "N/A"],
        ["Balance Before", record.balanceBefore],
        ["Balance After", record.balanceAfter],
        ["Reference", record.reference],
        ["Performed By", record.performedBy]
      ];

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `receipt_${record.id}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success(`Receipt downloaded for deduction ${record.id}`);
    } catch (error) {
      console.error("Download failed:", error);
      message.error("Failed to download receipt");
    }
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: () => void,
    dataIndex: DataIndex,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void, confirm: () => void) => {
    clearFilters();
    setSearchText("");
    confirm();
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex,
  ): TableColumnType<Deduction> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${String(dataIndex)}`}
          value={selectedKeys?.[0]}
          onChange={(e) =>
            setSelectedKeys?.(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<SearchOutlined />}
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            size="small"
            onClick={() => clearFilters && handleReset(clearFilters, confirm)}
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      const recordValue = record[dataIndex];
      return recordValue
        ? recordValue
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase())
        : false;
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const statusColors: Record<string, string> = {
    Success: "green",
    Failed: "red",
    Pending: "gold",
    Initiated: "blue",
    Reversed: "gray",
  };

  const columns: TableColumnsType<Deduction> = useMemo(
    () => [
      {
        title: "Deduction ID",
        dataIndex: "id",
        key: "id",
        minWidth: 160,
        sorter: (a, b) => a.id.localeCompare(b.id),
        ...getColumnSearchProps("id"),
      },
      {
        title: "Driver",
        dataIndex: "driver",
        key: "driver",
        minWidth: 160,

        render: (driver: Driver) => (
          <div>
            <div className="font-medium">{driver?.fullName || "Unknown"}</div>
            <div className="text-xs text-gray-500">
              {driver?.id || "N/A"} • {driver?.phone || "N/A"}
            </div>
          </div>
        )
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        minWidth: 110,

        sorter: (a, b) =>
          parseFloat((a?.amount || "0").replace("$", "")) -
          parseFloat((b?.amount || "0").replace("$", "")),
      },
      {
        title: "Trip ID",
        dataIndex: "trip",
        key: "trip",
        minWidth: 120,
        sorter: (a, b) => (a?.trip || "").localeCompare(b?.trip || ""),
        ...getColumnSearchProps("trip"),
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        minWidth: 110,
        render: (type: string) => <Tag color="blue">{type}</Tag>,
      },
      {
        title: "Balance Before",
        dataIndex: "balanceBefore",
        key: "balanceBefore",
        minWidth: 140,
        sorter: (a: Deduction, b: Deduction) =>
          parseFloat((a?.balanceBefore || "0").replace(/[$,]/g, "")) -
          parseFloat((b?.balanceBefore || "0").replace(/[$,]/g, "")),
        render: (text: string) => <span className="font-medium">{text}</span>,
      },
      {
        title: "Balance After",
        dataIndex: "balanceAfter",
        key: "balanceAfter",
        minWidth: 140,
        sorter: (a: Deduction, b: Deduction) =>
          parseFloat((a?.balanceAfter || "0").replace(/[$,]/g, "")) -
          parseFloat((b?.balanceAfter || "0").replace(/[$,]/g, "")),
        render: (text: string) => <span className="font-medium">{text}</span>,
      },

      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        minWidth: 110,
        render: (status: string) => (
          <Tag color={statusColors[status] || "default"}>{status || "Unknown"}</Tag>
        ),
        sorter: (a, b) => (a?.status || "").localeCompare(b?.status || ""),
      },
      {
        title: "Date",
        dataIndex: "date",
        minWidth: 120,
        key: "date",
        render: (text: string) => text ? format(new Date(text), "MMM dd, yyyy") : "N/A",
        sorter: (a, b) =>
          new Date(a?.date || 0).getTime() - new Date(b?.date || 0).getTime(),
      },
      {
        title: "Reference",
        dataIndex: "reference",
        key: "reference",
        minWidth: 120,
        ...getColumnSearchProps("reference"),
      },
      {
        title: "Performed By",
        dataIndex: "performedBy",
        minWidth: 140,
        key: "performedBy",
        ...getColumnSearchProps("performedBy"),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: any, record: Deduction) => (
          <Space>
            <Button
              icon={<EyeOutlined />}
              size="small"
              type="default"
              onClick={() => showModal(record)}
            />
            <Button
              icon={<DownloadOutlined />}
              size="small"
              type="primary"
              onClick={() => handleDownload(record)}
            />
          </Space>
        ),
      },
    ],
    [searchText, searchedColumn],
  );

  return (
    <div ref={contentRef} className="h-full w-full">
      <Table
        className="rounded-lg border border-gray-300"
        key={tableHeight}
        rowKey="id"
        columns={columns}
        dataSource={data}
        showSorterTooltip={false}
        tableLayout="auto"
        scroll={{ y: Math.floor(tableHeight || 0) }}
      />
      
      <Modal
        title="Deduction Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => selectedDeduction && handleDownload(selectedDeduction)}
          >
            Download Receipt
          </Button>
        ]}
        width={700}
      >
        {selectedDeduction && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Deduction ID" span={2}>
              {selectedDeduction.id}
            </Descriptions.Item>
            <Descriptions.Item label="Driver Name">
              {selectedDeduction.driver?.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Driver ID">
              {selectedDeduction.driver?.id}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {selectedDeduction.driver?.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Trip ID">
              {selectedDeduction.trip}
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              <span className="text-red-600 font-bold">{selectedDeduction.amount}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color="blue">{selectedDeduction.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusColors[selectedDeduction.status] || "default"}>
                {selectedDeduction.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {selectedDeduction.date ? format(new Date(selectedDeduction.date), "PPP p") : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Balance Before">
              {selectedDeduction.balanceBefore}
            </Descriptions.Item>
            <Descriptions.Item label="Balance After">
              {selectedDeduction.balanceAfter}
            </Descriptions.Item>
            <Descriptions.Item label="Reference">
              {selectedDeduction.reference}
            </Descriptions.Item>
            <Descriptions.Item label="Performed By">
              {selectedDeduction.performedBy}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default DeductionTable;
