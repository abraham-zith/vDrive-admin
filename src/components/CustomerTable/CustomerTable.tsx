import { SearchOutlined, EyeOutlined, StopOutlined, ClockCircleOutlined, EllipsisOutlined, UserOutlined } from "@ant-design/icons";
import type { InputRef, TableColumnsType, TableColumnType } from "antd";
import { Button, Input, Space, Table, Tag, Dropdown, Avatar, Popover } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import { useMemo, useRef, useState } from "react";
import { format } from "date-fns-tz";
import { useGetHeight } from "../../utilities/customheightWidth";
import type { Customer } from "../../pages/Customers";
import CustomerDetails from "../CustomerDetails/CustomerDetails";

interface CustomerTableProps {
    data: Customer[];
}

type DataIndex = keyof Customer;

const CustomerTable = ({ data }: CustomerTableProps) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const tableHeight = useGetHeight(contentRef);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);

    const openDrawer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setDrawerOpen(true);
    };

    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps["confirm"],
        dataIndex: DataIndex,
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex as string);
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
    ): TableColumnType<Customer> => ({
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
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
        ),
        onFilter: (value, record) => {
            const cellValue = record[dataIndex];
            return cellValue
                ? cellValue.toString().toLowerCase().includes((value as string).toLowerCase())
                : false;
        },
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

    const columns: TableColumnsType<Customer> = useMemo(
        () => [
            {
                title: "Customer",
                dataIndex: "full_name",
                key: "customer",
                minWidth: 200,
                sorter: (a: Customer, b: Customer) => a.full_name.localeCompare(b.full_name),
                ...getColumnSearchProps("full_name"),
                render: (_, record) => (
                    <div className="flex items-center gap-3">
                        <Avatar icon={<UserOutlined />} size={40} style={{ backgroundColor: "#1890ff" }}>
                            {record.full_name?.charAt(0)}
                        </Avatar>
                        <div>
                            <div className="font-semibold">{record.full_name}</div>
                            <div className="text-xs text-gray-500">{record.user_id}</div>
                        </div>
                    </div>
                ),
            },
            {
                title: "Contact",
                key: "contact",
                minWidth: 160,
                render: (_, record) => (
                    <div>
                        <div className="text-sm">{record.phone_number}</div>
                        <div className="text-xs text-gray-500">{record.email}</div>
                    </div>
                ),
            },
            {
                title: "Emergency Contacts",
                key: "emergency_contacts",
                minWidth: 180,
                render: (_, record) => {
                    const contacts = record.emergency_contacts || [];
                    if (contacts.length === 0) {
                        return <span className="text-gray-400 text-xs italic">No contacts registered</span>;
                    }

                    const firstContact = contacts[0];
                    const othersCount = contacts.length - 1;

                    const popoverContent = (
                        <div className="flex flex-col gap-3 p-1">
                            {contacts.map((contact, index) => (
                                <div key={index} className="flex flex-col border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                    <span className="font-semibold text-sm text-gray-800">{contact.name}</span>
                                    <span className="text-xs text-gray-500">{contact.phone}</span>
                                </div>
                            ))}
                        </div>
                    );

                    return (
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-700">{firstContact.name}</span>
                                <span className="text-[10px] text-gray-500">{firstContact.phone}</span>
                            </div>
                            {othersCount > 0 && (
                                <Popover
                                    content={popoverContent}
                                    title="Emergency Contacts"
                                    trigger="click"
                                    placement="topRight"
                                >
                                    <Tag
                                        color="blue"
                                        className="cursor-pointer hover:opacity-80 transition-opacity text-[10px] m-0"
                                    >
                                        +{othersCount} more
                                    </Tag>
                                </Popover>
                            )}
                        </div>
                    );
                },
            },
            {
                title: "Status",
                dataIndex: "status",
                minWidth: 120,
                key: "status",
                sorter: (a: Customer, b: Customer) => a.status.localeCompare(b.status),
                render: (status: string) => {
                    let color = "green";
                    if (status === "inactive") color = "orange";
                    if (status === "suspended") color = "red";
                    if (status === "blocked") color = "red";
                    return <Tag color={color}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;
                },
            },
            {
                title: "Updated At",
                dataIndex: "updated_at",
                minWidth: 240,
                key: "updated_at",
                render: (text: string) =>
                    text ? format(new Date(text), "MMMM do yyyy, h:mm a", {
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    }) : "-",
                sorter: (a: Customer, b: Customer) => {
                    const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
                    const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
                    return timeA - timeB;
                },
            },
            {
                title: "Created At",
                minWidth: 240,
                dataIndex: "created_at",
                key: "created_at",
                render: (text: string) =>
                    text ? format(new Date(text), "MMMM do yyyy, h:mm a", {
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    }) : "-",
                sorter: (a: Customer, b: Customer) => {
                    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return timeA - timeB;
                },
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
                            key: "block",
                            icon: <StopOutlined />,
                            label: "Block Customer",
                            danger: true,
                        },
                        {
                            key: "suspend",
                            icon: <ClockCircleOutlined />,
                            label: "Suspend Customer",
                            style: { color: "#fa8c16" },
                        },
                    ];
                    return (
                        <Space className="customer-action">
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() => openDrawer(record)}
                            />
                            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                                <Button type="text" icon={<EllipsisOutlined />} />
                            </Dropdown>
                        </Space>
                    );
                },
            },
        ],
        [searchText, searchedColumn],
    );

    return (
        <>
            <div ref={contentRef} className="h-full w-full">
                <Table
                    key={tableHeight}
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    pagination={false}
                    showSorterTooltip={false}
                    tableLayout="auto"
                    scroll={{ y: Math.floor(tableHeight || 0) }}
                    onRow={(record) => ({
                        onClick: (event) => {
                            const isActionClick = (event.target as HTMLElement).closest(
                                ".customer-action",
                            );
                            if (!isActionClick) {
                                openDrawer(record);
                            }
                        },
                    })}
                />
            </div>
            {selectedCustomer && (
                <CustomerDetails
                    customer={selectedCustomer}
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                />
            )}
        </>
    );
};

export default CustomerTable;
