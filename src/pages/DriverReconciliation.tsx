import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Table,
  Tag,
  Space,
  Upload,
  message,
  Typography,
  Card,
  Empty,
  Tooltip,
} from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
  TableOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import AdvancedFilters, {
  type FilterField,
  type FilterValues,
} from "../components/AdvancedFilters/AdvanceFilters";
import axiosIns from "../api/axios";
import dayjs from "dayjs";

const { Text } = Typography;

interface DriverData {
  driver_name: string;
  phone: string;
  mail: string;
  address: string;
  pincode: string;
  district: string;
  state: string;
  country: string;
  status: string;
  created_at: string;
  updated_at: string;
  joined_date: string;
}

const DriverReconciliation: React.FC = () => {
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<DriverData[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    globalSearch: "",
    status: [],
    state: [],
    from: null,
    to: null,
  });
  const [summaryStats, setSummaryStats] = useState({
    total_processed_rows: 0,
    active_drivers: 0,
    pending_drivers: 0
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all reconciliation rows
      const rowsResponse = await axiosIns.get("/api/driver-reconciliation/rows?limit=1000");
      const rows = rowsResponse.data?.data?.rows || [];
      setDrivers(rows);

      // Derive stats from rows or fetch from summary if backend supports it
      // For now, let's derive to ensure consistency with the table
      setSummaryStats({
        total_processed_rows: rows.length,
        active_drivers: rows.filter((d: any) => d.status?.toLowerCase() === 'active' || d.status?.toLowerCase() === 'verified').length,
        pending_drivers: rows.filter((d: any) => d.status?.toLowerCase() === 'pending').length
      });

      // Optionally fetch real summary if needed for scale
      // const summaryResponse = await axiosIns.get("/api/driver-reconciliation/summary");
      // setSummaryStats(summaryResponse.data?.data);
    } catch (err: any) {
      console.error("Failed to load reconciliation data:", err);
      message.error("Failed to load driver data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtering Logic
  useEffect(() => {
    let result = [...drivers];

    if (filters.globalSearch) {
      const search = filters.globalSearch.toLowerCase();
      result = result.filter(
        (d) =>
          d.driver_name?.toLowerCase().includes(search) ||
          d.phone?.includes(search) ||
          d.mail?.toLowerCase().includes(search)
      );
    }

    if (filters.status && filters.status.length > 0) {
      result = result.filter((d) => filters.status.includes(d.status?.toLowerCase()));
    }

    if (filters.state && filters.state.length > 0) {
      result = result.filter((d) => filters.state.includes(d.state));
    }

    if (filters.from) {
      const fromDate = dayjs(filters.from).startOf("day");
      result = result.filter((d) => d.joined_date && dayjs(d.joined_date).isAfter(fromDate) || dayjs(d.joined_date).isSame(fromDate));
    }

    if (filters.to) {
      const toDate = dayjs(filters.to).endOf("day");
      result = result.filter((d) => d.joined_date && dayjs(d.joined_date).isBefore(toDate) || dayjs(d.joined_date).isSame(toDate));
    }

    setFilteredDrivers(result);
  }, [drivers, filters]);

  const applyFilters = (values: FilterValues) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const filterFields: FilterField[] = [
    {
      name: "globalSearch",
      label: "Search Name / Phone / Email",
      type: "input",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "verified", label: "Verified" },
        { value: "pending", label: "Pending" },
        { value: "inactive", label: "Inactive" },
      ],
      mode: "multiple",
    },
    {
      name: "state",
      label: "State",
      type: "select",
      options: Array.from(new Set(drivers.map((d) => d.state))).filter(Boolean).map(s => ({ value: s, label: s })),
      mode: "multiple",
    },
    {
      name: "from",
      label: "Joined From",
      type: "date",
    },
    {
      name: "to",
      label: "Joined To",
      type: "date",
    },
  ];

  // Keyboard Shortcuts: Alt+E for Export, Alt+I for Import
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        exportTemplate();
      }
      if (e.altKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        const uploadEl = document.querySelector(".import-upload input") as HTMLInputElement;
        uploadEl?.click();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const exportTemplate = () => {
    const headers = [
      "Driver Name",
      "Phone",
      "Email",
      "Address",
      "Pincode",
      "District",
      "State",
      "Country",
      "Status",
      "Created At",
      "Updated At",
      "Joined Date",
    ];

    const sampleRow = {
      "Driver Name": "John Doe",
      Phone: "+91 9876543210",
      Email: "john@example.com",
      Address: "123 Main St",
      Pincode: "110001",
      District: "Central Delhi",
      State: "Delhi",
      Country: "India",
      Status: "active",
      "Created At": dayjs().format("YYYY-MM-DD"),
      "Updated At": dayjs().format("YYYY-MM-DD"),
      "Joined Date": dayjs().format("YYYY-MM-DD"),
    };

    const ws = XLSX.utils.json_to_sheet([sampleRow], { header: headers });

    // Set column widths
    const wscols = headers.map(() => ({ wch: 20 }));
    ws["!cols"] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Drivers");
    XLSX.writeFile(wb, `Driver_Template_${dayjs().format("YYYYMMDD")}.xlsx`);
    message.success("Template exported successfully!");
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    setImporting(true);
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<DriverData>(worksheet);

        if (jsonData.length === 0) {
          message.error("The uploaded file is empty.");
          return;
        }

        // Send to backend
        try {
          const payload = {
            filename: file.name,
            data: jsonData
          };
          await axiosIns.post("/api/driver-reconciliation/process", payload);
          message.success(`${jsonData.length} driver records imported successfully!`);
          loadData(); // Refresh data from server
        } catch (err: any) {
          console.error("Backend import failed:", err);
          // Only fallback to local if absolutely necessary, but better to show real state
          message.warning("Import failed: " + (err.response?.data?.message || err.message));
        }
      } catch (error) {
        message.error("Failed to parse the file. Please ensure it's a valid Excel/CSV.");
      } finally {
        setImporting(false);
      }
    };
    reader.onerror = () => {
      message.error("File reading failed.");
      setImporting(false);
    };
    reader.readAsBinaryString(file);
    return false; // Prevent default upload behavior
  };

  const columns = [
    {
      title: "Driver Name",
      dataIndex: "driver_name",
      key: "name",
      render: (text: string) => <Text strong className="text-slate-700">{text}</Text>,
    },
    {
      title: "Contact Info",
      key: "contact",
      render: (_: any, record: DriverData) => (
        <div className="flex flex-col">
          <Text className="text-indigo-600 text-[12px] font-medium">{record.phone}</Text>
          <Text type="secondary" className="text-[11px]">{record.mail}</Text>
        </div>
      ),
    },
    {
      title: "Location",
      key: "location",
      render: (_: any, record: DriverData) => (
        <Tooltip title={`${record.address}, ${record.district}, ${record.state}, ${record.pincode}`}>
          <div className="max-w-[200px] truncate text-[12px] text-slate-500">
            {record.district}, {record.state}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        let icon = null;
        if (status?.toLowerCase() === "active" || status?.toLowerCase() === "verified") {
          color = "success";
          icon = <CheckCircleFilled />;
        } else if (status?.toLowerCase() === "inactive" || status?.toLowerCase() === "suspended") {
          color = "error";
          icon = <ExclamationCircleFilled />;
        } else if (status?.toLowerCase() === "pending") {
          color = "processing";
        }
        return (
          <Tag icon={icon} color={color} className="rounded-full px-3 py-0.5 font-bold uppercase text-[10px]">
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Joined Date",
      dataIndex: "joined_date",
      key: "joined",
      render: (date: string) => (
        <Text className="text-[12px] font-medium text-slate-500">
          {date ? dayjs(date).format("MMM DD, YYYY") : "N/A"}
        </Text>
      ),
    },
    {
      title: "Last Update",
      dataIndex: "updated_at",
      key: "updated",
      render: (date: string) => (
        <Text type="secondary" className="text-[11px]">
          {date ? dayjs(date).format("DD/MM/YYYY") : "N/A"}
        </Text>
      ),
    },
  ];

  return (
    <TitleBar
      title="Driver Reconciliation"
      description="Streamline driver onboarding and data management through bulk import/export."
      icon={<TableOutlined />}
      iconBgColor="bg-indigo-600"
      extraContent={
        <Space size="middle">
          <Tooltip title="Shortcut: Alt + E">
            <Button
              type="default"
              icon={<DownloadOutlined />}
              onClick={exportTemplate}
              className="rounded-xl font-bold h-10 border-indigo-100 hover:border-indigo-600 hover:text-indigo-600 shadow-sm transition-all"
            >
              Export Template
            </Button>
          </Tooltip>
          <Tooltip title="Shortcut: Alt + I">
            <Upload
              beforeUpload={handleImport}
              showUploadList={false}
              accept=".xlsx,.xls,.csv"
              className="import-upload"
            >
              <Button
                type="primary"
                icon={<UploadOutlined />}
                loading={importing}
                className="rounded-xl font-bold h-10 bg-indigo-600 hover:bg-indigo-700 border-none shadow-md transition-all px-6"
              >
                Import Data
              </Button>
            </Upload>
          </Tooltip>
        </Space>
      }
    >
      <div className="w-full h-full flex flex-col gap-6 animate-in fade-in duration-500">
        {/* Stats Summary Style Card (Optional but looks premium) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white">
            <div className="flex flex-col">
              <Text className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Total Imported</Text>
              <Text className="text-2xl font-black text-indigo-900 leading-tight">{summaryStats.total_processed_rows}</Text>
            </div>
          </Card>
          <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-green-50 to-white">
            <div className="flex flex-col">
              <Text className="text-[10px] font-black uppercase text-green-400 tracking-widest">Active Drivers</Text>
              <Text className="text-2xl font-black text-green-900 leading-tight">{summaryStats.active_drivers}</Text>
            </div>
          </Card>
          <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-amber-50 to-white">
            <div className="flex flex-col">
              <Text className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Pending Review</Text>
              <Text className="text-2xl font-black text-amber-900 leading-tight">{summaryStats.pending_drivers}</Text>
            </div>
          </Card>
        </div>

        {/* Filter Section */}
        <div className="px-2">
          <AdvancedFilters
            filterFields={filterFields}
            applyFilters={applyFilters}
            isStandalone
            onClear={() => setFilters({
              globalSearch: "",
              status: [],
              state: [],
              from: null,
              to: null,
            })}
          />
        </div>

        <div className="flex-grow bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-0 pb-2">
          <Table
            columns={columns}
            dataSource={filteredDrivers}
            loading={importing || loading}
            pagination={{
              pageSize: 10,
              total: filteredDrivers.length,
              className: "px-6 py-4",
              showSizeChanger: true,
              size: "small",
              position: ["bottomRight"],
              showTotal: (total) => total > 0 ? `Total ${total} drivers` : ""
            }}
            scroll={{ x: 'max-content', y: 'calc(100vh - 480px)' }}
            sticky
            rowKey={(record, index) => (record?.phone || index || 0).toString() + (index || 0)}
            rowClassName={(_, index) =>
              (index || 0) % 2 === 0 ? "bg-slate-50/50 hover:bg-indigo-50/30 transition-colors" : "bg-white hover:bg-indigo-50/30 transition-colors"
            }
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="flex flex-col gap-2">
                      <Text className="text-slate-400 font-medium">No driver data found</Text>
                      <Text type="secondary" className="text-[12px]">Please export the template and import your data to get started.</Text>
                      <div className="mt-2">
                        <Button
                          type="dashed"
                          icon={<DownloadOutlined />}
                          onClick={exportTemplate}
                          className="rounded-lg text-indigo-500 border-indigo-200"
                        >
                          Download Template
                        </Button>
                      </div>
                    </div>
                  }
                />
              ),
            }}
            className="premium-table"
          />
        </div>
      </div>

      <style>{`
        .premium-table .ant-table-thead > tr > th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #f1f5f9;
          padding: 16px 24px;
        }
        .premium-table .ant-table-tbody > tr > td {
          padding: 16px 24px;
          border-bottom: 1px solid #f8fafc;
        }
        .animate-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </TitleBar>
  );
};

export default DriverReconciliation;
