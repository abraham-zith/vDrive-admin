import { Card, Tag } from "antd";
import { format } from "date-fns-tz";
import type { Filters } from "../Filter/Filter";
import type { UserRole, UserStatus } from "../../pages/Users";
import { capitalize } from "../../utilities/capitalize";

type FilterKey = keyof Filters;

interface AppliedFiltersProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

const filterColors: Record<FilterKey, string> = {
  role: "blue",
  status: "green",
  lastLogin: "purple",
  createdAt: "orange",
};

const AppliedFilters = ({ filters, setFilters }: AppliedFiltersProps) => {
  const handleRemove = (
    key: FilterKey,
    valueToRemove?: UserRole | UserStatus
  ) => {
    const currentFilter = filters[key];
    if (Array.isArray(currentFilter)) {
      setFilters({
        ...filters,
        [key]: currentFilter.filter((v) => v !== valueToRemove) as any, // Type assertion needed due to complex union type
      });
    } else {
      setFilters({ ...filters, [key]: null });
    }
  };

  const hasFilters = Object.values(filters).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== null;
  });

  if (!hasFilters) {
    return null;
  }

  return (
    // <Badge.Ribbon text="Applied Filters" >
    <Card size="small" className="w-full">
      <div className="w-full p-4 flex items-center gap-[6px] flex-wrap">
        {Object.entries(filters).map(([key, value]) => {
          if (!value) return null;

          const tagColor = filterColors[key as FilterKey];

          if (Array.isArray(value)) {
            return value.map((item: UserRole | UserStatus) => (
              <Tag
                key={`${key}-${item}`}
                closable
                onClose={() => handleRemove(key as FilterKey, item)}
                color={tagColor}
              >
                {`${capitalize(key)}: ${capitalize(item)}`}
              </Tag>
            ));
          }

          const label: string =
            value instanceof Date
              ? format(value, "MM/dd/yyyy", {
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                })
              : String(value);
          return (
            <Tag
              key={key}
              closable
              onClose={() => handleRemove(key as FilterKey)}
              color={tagColor}
            >
              {`${capitalize(key)}: ${capitalize(label)}`}
            </Tag>
          );
        })}
      </div>
    </Card>
    // </Badge.Ribbon>
  );
};

export default AppliedFilters;
