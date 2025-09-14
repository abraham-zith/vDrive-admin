import React, { useState } from "react";
import {
  Collapse,
  Form,
  Row,
  Col,
  Select,
  Input,
  InputNumber,
  Radio,
  Button,
  DatePicker,
  Slider,
} from "antd";
import { FilterOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
const { Option } = Select;

export interface FieldOption {
  value: string | boolean;
  label: string;
}

export interface FilterField {
  name: string;
  label: string;
  type: "input" | "select" | "radio" | "range" | "time" | "date" | "slider";
  options?: FieldOption[];
  minPlaceholder?: string;
  maxPlaceholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface FilterValues {
  [key: string]: any;
}

interface AdvancedFiltersProps {
  filterFields: FilterField[];
  applyFilters: (values: FilterValues) => void;
  initialValues?: FilterValues;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filterFields,
  applyFilters,
  initialValues = {},
}) => {
  const [activeFilterPanel, setActiveFilterPanel] = useState<string[]>([]);
  const [filterForm] = Form.useForm();

  const handleClearAllFilters = () => {
    filterForm.resetFields();
    applyFilters({});
  };

  const onFilterValuesChange = (
    _changedValues: Record<string, any>,
    allValues: FilterValues
  ) => {
    applyFilters(allValues);
  };

  const renderField = (field: FilterField) => {
    switch (field.type) {
      case "input":
        return <Input placeholder={`Enter ${field.label.toLowerCase()}`} />;
      case "select":
        return (
          <Select placeholder={`Select ${field.label.toLowerCase()}`}>
            {field.options?.map((opt: FieldOption) => (
              <Option key={opt.value.toString()} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        );
      case "radio":
        return (
          <Radio.Group>
            {field.options?.map((opt: FieldOption) => (
              <Radio key={opt.value.toString()} value={opt.value}>
                {opt.label}
              </Radio>
            ))}
          </Radio.Group>
        );
      case "range":
        return (
          <Input.Group compact>
            <Form.Item name={`${field.name}Min`} noStyle>
              <InputNumber
                min={0}
                placeholder={field.minPlaceholder || "Min"}
                style={{ width: "50%" }}
              />
            </Form.Item>
            <Form.Item name={`${field.name}Max`} noStyle>
              <InputNumber
                min={0}
                placeholder={field.maxPlaceholder || "Max"}
                style={{ width: "50%" }}
              />
            </Form.Item>
          </Input.Group>
        );
      case "slider":
        return (
          <Form.Item name={field.name} noStyle>
            <Slider
              range
              min={field.min ?? 0}
              max={field.max ?? 100}
              step={field.step ?? 1}
              defaultValue={[field.min ?? 0, field.max ?? 100]}
            />
          </Form.Item>
        );
      case "time":
        return (
          <DatePicker.TimePicker
            style={{ width: "100%" }}
            use12Hours
            format="hh:mm A"
          />
        );
      case "date":
        return <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />;
      default:
        return null;
    }
  };

  return (
    <Collapse
      activeKey={activeFilterPanel}
      onChange={(key) => setActiveFilterPanel(Array.isArray(key) ? key : [key])}
      style={{ marginBottom: 24, backgroundColor: "white" }}
      expandIconPosition="end"
    >
      <Panel
        header={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FilterOutlined />
            <span
              style={{
                fontSize: "1.125rem",
                lineHeight: "1.75rem",
                fontWeight: 600,
              }}
            >
              Advanced Filters
            </span>
          </div>
        }
        key="advanced-filters"
        extra={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button
              type="text"
              onClick={(e) => {
                e.stopPropagation();
                handleClearAllFilters();
              }}
            >
              Clear All
            </Button>
          </div>
        }
      >
        <Form
          form={filterForm}
          name="advanced_filters"
          onValuesChange={onFilterValuesChange}
          layout="vertical"
          initialValues={initialValues}
        >
          <Row gutter={[16, 16]}>
            {filterFields.map((field) => (
              <Col xs={24} sm={12} md={6} key={field.name}>
                <Form.Item
                  name={field.type === "range" ? undefined : field.name}
                  label={field.label}
                >
                  {renderField(field)}
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      </Panel>
    </Collapse>
  );
};

export default AdvancedFilters;
