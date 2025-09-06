// components/DriverTable/DriverTable.tsx
import { useMemo, useRef, useState  } from "react";
import { Table, Tag, Progress, Drawer, Rate, Avatar, Tooltip, message,  Button, Input, Space,} from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import type { Driver } from "../../pages/Drivers";
import { UserOutlined, CopyOutlined } from "@ant-design/icons";
import { capitalize } from "../../utilities/capitalize";
import type { FilterDropdownProps } from "antd/es/table/interface";
import type { InputRef, TableColumnsType, TableColumnType } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import DriverDetails from "../DriverDetails/DriverDetails";
interface DriverTableProps {
  data: Driver[];
}

type DataIndex = keyof Driver;

const DriverTable = ({ data }: DriverTableProps) => {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  const openDrawer = (driver: Driver) => {
    setSelectedDriver(driver);
    setDrawerOpen(true);
  };
    const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (
    clearFilters: () => void,
    confirm: FilterDropdownProps["confirm"]
  ) => {
    clearFilters();
    setSearchText("");
    confirm();
  };

  const closeDrawer = () => {
    setSelectedDriver(null);
    setDrawerOpen(false);
  };
  const getColumnSearchProps = (
    dataIndex: DataIndex,
    copyKey?: keyof Driver
  ): TableColumnType<Driver> => ({
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
          {/* <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button> */}
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      (record[dataIndex] ?? "")
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
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
                navigator.clipboard.writeText(record[copyKey] as string);
                message.success(`${String(copyKey)} copied!`);
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
      dataIndex: "fullName",
      key: "driver",
        ...getColumnSearchProps("fullName", "driverId"),
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.profilePicUrl} size={40}>
            {record.fullName?.charAt(0)}
          </Avatar>
          <div>
            <div className="font-semibold">{record.fullName}</div>
            <div className="text-xs text-gray-500">{record.driverId}</div>
            <div className="text-xs text-gray-400">
              {record.address.city}, {record.address.state}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <div>
          <div className="text-sm">{record.phoneNumber}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        const colors: Record<string, string> = {
          premium: "purple",
          elite: "orange",
          normal: "gray",
        };
        return <Tag color={colors[role]}>{capitalize(role)}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: Record<string, string> = {
          active: "green",
          inactive: "default",
          suspended: "red",
          pending: "gold",
          blocked: "volcano",
        };
       return <Tag color={colors[status]}>{capitalize(status)}</Tag>;

      },
    },
    {
      title: "Rating",
      dataIndex: "rating",
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
      dataIndex: "totalTrips",
      key: "totalTrips",
    },
    {
      title: "Earnings",
      dataIndex: ["payments", "totalEarnings"],
      key: "earnings",
      render: (earnings: number) => (
        <span className="text-green-600 font-medium">
          ₹{earnings.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Credits",
      key: "credits",
      render: (_, record) => {
        const total = record.credit.limit;
        const percent = (record.credit.balance / total) * 100;
        return (
          <div
            className="cursor-pointer"
            onClick={() => openDrawer(record)}
          >
            <div className="flex justify-between text-xs font-medium">
              <span>
                {record.credit.balance}/{total}
              </span>
              <span>{Math.round(percent)}%</span>
            </div>
            <Progress
              percent={percent}
              size="small"
              showInfo={false}
              strokeColor="#1677ff"
            />
          </div>
        );
      },
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "joined",
      render: (date: string) =>
        new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <EyeOutlined
          onClick={() => openDrawer(record)}
          className="cursor-pointer text-gray-500 hover:text-black"
        />
      ),
    },
  ];

  return (
    <>
      <Table
        rowKey="driverId"
        columns={columns}
        dataSource={data}
        pagination={false}
      />

<DriverDetails
  driver={selectedDriver}
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
/>

    </>
  );
};

export default DriverTable; 
