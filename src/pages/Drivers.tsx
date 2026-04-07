import { useState, useEffect } from "react";
import { Button, Spin } from "antd";
import { IoMdRefresh } from "react-icons/io";
import DriverTable from "../components/DriverTable/DriverTable";
import dayjs from "dayjs";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import AdvancedFilters from "../components/AdvancedFilters/AdvanceFilters";
import type { FilterField } from "../components/AdvancedFilters/AdvanceFilters";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchDrivers } from "../store/slices/driverSlice";
import type { Driver, DriverRole, DriverStatus } from "../store/slices/driverSlice";

export interface Filters {
  status: DriverStatus[];
  role: DriverRole[];
  joined_at: Date | null;
}

const fields: FilterField[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "suspended", label: "Suspended" },
      { value: "pending", label: "Pending" },
      { value: "blocked", label: "Blocked" },
    ],
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    options: [
      { value: "premium", label: "Premium" },
      { value: "elite", label: "Elite" },
      { value: "normal", label: "Normal" },
    ],
  },
  {
    name: "rating",
    label: "Rating",
    type: "slider",
    min: 0,
    max: 5,
    step: 0.1,
  },
  { name: "joined", label: "Joined", type: "date" },
];

const Drivers = () => {
  const dispatch = useAppDispatch();
  const { drivers: DATA, loading, error } = useAppSelector((state) => state.drivers);
  const [filteredData, setFilteredData] = useState<Driver[]>(DATA);

  useEffect(() => {
    dispatch(fetchDrivers());
  }, [dispatch]);

  useEffect(() => {
    setFilteredData(Array.isArray(DATA) ? DATA : []);
  }, [DATA]);

  const applyFilters = (values: Record<string, any>) => {
    let tempData = DATA;
    if (values?.status?.length > 0) {
      const selectedStatuses = Array.isArray(values?.status)
        ? values?.status
        : [values?.status];
      tempData = tempData.filter((user) =>
        selectedStatuses.includes(user?.status),
      );
    }
    if (values?.role?.length > 0) {
      const selectedRole = Array.isArray(values?.role)
        ? values?.role
        : [values?.role];
      tempData = tempData.filter((user) => selectedRole.includes(user?.role));
    }
    if (values?.joined) {
      tempData = tempData.filter((user) =>
        dayjs(user?.created_at).isSame(values?.joined, "day"),
      );
    }

    if (values?.rating && Array.isArray(values?.rating)) {
      const [min, max] = values?.rating;
      tempData = tempData.filter((item) => {
        const itemValue = Number(item.rating ?? 0);
        return itemValue >= min && itemValue <= max;
      });
    }

    setFilteredData(tempData);
  };

  return (
    <TitleBar
      title="Driver Management"
      description="Manage drivers, view details, and perform administrative actions."
      extraContent={
        <div>
          <Button
            icon={<IoMdRefresh />}
            loading={loading}
            type="primary"
            onClick={() => dispatch(fetchDrivers())}
          >
            Refresh
          </Button>
        </div>
      }
    >
      <div className="w-full h-full flex flex-col gap-4">
        {" "}
        <AdvancedFilters filterFields={fields} applyFilters={applyFilters} />
        <div className="flex-grow overflow-hidden">
          {loading && DATA.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Spin size="large" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              {error}
            </div>
          ) : (
            <DriverTable data={filteredData} />
          )}
        </div>
      </div>
    </TitleBar>
  );
};

export default Drivers;
