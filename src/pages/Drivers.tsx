import { useState, useEffect, useMemo } from "react";
import { Button, Spin } from "antd";
import { IoMdRefresh } from "react-icons/io";
import DriverTable from "../components/DriverTable/DriverTable";
import dayjs from "dayjs";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import AdvancedFilters from "../components/AdvancedFilters/AdvanceFilters";
import type { FilterField } from "../components/AdvancedFilters/AdvanceFilters";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchDrivers } from "../store/slices/driverSlice";
import type { Driver, DriverStatus } from "../store/slices/driverSlice";

export interface Filters {
  status: DriverStatus[];
  plan: string[];
  joined_at: Date | null;
}

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

  // Dynamic filter fields based on current driver data
  const planOptions = useMemo(() => {
    const plans = new Set<string>();
    DATA.forEach(d => {
      if (d.active_subscription?.plan_name) {
        plans.add(d.active_subscription.plan_name);
      }
    });
    return Array.from(plans).sort().map(p => ({ value: p, label: p }));
  }, [DATA]);

  const fields: FilterField[] = useMemo(() => [
    {
      name: "search",
      label: "Search Driver",
      type: "input",
    },
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
      name: "plan",
      label: "Subscription Plan",
      type: "select",
      options: planOptions,
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
  ], [planOptions]);

  const applyFilters = (values: Record<string, any>) => {
    let tempData = DATA;

    // Search by Name, System ID, or vDrive ID
    if (values?.search) {
      const searchText = values.search.toLowerCase();
      tempData = tempData.filter((d) => {
        return (
          d.full_name?.toLowerCase().includes(searchText) ||
          d.driver_id?.toLowerCase().includes(searchText) ||
          d.vdrive_id?.toLowerCase().includes(searchText) ||
          d.id?.toLowerCase().includes(searchText)
        );
      });
    }

    if (values?.status?.length > 0) {
      const selectedStatuses = Array.isArray(values?.status)
        ? values?.status
        : [values?.status];
      tempData = tempData.filter((user) =>
        selectedStatuses.includes(user?.status),
      );
    }
    
    // Subscription Plan Filter
    if (values?.plan?.length > 0) {
      const selectedPlans = Array.isArray(values?.plan)
        ? values?.plan
        : [values?.plan];
      tempData = tempData.filter((user) =>
        selectedPlans.includes(user?.active_subscription?.plan_name),
      );
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
