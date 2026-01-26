import React, { useEffect, useState } from "react";
import { Button, Table, Space, Card, Tag, Modal, Spin } from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { IoAdd } from "react-icons/io5";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchPricingFareRules,
  clearFareRules,
  setPage,
  setPageSize,
} from "../store/slices/pricingFareRulesSlice";
import type { PricingFareRule } from "../store/slices/pricingFareRulesSlice";
import type { ColumnsType } from "antd/es/table";
import PricingPreview from "../components/DriverPricing/PricingPreview";
import dayjs from "dayjs";

// Helper to transform PricingFareRule time_slots to PricingPreview format
const transformSlotsForPreview = (rule: PricingFareRule) => {
  const transformed: any = {
    "normal-driver": [],
    "premium-driver": [],
    "elite-driver": [],
  };

  if (rule.time_slots) {
    rule.time_slots.forEach((slot, index) => {
      if (transformed[slot.driver_types]) {
        transformed[slot.driver_types].push({
          id: index + 1,
          day: slot.day,
          timeRange: [
            dayjs(slot.from_time, "HH:mm:ss"),
            dayjs(slot.to_time, "HH:mm:ss"),
          ],
          price: slot.price,
        });
      }
    });
  }
  return transformed;
};

const PricingAndFareRules: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [previewRule, setPreviewRule] = useState<PricingFareRule | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Redux state
  const { fareRules, isLoading, total, currentPage, pageSize } = useAppSelector(
    (state) => state.pricingFareRules,
  );

  // Debug: Log loading state changes
  console.log(
    "Pricing Table - isLoading:",
    isLoading,
    "fareRules count:",
    fareRules.length,
  );

  console.log({ previewRule });
  // Fetch data on mount
  useEffect(() => {
    console.log("Fetching pricing fare rules...");
    dispatch(
      fetchPricingFareRules({
        page: currentPage,
        limit: pageSize,
        include_time_slots: true,
      }),
    );

    return () => {
      // dispatch(clearFareRules());
    };
  }, [dispatch, currentPage, pageSize]);

  // Handle pagination change
  const handleTableChange = (pagination: any) => {
    if (pagination.current !== currentPage) {
      dispatch(setPage(pagination.current));
    }
    if (pagination.pageSize !== pageSize) {
      dispatch(setPageSize(pagination.pageSize));
    }
  };

  const handleEdit = (record: PricingFareRule) => {
    navigate(`/PricingAndFareRules/pricing/${record.id}`);
  };

  const handleView = (record: PricingFareRule) => {
    setPreviewRule(record);
    setIsPreviewOpen(true);
  };

  // Column definitions
  const columns: ColumnsType<PricingFareRule> = [
    {
      title: "Country",
      dataIndex: "country_id", // Should probably resolve name
      key: "country_name",
      width: 120,
      render: () => "India", // Placeholder
    },
    {
      title: "State",
      dataIndex: "state_id", // Should probably resolve name
      key: "state_name",
      width: 120,
      render: () => "Tamil Nadu", // Placeholder
    },
    {
      title: "District (City)", // Updated label based on schema confusion
      dataIndex: "district_name", // Displaying City Name for "District" column
      key: "district_name",
      width: 150,
      ellipsis: true,
      render: (text, record) => record.district_name || "All",
    },
    {
      title: "Area",
      dataIndex: "area_name", // Displaying Area Name
      key: "area_name",
      width: 150,
      ellipsis: true,
      render: (text) => text || "All",
    },
    {
      title: "Hotspot Name",
      dataIndex: "hotspot_name",
      key: "hotspot_name",
      width: 150,
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "Is Hotspot",
      dataIndex: "is_hotspot",
      key: "is_hotspot",
      width: 120,
      align: "center",
      render: (value: boolean) => (
        <Tag color={value ? "blue" : "default"}>{value ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Global Price",
      dataIndex: "global_price",
      key: "global_price",
      width: 120,
      align: "right",
      render: (value: number | string) => `₹${Number(value).toFixed(2)}`,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            View
          </Button>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  if (location.pathname !== "/PricingAndFareRules") {
    return <Outlet />;
  }

  return (
    <TitleBar
      title="Driver Price Management"
      description="Advanced admin interface for pricing control"
      extraContent={
        <div className="flex items-center gap-2">
          <div>
            <Button
              type="primary"
              icon={<IoAdd />}
              onClick={() => navigate("/PricingAndFareRules/pricing")}
            >
              Add Pricing
            </Button>
          </div>
        </div>
      }
    >
      <div className="w-full h-full overflow-y-auto">
        <Card
          title="Pricing & Fare Rules"
          extra={
            <Space>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => console.log("Export CSV")}
              >
                CSV
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => console.log("Export Excel")}
              >
                Excel
              </Button>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={fareRules}
            loading={{
              spinning: isLoading,
              indicator: <LoadingOutlined style={{ fontSize: 48 }} spin />,
              tip: "Loading pricing rules...",
            }}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            size="middle"
          />
        </Card>

        {/* Preview Modal */}
        <Modal
          title="Pricing Rule Preview"
          open={isPreviewOpen}
          onCancel={() => setIsPreviewOpen(false)}
          footer={null}
          width={800}
        >
          {previewRule && (
            <div className="max-h-[70vh] overflow-y-auto">
              {/* Reuse existing Preview Component */}
              <PricingPreview
                country="India" // Placeholder
                state="Tamil Nadu" // Placeholder
                district={previewRule.district_name || "-"} // Mapping City -> District label
                area={previewRule.area_name || "-"} // Mapping Area -> Area label
                pincode={previewRule.pincode || "-"}
                globalPrice={Number(previewRule.global_price)}
                hotspotEnabled={previewRule.is_hotspot}
                hotspotId={previewRule.hotspot_name || ""}
                multiplier={Number(previewRule.multiplier || 1)}
                timeSlots={transformSlotsForPreview(previewRule)}
              />
            </div>
          )}
        </Modal>
      </div>
    </TitleBar>
  );
};

export default PricingAndFareRules;
