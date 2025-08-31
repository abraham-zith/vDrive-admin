import { Button, DatePicker, Select, Row, Col } from "antd";
import { useState, useEffect } from "react";
import type { UserRole, UserStatus } from "../../pages/Users";

// --- Constants remain the same ---
const ROLES: UserRole[] = [
  "Admin",
  "Manager",
  "Developer",
  "Tester",
  "Support",
  "Designer",
  "Analyst",
];
const STATUSES: UserStatus[] = ["Active", "Inactive", "Suspended"];

export interface Filters {
  role: UserRole[];
  status: UserStatus[];
  lastLogin: Date | null;
  createdAt: Date | null;
}

interface FilterProps {
  setFilters: (filters: Filters) => void;
}

const initialState: Filters = {
  role: [],
  status: [],
  lastLogin: null,
  createdAt: null,
};

const Filter = ({ setFilters }: FilterProps) => {
  const [localFilters, setLocalFilters] = useState<Filters>(initialState);

  useEffect(() => {
    setFilters(localFilters);
  }, [localFilters, setFilters]);

  const handleFilterChange = <K extends keyof Filters>(
    key: K,
    value: Filters[K]
  ) => {
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setLocalFilters(initialState);
  };

  return (
    <Row gutter={[16, 16]} align="bottom" justify="end">
      <Col xs={24} sm={12} md={6} lg={5}>
        <Select
          style={{ width: "100%" }}
          allowClear
          mode="multiple"
          value={localFilters.role}
          maxTagCount="responsive"
          options={ROLES.map((role) => ({ label: role, value: role }))}
          onChange={(value) => handleFilterChange("role", value)}
          placeholder="Role"
        />
      </Col>
      <Col xs={24} sm={12} md={6} lg={5}>
        <Select
          style={{ width: "100%" }}
          allowClear
          mode="multiple"
          value={localFilters.status}
          maxTagCount="responsive"
          options={STATUSES.map((status) => ({ label: status, value: status }))}
          onChange={(value) => handleFilterChange("status", value)}
          placeholder="Status"
        />
      </Col>
      <Col xs={24} sm={12} md={6} lg={5}>
        <DatePicker
          style={{ width: "100%" }}
          value={localFilters.lastLogin}
          onChange={(date: Date | null) =>
            handleFilterChange("lastLogin", date)
          }
          placeholder="Last Login"
        />
      </Col>
      <Col xs={24} sm={12} md={6} lg={5}>
        <DatePicker
          style={{ width: "100%" }}
          value={localFilters.createdAt}
          onChange={(date: Date | null) =>
            handleFilterChange("createdAt", date)
          }
          placeholder="Created At"
        />
      </Col>
      <Col>
        <Button onClick={handleReset}>Reset</Button>
      </Col>
    </Row>
  );
};

export default Filter;
