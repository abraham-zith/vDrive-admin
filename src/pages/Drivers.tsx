import { useState } from "react";
import DriverTable from "../components/DriverTable/DriverTable";
import Filter from "../components/Filter/Filter";
import AppliedFilters from "../components/AppliedFilters/AppliedFilters";
import { isSameDay } from "date-fns";

export type UserStatus = "active" | "inactive" | "suspended";

export interface Driver {
  driver_id: string;
  full_name: string;
  phone_number: string;
  license_number: string;
  license_expiry_date: string;
  vehicle_id: string;
  rating: number;
  total_trips: number;
  joined_at: string;
  status: UserStatus;
  profile_url: string;
}

const DATA: Driver[] = [
  {
    driver_id: "d1a5e9d2-9f4e-4c1f-8e12-7b5d2f8c9a01",
    full_name: "Amit Sharma",
    phone_number: "+91-9876543210",
    license_number: "DL04AB1234",
    license_expiry_date: "2027-05-20",
    vehicle_id: "v1a5e9d2-1f4e-4c1f-8e12-7b5d2f8c9a11",
    status: "active",
    rating: 4.85,
    total_trips: 1520,
    joined_at: "2021-03-12T10:15:30Z",
    profile_url:
      "https://cdn.imgbin.com/15/3/18/imgbin-computer-icons-woman-avatar-avatar-girl-TBWeJMyXNwtNQA661FQ0rZSv2.jpg",
  },
  {
    driver_id: "b2f4d8c3-7e9d-42b1-9f34-8a2e1c7b9c02",
    full_name: "Priya Singh",
    phone_number: "+91-9123456789",
    license_number: "MH20CD5678",
    license_expiry_date: "2026-11-15",
    vehicle_id: "v2f4d8c3-2e9d-42b1-9f34-8a2e1c7b9c22",
    status: "inactive",
    rating: 4.62,
    total_trips: 980,
    joined_at: "2020-07-21T08:45:10Z",
    profile_url: "",
  },
  {
    driver_id: "c3e7f9b4-8d2f-43a2-bf12-9b3c1d8e2d03",
    full_name: "Rohit Verma",
    phone_number: "+91-9988776655",
    license_number: "KA05EF9012",
    license_expiry_date: "2029-02-10",
    vehicle_id: "v3e7f9b4-3d2f-43a2-bf12-9b3c1d8e2d33",
    status: "suspended",
    rating: 3.95,
    total_trips: 450,
    joined_at: "2022-01-05T12:30:00Z",
    profile_url: "https://example.com/profiles/rohit_verma.jpg",
  },
  {
    driver_id: "d4a8g1c5-9e3f-45c2-bf67-1c4d2e9f3d04",
    full_name: "Sneha Iyer",
    phone_number: "+91-9090909090",
    license_number: "TN10GH3456",
    license_expiry_date: "2028-07-30",
    vehicle_id: "v4a8g1c5-4e3f-45c2-bf67-1c4d2e9f3d44",
    status: "active",
    rating: 4.92,
    total_trips: 2100,
    joined_at: "2019-10-18T09:20:00Z",
    profile_url: "https://example.com/profiles/sneha_iyer.jpg",
  },
  {
    driver_id: "e5b9h2d6-0f4g-46d3-cf78-2d5e3f0g4e05",
    full_name: "Arjun Nair",
    phone_number: "+91-8765432109",
    license_number: "KL07IJ7890",
    license_expiry_date: "2025-12-25",
    vehicle_id: "v5b9h2d6-5f4g-46d3-cf78-2d5e3f0g4e55",
    status: "active",
    rating: 4.4,
    total_trips: 1330,
    joined_at: "2021-08-02T11:00:00Z",
    profile_url: "https://example.com/profiles/arjun_nair.jpg",
  },
];
export interface Filters {
  status: UserStatus[];
  joined_at: Date | null;
  license_expiry_date: Date | null;
}
const Users = () => {
  const [filters, setFilters] = useState<Filters>({
    status: [],
    joined_at: null,
    license_expiry_date: null,
  });

  const STATUSES = ["active", "inactive", "suspended"];

  const filterFields = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: STATUSES.map((s) => ({ label: s, value: s })),
      mode: "multiple" as const,
    },
    { key: "joined_at", label: "Joined At", type: "date" as const },
    {
      key: "license_expiry_date",
      label: "License Expiry Date",
      type: "date" as const,
    },
  ];

  const filteredData = DATA.filter((user) => {
    if (filters.status.length > 0 && !filters.status.includes(user.status)) {
      return false;
    }

    if (
      filters.joined_at &&
      !isSameDay(new Date(user.joined_at), filters.joined_at)
    ) {
      return false;
    }
    if (
      filters.license_expiry_date &&
      !isSameDay(
        new Date(user.license_expiry_date),
        filters.license_expiry_date
      )
    ) {
      return false;
    }
    return true;
  });
  return (
    <div className="w-full h-full flex flex-col p-[10px] gap-[6px]">
      <Filter<Filters>
        fields={filterFields}
        initialValues={filters}
        onChange={setFilters}
      />

      <AppliedFilters<Filters>
        filters={filters}
        setFilters={setFilters}
        labels={{
          status: "Status",
          joined_at: "Joined At",
          license_expiry_date: "License Expiry Date",
        }}
        colors={{
          status: "green",
          joined_at: "purple",
          license_expiry_date: "orange",
        }}
      />

      <div className="flex-grow overflow-hidden">
        <DriverTable data={filteredData} />
      </div>
    </div>
  );
};

export default Users;
