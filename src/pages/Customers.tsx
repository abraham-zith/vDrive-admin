import { useState, useEffect } from "react";
import { Button } from "antd";
import { IoMdRefresh } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchCustomers } from "../store/slices/customerSlice";
import CustomerTable from "../components/CustomerTable/CustomerTable";
import dayjs from "dayjs";
import AppliedFilters from "../components/AppliedFilters/AppliedFilters";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import AdvancedFilters from "../components/AdvancedFilters/AdvanceFilters";
import type { FilterField } from "../components/AdvancedFilters/AdvanceFilters";

export type CustomerStatus = "active" | "inactive" | "suspended" | "blocked";

export interface EmergencyContact {
    name: string;
    phone: string;
}

export interface Customer {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    status: CustomerStatus;
    updated_at: string;
    created_at: string;
    gender?: string;
    role?: string;
    emergency_contacts?: EmergencyContact[];
    user_code?: string;
}

// Remove dummy DATA array

export interface Filters {
    status: CustomerStatus[];
    updated_at: Date | null;
    created_at: Date | null;
}

const STATUSES = ["active", "inactive", "suspended"];
const fields: FilterField[] = [
    {
        name: "status",
        label: "Status",
        type: "select",
        mode: "multiple",
        options: STATUSES.map((r) => ({ label: r, value: r })),
    },
    { name: "updated_at", label: "Updated At", type: "date" },
    { name: "created_at", label: "Created At", type: "date" },
];

const Customers = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { customers, loading } = useSelector((state: RootState) => state.customers);

    const [filters, setFilters] = useState<Filters>({
        status: [],
        updated_at: null,
        created_at: null,
    });

    const [filteredData, setFilteredData] = useState<Customer[]>([]);

    useEffect(() => {
        dispatch(fetchCustomers());
    }, [dispatch]);

    useEffect(() => {
        const customersArray = Array.isArray(customers) ? customers : (customers as any)?.data || (customers as any)?.users || [];
        let tempData = [...customersArray];
        if (filters?.status?.length > 0) {
            const selectedStatuses = Array.isArray(filters?.status)
                ? filters?.status
                : [filters?.status];
            tempData = tempData.filter((customer) =>
                selectedStatuses.includes(customer?.status),
            );
        }
        if (filters?.updated_at) {
            tempData = tempData.filter((customer) =>
                dayjs(customer?.updated_at).isSame(filters?.updated_at, "day"),
            );
        }
        if (filters?.created_at) {
            tempData = tempData.filter((customer) =>
                dayjs(customer?.created_at).isSame(filters?.created_at, "day"),
            );
        }

        setFilteredData(tempData);
    }, [customers, filters]);

    const applyFilters = (values: Record<string, any>) => {
        setFilters((prev) => ({
            ...prev,
            ...values,
        }));
    };

    return (
        <TitleBar
            title="Customer Management"
            description="Manage and oversee all customer accounts within the system."
            extraContent={
                <div>
                    <Button
                        icon={<IoMdRefresh />}
                        loading={loading}
                        type="primary"
                        onClick={() => dispatch(fetchCustomers())}
                    >
                        Refresh
                    </Button>
                </div>
            }
        >
            <div className="w-full h-full flex flex-col gap-4">
                <AdvancedFilters filterFields={fields} applyFilters={applyFilters} />
                <AppliedFilters<Filters>
                    filters={filters}
                    setFilters={setFilters}
                    labels={{
                        status: "Status",
                        updated_at: "Updated At",
                        created_at: "Created At",
                    }}
                    colors={{
                        status: "green",
                        updated_at: "purple",
                        created_at: "orange",
                    }}
                />

                <div className="flex-grow overflow-auto rounded-lg border border-gray-300">
                    <CustomerTable data={filteredData} />
                </div>
            </div>
        </TitleBar>
    );
};

export default Customers;
