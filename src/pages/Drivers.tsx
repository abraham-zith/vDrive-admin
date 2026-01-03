import { useState, useEffect } from "react";
import { Button } from "antd";
import { IoMdRefresh } from "react-icons/io";
import DriverTable from "../components/DriverTable/DriverTable";
import dayjs from "dayjs";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import AdvancedFilters from "../components/AdvancedFilters/AdvanceFilters";
import type { FilterField } from "../components/AdvancedFilters/AdvanceFilters";
import { IoPersonAddOutline } from "react-icons/io5";
import AddDriverModal from "../components/DriverDetails/AddDriver";
import axiosIns from "../api/axios";
export type DriverStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "pending"
  | "blocked";
export type DriverRole = "premium" | "elite" | "normal";

export interface Driver {
  driverId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  profilePicUrl: string;
  dob: string;
  gender: "male" | "female" | "other";
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  role: DriverRole;
  status: DriverStatus;
  rating: number;
  totalTrips: number;
  availability: {
    online: boolean;
    lastActive: string | null;
  };
  kyc: {
    overallStatus: "verified" | "pending" | "rejected" | string;
    verifiedAt: string | null;
  };
  credit: {
    limit: number;
    balance: number;
    totalRecharged: number;
    totalUsed: number;
    lastRechargeAt: string | null;
  };
  recharges: {
    transactionId: string;
    amount: number;
    paymentMethod: string;
    reference: string;
    status: string;
    createdAt: string;
  }[];
  creditUsage: {
    usageId: string;
    tripId: string;
    amount: number;
    type: string;
    description: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
  vehicle: {
    vehicleId: string;
    vehicleNumber: string;
    vehicleModel: string;
    vehicleType: string;
    fuelType: string;
    registrationDate: string;
    insuranceExpiry: string;
    rcDocumentUrl: string;
    status: boolean;
  } | null;
  documents: {
    documentId: string;
    documentType: string;
    documentNumber: string;
    documentUrl: string;
    licenseStatus: string;
    expiryDate: string;
  }[];
  performance: {
    averageRating: number;
    totalTrips: number;
    cancellations: number;
    lastActive: string | null;
  };
  payments: {
    totalEarnings: number;
    pendingPayout: number;
    commissionPaid: number;
  };
  activityLogs: {
    logId: string;
    action: string;
    details: string;
    createdAt: string;
  }[];
}

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
 
  const [openAdd, setOpenAdd] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredData, setFilteredData] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await axiosIns.get("/api/users/drivers");
      const driverData = response.data?.data?.users || [];
      setDrivers(driverData);
      setFilteredData(driverData);
    } catch (err) {
      console.error("Failed to fetch drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const applyFilters = (values: Record<string, any>) => {
    let tempData = drivers;
    if (values?.status?.length > 0) {
      const selectedStatuses = Array.isArray(values?.status)
        ? values?.status
        : [values?.status];
      tempData = tempData.filter((user) =>
        selectedStatuses.includes(user?.status)
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
        dayjs(user?.createdAt).isSame(values?.joined, "day")
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
        <div className="flex items-center gap-2">
          <div>
            <Button
              icon={<IoPersonAddOutline />}
              type="primary"
              onClick={() => setOpenAdd(true)}
            >
              Add Drivers
            </Button>
          </div>
          <div>
            <Button
              icon={<IoMdRefresh />}
              loading={loading}
              type="primary"
              onClick={fetchDrivers}
            >
              Refresh
            </Button>
          </div>
        </div>
      }
    >
      <div className="w-full h-full flex flex-col gap-4">
        {" "}
        <AdvancedFilters filterFields={fields} applyFilters={applyFilters} />
        <div className="flex-grow overflow-hidden">
          <DriverTable data={filteredData} onRefresh={fetchDrivers} />
        </div>
        <AddDriverModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onSubmit={(newDriver) => {
            setDrivers([newDriver, ...drivers]);
            setFilteredData([newDriver, ...filteredData]);
            setOpenAdd(false);
          }}
        />
      </div>
    </TitleBar>
  );
};

export default Drivers;
