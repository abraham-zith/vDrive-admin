import { SearchOutlined } from "@ant-design/icons";
import type { InputRef, TableColumnsType, TableColumnType } from "antd";
import {
  Button,
  Input,
  Space,
  Table,
  Avatar,
  Tooltip,
  message,
  Image,
} from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import { format } from "date-fns-tz";
import { useMemo, useRef, useState } from "react";
import { useGetHeight } from "../../utilities/customheightWidth";
import type { Driver } from "../../pages/Drivers";
import { UserOutlined, CopyOutlined } from "@ant-design/icons";
import { capitalize } from "../../utilities/capitalize";
import { parseISO, compareAsc } from "date-fns";
interface DriverTableProps {
  data: Driver[];
}

type DataIndex = keyof Driver;

const DriverTable = ({ data }: DriverTableProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const tableHeight = useGetHeight(contentRef);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

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

  const getColumnSearchProps = (
    dataIndex: DataIndex
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
      record[dataIndex]
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

  const columns: TableColumnsType<Driver> = useMemo(
    () => [
      {
        title: "Full Name",
        dataIndex: "full_name",
        key: "full_name",
        minWidth: 160,
        render: (text: string, record: Driver) => (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>{text}</span>
            <Tooltip title="Copy Driver ID">
              <CopyOutlined
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigator.clipboard.writeText(record.driver_id);
                  message.success("Driver ID copied!");
                }}
              />
            </Tooltip>
          </div>
        ),
        sorter: (a: Driver, b: Driver) =>
          a.full_name.localeCompare(b.full_name),
      },
      {
        title: "Phone Number",
        dataIndex: "phone_number",
        key: "phone_number",
        minWidth: 200,
        sorter: (a: Driver, b: Driver) =>
          a.phone_number.localeCompare(b.phone_number),
        ...getColumnSearchProps("phone_number"),
      },
      {
        title: "License Number",
        dataIndex: "license_number",
        minWidth: 200,
        key: "license_number",
        sorter: (a: Driver, b: Driver) =>
          a.license_number.localeCompare(b.license_number),
        ...getColumnSearchProps("license_number"),
      },
      {
        title: "License Expiry Date",
        dataIndex: "license_expiry_date",
        minWidth: 200,
        key: "license_expiry_date",
        width: 190,
        sorter: (a: Driver, b: Driver) => {
          const dateA = parseISO(a.license_expiry_date);
          const dateB = parseISO(b.license_expiry_date);
          return compareAsc(dateA, dateB);
        },
      },
      {
        title: "Rating",
        minWidth: 100,
        dataIndex: "rating",
        key: "rating",
        sorter: (a: Driver, b: Driver) => a.rating - b.rating,
      },
      {
        title: "Status",
        dataIndex: "status",
        minWidth: 120,
        key: "status",
        render: (text: string) => capitalize(text),
        sorter: (a: Driver, b: Driver) => a.status.localeCompare(b.status),
      },
      {
        title: "Total Trips",
        dataIndex: "total_trips",
        minWidth: 120,
        key: "total_trips",
        sorter: (a: Driver, b: Driver) => a.total_trips - b.total_trips,
      },
      {
        title: "Joined At",
        minWidth: 240,
        dataIndex: "joined_at",
        key: "joined_at",
        render: (text: string) =>
          format(new Date(text), "MMMM do yyyy, h:mm a", {
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        sorter: (a: Driver, b: Driver) =>
          new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime(),
      },
      {
        title: "Profile",
        dataIndex: "profile_url",
        key: "profile_url",
        minWidth: 130,
        render: (url: string) => (
          <Avatar
            src={url}
            icon={!url ? <UserOutlined /> : undefined}
            size="large"
          />
        ),
      },
    ],
    [searchText, searchedColumn]
  );


  return (
    <div ref={contentRef} className="h-full w-full">
      <Table
        key={tableHeight}
        // virtual
        columns={columns}
        dataSource={data}
        rowKey="full_name"
        pagination={false}
        tableLayout="auto"
        scroll={{ y: Math.floor(tableHeight || 0) }}
      />
    </div>
  );
};

export default DriverTable;
