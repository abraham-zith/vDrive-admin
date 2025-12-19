import { useEffect, useState } from "react";
import { Button, Segmented } from "antd";
import { IoMdRefresh } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "../redux/store";
import type { AppDispatch, RootState } from "../store";

import { fetchTrips, type TripDetailsType } from "../store/slices/tripSlice";
import TripDetailsTable from "../components/TripDetails/TripDetailsTable";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import AdvancedFilters, {
  type FilterField,
} from "../components/AdvancedFilters/AdvanceFilters";
import * as XLSX from "xlsx";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";

export const exportTripsToExcel = (
  data: TripDetailsType[],
  fileName: string
) => {
  if (!data.length) return;

  const worksheet = XLSX.utils.json_to_sheet(
    data.map((trip) => ({
      TripID: trip.trip_id,
      User: trip.user_name,
      UserPhone: trip.user_phone,
      Driver: trip.driver_name ?? "Not Assigned",
      DriverPhone: trip.driver_phone ?? "-",
      Pickup: trip.pickup_address,
      Drop: trip.drop_address,
      Status: trip.trip_status,
      Fare: trip.total_fare,
      Payment: trip.payment_status,
      Service: trip.service_type,
      Type: trip.ride_type,
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Trips");

  XLSX.writeFile(workbook, fileName);
};

const TripDetails = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { trips, loading } = useSelector((state: RootState) => state.trips);
  const [filteredTrips, setFilteredTrips] = useState<TripDetailsType[]>([]);
  const [filters, setFilters] = useState({
    status: "requested",
    globalSearch: "",
    driverAssigned: "all",
    from: undefined,
    to: undefined,
  });

  const handleRefresh = () => {
    dispatch(fetchTrips());
  };

  useEffect(() => {
    let temp = [...trips];
    console.log("FILTERS STATE 👉", filters);

    // 🔹 Status (Segmented)
    if (filters.status !== "all") {
      temp = temp.filter(
        (t) => t.trip_status?.toLowerCase() === filters.status
      );
    }

    // 🔹 Global Search
    if (filters.globalSearch) {
      const s = filters.globalSearch.toLowerCase();
      temp = temp.filter(
        (t) =>
          t.trip_id?.toLowerCase().includes(s) ||
          t.user_name?.toLowerCase().includes(s) ||
          t.user_phone?.includes(s) ||
          t.driver_name?.toLowerCase().includes(s) ||
          t.driver_phone?.includes(s) ||
          t.pickup_address?.toLowerCase().includes(s) ||
          t.drop_address?.toLowerCase().includes(s)
      );
    }

    // 🔹 Driver Assigned
    if (filters.driverAssigned === "driverAssigned") {
      temp = temp.filter(
        (t) => t.driver_id && t.driver_name && t.driver_name.trim() !== ""
      );
    }

    if (filters.driverAssigned === "driverNotAssigned") {
      temp = temp.filter(
        (t) => !t.driver_id || !t.driver_name || t.driver_name.trim() === ""
      );
    }

    // 🔹 From – To DateTime filter
    if (filters.from || filters.to) {
      const fromDate = normalize(filters.from);
      const toDate = normalize(filters.to);

      temp = temp.filter((t) => {
        if (!t.created_at) return false;

        // 🔥 convert UTC → local before comparing
        const tripDate = dayjs.utc(t.created_at).local();

        if (fromDate && tripDate.isBefore(fromDate)) return false;
        if (toDate && tripDate.isAfter(toDate)) return false;

        return true;
      });
    }

    setFilteredTrips(temp);
  }, [trips, filters]);

  useEffect(() => {
    dispatch(fetchTrips());
  }, [dispatch]);

  //apply filters

  dayjs.extend(utc);

  const normalize = (v?: string | Dayjs) => {
    if (!v) return null;
    return typeof v === "string" ? dayjs(v) : v;
  };

  const applyFilters = (values: Record<string, any>) => {
    let driverAssigned = "all";
    if (
      Array.isArray(values?.driverAssigned) &&
      values.driverAssigned.length > 0
    ) {
      driverAssigned = values.driverAssigned[0];
    }
    setFilters((prev) => ({
      ...prev,
      globalSearch: values.globalSearch || "",
      driverAssigned, // ✅ now STRING
    }));
  };

  //count function

  const getStatusCount = (status: string) => {
    if (status === "all") return trips.length;

    return trips.filter((t) => t.trip_status?.toLowerCase() === status).length;
  };

  // export

  const handleExport = () => {
    exportTripsToExcel(filteredTrips, "Trip_Report.xlsx");
  };

  const fields: FilterField[] = [
    {
      name: "globalSearch",
      label: "Global Search",
      type: "input",
    },
    {
      name: "driverAssigned",
      label: "Driver Assigned",
      type: "select",
      options: [
        { value: "all", label: "All" },
        { value: "driverAssigned", label: "Driver Assigned" },
        { value: "driverNotAssigned", label: "Driver Not Assigned" },
      ],
    },

    {
      name: "from",
      label: "From",
      type: "date",
      showTime: true,
      defaultValue: dayjs().startOf("day"),
    },
    {
      name: "to",
      label: "To",
      type: "date",
      showTime: true,
      defaultValue: dayjs().endOf("day"),
    },
  ];

  return (
    <TitleBar
      title="Trip Management"
      description="Manage trips, view detailed records and perform admin actions."
      extraContent={
        <div className="flex items-center gap-2">
          <div>
            <Button
              icon={<IoMdRefresh />}
              loading={loading}
              type="primary"
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </div>
          <div>
            <Button type="primary" onClick={handleExport}>
              Export
            </Button>
          </div>
        </div>
      }
    >
      <AdvancedFilters filterFields={fields} applyFilters={applyFilters} />
      <div className="w-full border border-gray-200 rounded-lg p-2 flex justify-start mt-3 mb-3">
        <Segmented
          value={filters.status}
          onChange={(val) => setFilters((prev) => ({ ...prev, status: val }))}
          options={[
            { label: `All (${getStatusCount("all")})`, value: "all" },
            {
              label: `Requested (${getStatusCount("requested")})`,
              value: "requested",
            },
            {
              label: `Upcoming (${getStatusCount("upcoming")})`,
              value: "upcoming",
            },
            { label: `Live (${getStatusCount("live")})`, value: "live" },
            {
              label: `Completed (${getStatusCount("completed")})`,
              value: "completed",
            },
            {
              label: `Cancelled (${getStatusCount("cancelled")})`,
              value: "cancelled",
            },
            {
              label: `Mid-Cancelled (${getStatusCount("mid-cancelled")})`,
              value: "mid-cancelled",
            },
          ]}
          className="
          [&_.ant-segmented-item]:mx-2
      [&_.ant-segmented-item-selected]:bg-blue-500
      [&_.ant-segmented-item-selected]:text-white
    "
        />
      </div>

      <div className="w-full h-full flex flex-col gap-4">
        <div className="flex-grow overflow-auto">
          <TripDetailsTable data={filteredTrips} />
        </div>
      </div>
    </TitleBar>
  );
};

export default TripDetails;
