// components/DriverTable/DriverTable.tsx
import { useRef, useState } from "react";
import {
  Table,
  Tag,
  Progress,
  Rate,
  Avatar,
  Tooltip,
  Button,
  Input,
  Space,
  Dropdown,
} from "antd";
import dayjs from "dayjs";
import { messageApi as message } from "../../utilities/antdStaticHolder";
import type { ColumnsType } from "antd/es/table";

import Highlighter from "react-highlight-words";
import type { Driver } from "../../store/slices/driverSlice";
import {
  CopyOutlined,
  EllipsisOutlined,
  EyeOutlined,
  EditOutlined,
  StopOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { FilterDropdownProps } from "antd/es/table/interface";
import type { InputRef, TableColumnType } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import DriverDetails from "../DriverDetails/DriverDetails";
import { useGetHeight } from "../../utilities/customheightWidth";
interface DriverTableProps {
  data: Driver[];
}

type DataIndex = keyof Driver;

const DriverTable = ({ data }: DriverTableProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const tableHeight = useGetHeight(contentRef);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const selectedDriver = selectedDriverId
    ? data.find(
        (d) =>
          String(d.driverId || d.driver_id || "") === selectedDriverId ||
          (d.id && String(d.id) === selectedDriverId),
      )
    : null;

  const openDrawer = (driver: Driver) => {
    const id = String(driver.driverId || driver.driver_id || driver.id || "");
    if (id) {
      setSelectedDriverId(id);
      setDrawerOpen(true);
    } else {
      message.error("Driver ID missing.");
    }
  };

  const handleMenuClick = (key: string, record: Driver) => {
    switch (key) {
      case "view":
        openDrawer(record);
        break;
      case "edit":
        openDrawer(record);
        // We could also potentially trigger the edit modal directly here if needed
        break;
      case "block":
      case "suspend":
        openDrawer(record); // Default to opening details for now
        break;
      default:
        break;
    }
  };
  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: DataIndex,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (
    clearFilters: () => void,
    confirm: FilterDropdownProps["confirm"],
  ) => {
    clearFilters();
    setSearchText("");
    confirm();
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex,
    copyKey?: keyof Driver,
    additionalSearchFields: (keyof Driver)[] = [],
  ): TableColumnType<Driver> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div className="p-4" onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${String(dataIndex)}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            type="link"
            onClick={() => clearFilters && handleReset(clearFilters, confirm)}
            size="small"
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
      const searchFields = [dataIndex, ...additionalSearchFields];
      return searchFields.some((field) =>
        (record[field] ?? "")
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase()),
      );
    },
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text, record) => {
      const content =
        searchedColumn === dataIndex ? (
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ""}
          />
        ) : (
          text
        );

      return copyKey ? (
        <div className="flex gap-6 items-center">
          <span>{content}</span>
          <Tooltip title={`Copy ${String(copyKey)}`}>
            <CopyOutlined
              style={{ cursor: "pointer" }}
              onClick={() => {
                const idToCopy = String(record.driver_id || record.id || "");
                navigator.clipboard.writeText(idToCopy);
                message.success(`${String(copyKey === "driver_id" ? "ID" : copyKey)} copied!`);
              }}
            />
          </Tooltip>
        </div>
      ) : (
        content
      );
    },
  });
  const columns: ColumnsType<Driver> = [
    {
      title: "Driver",
      dataIndex: "full_name",
      key: "driver",
      minWidth: 180,
      ...getColumnSearchProps("full_name", "driver_id", ["vdrive_id", "id"]),
      render: (_, record) => (
        <div className="flex items-center gap-4 py-1">
          <Avatar 
            src={record.profilePicUrl || record.profile_pic_url} 
            size={48}
            className="border-2 border-slate-100 shadow-sm"
          >
            {record.full_name?.charAt(0)}
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <div className="text-[15px] font-bold text-slate-800 leading-tight">
              {record.full_name}
            </div>
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                {record.vdrive_id || record.driverId || record.driver_id || record.id || "N/A"}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              {record.address?.city}, {record.address?.state}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      minWidth: 160,
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <div className="text-[13px] font-medium text-slate-700">{record.phone_number}</div>
          <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{record.email}</div>
        </div>
      ),
    },

    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      minWidth: 120,
      render: (role: string) => {
        const colors: Record<string, string> = {
          premium: "purple",
          elite: "orange",
          normal: "default",
        };
        return (
          <Tag 
            bordered={false} 
            color={colors[role]} 
            className="capitalize font-medium px-3 rounded-full"
          >
            {role}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      minWidth: 120,
      key: "status",
      render: (status: string) => {
        const colors: Record<string, string> = {
          active: "success",
          inactive: "default",
          suspended: "warning",
          pending: "processing",
          blocked: "error",
        };
        return (
          <Tag 
            bordered={false} 
            color={colors[status]} 
            className="capitalize font-medium px-3 rounded-full"
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Recharge Plan",
      key: "recharge_plan",
      minWidth: 160,
      render: (_, record) => {
        const plan = record.active_subscription;
        if (!plan) return <Tag color="default">No Plan</Tag>;
        
        const isExpired = dayjs(plan.expiry_date).isBefore(dayjs());
        
        return (
          <div className="flex flex-col gap-0.5">
            <Tag bordered={false} color={isExpired ? "error" : "success"} className="capitalize font-medium px-3 rounded-full w-fit">
              {plan.plan_name}
            </Tag>
            <div className="text-[10px] text-slate-400 mt-1 ml-1 font-medium">
              Exp: {dayjs(plan.expiry_date).format("DD MMM YYYY")}
            </div>
          </div>
        );
      },
    },
    {
      title: "Rating",
      dataIndex: "rating",
      minWidth: 160,
      key: "rating",
      render: (rating: number) => (
        <div className="flex items-center gap-1">
          <Rate disabled allowHalf value={rating} style={{ fontSize: 14 }} />
          <span className="text-sm text-gray-600">{rating}</span>
        </div>
      ),
    },
    {
      title: "Total Trips",
      dataIndex: "total_trips",
      minWidth: 120,
      key: "total_trips",
    },

    {
      title: "Earnings",
      dataIndex: ["payments", "total_earnings"],
      minWidth: 160,
      key: "earnings",
      render: (earnings: number) => (
        <span className="text-[14px] text-emerald-600 font-bold">
          ₹{earnings?.toLocaleString() || 0}
        </span>
      ),
    },

    {
      title: "Credits",
      key: "credits",
      minWidth: 180,
      render: (_, record) => {
        const balance = record.credit?.balance || 0;
        const limit = record.credit?.limit || 1;
        const percent = (balance / limit) * 100;
        
        let strokeColor = "#1677ff";

        if (percent < 20) {
          strokeColor = "#ff4d4f";
        } else if (percent < 50) {
          strokeColor = "#fa8c16";
        } else {
          strokeColor = "#52c41a";
        }

        return (
          <div 
            className="cursor-pointer group hover:bg-slate-50 p-2 rounded-md transition-all" 
            onClick={() => openDrawer(record)}
          >
            <div className="flex justify-between text-[11px] font-bold mb-1">
              <span className="text-slate-600">
                ₹{balance.toLocaleString()} / ₹{limit.toLocaleString()}
              </span>
              <span style={{ color: strokeColor }}>{Math.round(percent)}%</span>
            </div>
            <Progress
              percent={percent}
              size="small"
              showInfo={false}
              strokeColor={strokeColor}
              trailColor="#f1f5f9"
              strokeWidth={6}
            />
          </div>
        );
      },
    },
    {
      title: "Joined",
      dataIndex: "created_at",
      minWidth: 160,
      key: "joined",
      render: (date: string) =>
        date
          ? new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "N/A",
    },

    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const menuItems = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "View Details",
          },
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit Profile",
          },
          {
            key: "block",
            icon: <StopOutlined />,
            label: "Block Driver",
            danger: true,
          },
          {
            key: "suspend",
            icon: <ClockCircleOutlined />,
            label: "Suspend Driver",
            style: { color: "#fa8c16" },
          },
        ];
        return (
          <Space className="driver-action">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => openDrawer(record)}
            />
            <Dropdown
              menu={{
                items: menuItems,
                onClick: ({ key }) => handleMenuClick(key, record),
              }}
              trigger={["click"]}
            >
              <Button type="text" icon={<EllipsisOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div ref={contentRef} className="h-full w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table
          className="custom-ant-table"
          key={tableHeight}
          rowKey={(record) => record.driver_id || record.id || ""}
          columns={columns}
          dataSource={data}
          showSorterTooltip={false}
          tableLayout="auto"
          scroll={{ y: Math.floor(tableHeight || 0), x: "max-content" }}
          sticky
          pagination={false}
          onRow={(record) => ({
            onClick: (event) => {
              const isActionClick = (event.target as HTMLElement).closest(
                ".driver-action",
              );
              if (!isActionClick) {
                openDrawer(record);
              }
            },
            className: "cursor-pointer hover:bg-slate-50/50 transition-colors",
          })}
        />
      </div>
      <DriverDetails
        driver={selectedDriver || null}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedDriverId(null);
        }}
      />
    </>
  );
};

export default DriverTable;
