import React from "react";
import {
  Masonry,
  Card,
  Tag,
  Descriptions,
  Divider,
  Typography,
  Button,
} from "antd";
import { GrPhone, GrLocation } from "react-icons/gr";
import {
  IoReceiptOutline,
  IoPeopleOutline,
  IoCalendarOutline,
} from "react-icons/io5";
import {
  UserOutlined,
  CarOutlined,
  MessageOutlined,
  FolderOutlined,
  MoneyCollectOutlined,
  HistoryOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import {
  buildTripHistory,
  type TripHistoryItem,
  type TripDetailsType,
} from "../../store/slices/tripSlice";
const { Text } = Typography;

interface Props {
  trip: TripDetailsType;
}

const DetailCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <Card
    size="small"
    style={{
      marginBottom: 16,
      border: "1px solid #d9d9d9",
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      borderRadius: 8,
    }}
    title={
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon}
        <span style={{ fontSize: 14, fontWeight: 500 }}>{title}</span>
      </div>
    }
  >
    {children}
  </Card>
);

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  if (isNaN(date.getTime())) return "—";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  return `${day}-${month}-${year}, ${hours}:${minutes} ${ampm}`;
};

const changeTripHistory = (change: TripHistoryItem) => {
  switch (change.change_type) {
    case "FARE":
      return (
        <>
          <span className="line-through text-gray-500 text-xs">
            ₹{change.old_value?.total_fare ?? "—"}
          </span>
          <ArrowRightOutlined />
          <span className="text-xs">
            ₹{change.new_value?.total_fare ?? "—"}
          </span>
        </>
      );

    case "DRIVER":
      return (
        <>
          <span className="line-through text-gray-500 text-xs">
            {change.old_value?.driver_name ?? "None"}
          </span>
          <ArrowRightOutlined />
          <span className="text-xs">
            {change.new_value?.driver_name ?? "—"}
          </span>
        </>
      );

    case "SCHEDULE_TIME":
      return (
        <>
          <span className="line-through text-gray-500 text-xs">
            {formatDateTime(change.old_value?.scheduled_start_time)}
          </span>
          <ArrowRightOutlined />
          <span className="text-xs">
            {formatDateTime(change.new_value?.scheduled_start_time)}
          </span>
        </>
      );

    case "STATUS":
      return (
        <>
          <span className="line-through text-gray-500 text-xs">
            {change.old_value?.trip_status}
          </span>
          <ArrowRightOutlined />
          <span className="text-xs">{change.new_value?.trip_status}</span>
        </>
      );

    default:
      return null;
  }
};

const changeTripContent = (change: TripDetailsType["trip_changes"][number]) => {
  switch (change.change_type) {
    case "FARE":
      return "User requested fare change";

    case "DRIVER":
      return "User requested driver change";

    case "SCHEDULE_TIME":
      return "User requested time change";

    default:
      return "User requested status change";
  }
};

const timelineItems = (trip: TripDetailsType | null) => [
  {
    label: "Scheduled Time",
    value: formatDateTime(trip?.scheduled_start_time),
    bg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    icon: <CalendarOutlined />,
  },
  {
    label: "Start Time",
    value: formatDateTime(trip?.actual_pickup_time),
    bg: "bg-green-100",
    iconColor: "text-green-600",
    icon: <PlayCircleOutlined />,
  },
  {
    label: "End Time",
    value: trip?.actual_drop_time
      ? formatDateTime(trip.actual_drop_time)
      : "In Progress",

    bg: "bg-blue-100",
    iconColor: "text-blue-600",
    icon: <CheckCircleOutlined />,
  },
];

const TripDetailsMasonry: React.FC<Props> = ({ trip }) => {
  const items = timelineItems(trip);
  const tripHistory = trip ? buildTripHistory(trip) : [];
  const cards = [
    {
      key: "basic-info",
      data: (
        <DetailCard
          icon={<IoReceiptOutline size={20} className="text-indigo-600" />}
          title="Basic Information"
        >
          {/*  Service / Type / Status */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Tag>{trip?.service_type}</Tag>
            <Tag>{trip?.ride_type}</Tag>
            <Tag
              color={
                trip.trip_status === "LIVE"
                  ? "green"
                  : trip.trip_status === "COMPLETED"
                    ? "blue"
                    : trip.trip_status === "REQUESTED"
                      ? "yellow"
                      : trip.trip_status === "CANCELLED"
                        ? "red"
                        : trip.trip_status === "MID-CANCELLED"
                          ? "pink"
                          : "orange"
              }
            >
              {trip?.trip_status}
            </Tag>
          </div>

          {/*  Pickup / Drop */}
          <Descriptions layout="vertical" size="small" colon={false} column={1}>
            <Descriptions.Item>
              <div className="flex w-full items-start">
                {/* Pickup */}
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                    <GrLocation className="text-green-600" />
                    <strong>Pickup Location</strong>
                  </div>
                  <p className="m-1 text-xs text-gray-600 leading-relaxed break-words">
                    {trip?.pickup_address}
                  </p>
                </div>

                <div className="w-px bg-gray-300 self-stretch" />

                {/* Drop */}
                <div className="flex-1 pl-3">
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                    <GrLocation className="text-red-600" />
                    <strong>Drop Location</strong>
                  </div>
                  <p className="m-1 text-xs text-gray-600 leading-relaxed break-words">
                    {trip?.drop_address}
                  </p>
                </div>
              </div>
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Descriptions column={1} size="small">
            <Descriptions.Item>
              <div className="flex gap-2">
                <div className="w-[70px] border border-gray-300 bg-gray-300 rounded px-2 py-2 text-center">
                  <strong className="block text-[9px] leading-tight">
                    {trip?.Estimate_km}
                  </strong>
                  <p className="m-0 text-[8px] leading-tight">Estimate Km</p>
                </div>

                <div className="w-[70px] border border-gray-300 bg-gray-300 rounded px-2 py-2 text-center">
                  <strong className="block text-[9px] leading-tight">
                    {trip?.trip_duration_minutes}
                  </strong>
                  <p className="m-0 text-[8px] leading-tight">Duration</p>
                </div>

                <div className="w-[70px] border border-gray-300 bg-gray-300 rounded px-2 py-2 text-center">
                  <strong className="block text-[9px] leading-tight">
                    {trip?.distance_km}
                  </strong>
                  <p className="m-0 text-[8px] leading-tight">Covered Km</p>
                </div>

                <div className="w-[70px] border border-violet-300 bg-violet-100 rounded px-2 py-2 text-center">
                  <strong className="block text-[9px] leading-tight">
                    ₹{trip?.total_fare}
                  </strong>
                  <p className="m-0 text-[8px] leading-tight">Total Fare</p>
                </div>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </DetailCard>
      ),
    },

    {
      key: "payment",
      data: (
        <DetailCard
          icon={<FolderOutlined style={{ fontSize: 16, color: "#4f46e5" }} />}
          title="Payment Details"
        >
          <Descriptions column={1} size="small">
            <Descriptions.Item>
              <div className="flex items-center gap-8">
                <div>
                  <p className="m-0 text-[10px] text-gray-500">Amount</p>
                  <strong className="block text-[11px]">
                    ₹{trip?.total_fare}
                  </strong>
                </div>

                <div className="w-px h-6 bg-gray-300" />

                <div>
                  <p className="m-0 text-[10px] text-gray-500">Method</p>
                  <strong className="block text-[11px]">
                    {trip?.payment_method}
                  </strong>
                </div>

                <div className="w-px h-6 bg-gray-300" />

                <div>
                  <p className="m-0 text-[10px] text-gray-500">Status</p>
                  <strong
                    className={`inline-block px-1.5 py-[1px] text-[10px] rounded border font-medium
              ${
                trip?.payment_status === "PAID"
                  ? "bg-green-100 text-green-700 border-green-300"
                  : trip?.payment_status === "PENDING"
                    ? "bg-amber-100 text-amber-700 border-amber-300"
                    : trip?.payment_status === "FAILED"
                      ? "bg-red-100 text-red-700 border-red-300"
                      : "bg-gray-100 text-gray-600 border-gray-300"
              }
            `}
                  >
                    {trip?.payment_status}
                  </strong>
                </div>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </DetailCard>
      ),
    },

    {
      key: "farebreakdown",
      data: (
        <DetailCard
          icon={
            <MoneyCollectOutlined style={{ fontSize: 20, color: "#4f46e5" }} />
          }
          title="Fare Breakdown"
        >
          <Descriptions.Item>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-2 items-center text-sm ">
              <div className="text-gray-800">
                Base Fare
                <span className="text-gray-400 ml-1">(Fixed Minimum)</span>
              </div>
              <div className="font-medium text-right justify-self-end">
                ₹{trip?.base_fare ?? 0}
              </div>
            </div>
          </Descriptions.Item>

          <Descriptions.Item>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-2 items-center text-sm mt-1">
              <div className="text-gray-800">
                Distance Fare
                <span className="text-gray-400 ml-1">(Per KM)</span>
              </div>
              <div className="font-medium text-right justify-self-end">
                ₹{trip?.distance_fare}
              </div>
            </div>
          </Descriptions.Item>

          <Descriptions.Item>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-2 items-center text-sm mt-1">
              <div className="text-gray-800">
                Time Fare
                <span className="text-gray-400 ml-1">(Per minute)</span>
              </div>
              <div className="font-medium text-right justify-self-end">
                ₹{trip?.time_fare}
              </div>
            </div>
          </Descriptions.Item>

          <Divider style={{ margin: "10px 2px" }} />

          <Descriptions.Item>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-2 items-center text-sm ">
              <div className="text-gray-800">
                Waiting Fare
                <span className="text-gray-400 ml-1">
                  (After {trip?.waiting_time_minutes} min)
                </span>
              </div>
              <div className="font-medium text-right justify-self-end">
                ₹{trip?.waiting_charges ?? 0}
              </div>
            </div>
          </Descriptions.Item>

          <Descriptions.Item>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-2 items-center text-sm mt-1">
              <div className="text-gray-800">Driver Allowance</div>
              <div className="font-medium text-right justify-self-end">
                ₹{trip?.driver_allowance ?? 0}
              </div>
            </div>
          </Descriptions.Item>

          <Descriptions.Item>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-2 items-center text-sm mt-1">
              <div className="text-gray-800">
                Return Compensation
                <span className="text-gray-400 ml-1">({trip?.ride_type} )</span>
              </div>
              <div className="font-medium text-right justify-self-end">
                ₹ {trip?.return_compensation}
              </div>
            </div>
          </Descriptions.Item>

          <Descriptions.Item>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-2 items-center text-sm mt-1">
              <div className="text-gray-800">
                Surge Pricing
                <span className="text-gray-400 ml-1">
                  ({trip?.surge_multiplier} )
                </span>
              </div>
              <div className="font-medium text-right justify-self-end">
                ₹ {trip?.surge_pricing}
              </div>
            </div>
          </Descriptions.Item>

          <Divider style={{ margin: "10px 2px" }} />

          <Descriptions.Item>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-2 items-center text-sm ">
              <div className="text-gray-800">Tip</div>
              <div className="font-medium text-right justify-self-end">
                ₹ {trip?.tip ?? 0}
              </div>
            </div>
          </Descriptions.Item>

          <Descriptions.Item>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-2 items-center text-sm mt-1">
              <div className="text-gray-800">Toll Charges</div>
              <div className="font-medium text-right justify-self-end">
                ₹ {trip?.toll_charges ?? 0}
              </div>
            </div>
          </Descriptions.Item>

          <Descriptions.Item>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-2 items-center text-sm mt-1">
              <div className="text-gray-800">Night Charges</div>
              <div className="font-medium text-right justify-self-end">
                ₹ {trip?.night_charges ?? 0}
              </div>
            </div>
          </Descriptions.Item>

          <Divider style={{ margin: "10px 2px" }} />

          <Descriptions.Item>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-2 items-center text-sm mt-1">
              <div className="text-gray-800">Discount / Promo</div>
              <div className="font-medium text-right justify-self-end">
                ₹ {trip?.discount ?? 0}
              </div>
            </div>
          </Descriptions.Item>

          <Divider style={{ margin: "10px 2px" }} />

          <Descriptions.Item>
            <div
              className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center
                   rounded-md border border-blue-200
                   bg-blue-50 px-3 py-2 text-sm"
            >
              <div className="text-blue-800 font-medium">Subtotal</div>

              <div className="font-semibold text-blue-900 justify-self-end">
                ₹ {trip?.subtotal ?? 0}
              </div>
            </div>
          </Descriptions.Item>

          <Divider style={{ margin: "10px 2px" }} />

          <Descriptions.Item>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-2 items-center text-sm ">
              <div className="text-gray-800 text-bold">GST</div>
              <div className="font-medium text-right justify-self-end">
                ₹ {trip?.gst_amount ?? 0}
              </div>
            </div>
          </Descriptions.Item>

          <Descriptions.Item>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-2 items-center text-sm mt-1">
              <div className="text-gray-800">Platform Fee</div>
              <div className="font-medium text-right justify-self-end">
                ₹ {trip?.platform_fee}
              </div>
            </div>
          </Descriptions.Item>

          <Divider style={{ margin: "10px 2px" }} />

          <Descriptions.Item>
            <div
              className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center
                      rounded-md border border-violet-200
                      bg-violet-50 px-3 py-2 text-sm"
            >
              <div className="text-violet-800 font-semibold">Total Fare</div>

              <div className="font-semibold text-violet-900 justify-self-end">
                ₹ {trip?.total_fare}
              </div>
            </div>
          </Descriptions.Item>
        </DetailCard>
      ),
    },

    {
      key: "tripchangehistory",
      data: (
        <DetailCard
          icon={<HistoryOutlined style={{ fontSize: 18, color: "#4f46e5" }} />}
          title="Trip Change History"
        >
          <div className="h-[60vh] flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {!tripHistory || tripHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">
                  No changes have been made to this trip yet
                </div>
              ) : (
                tripHistory.map((change, index) => (
                  <div
                    key={change.id ?? index}
                    className="border-b pb-2 last:border-b-0"
                  >
                    <div className="flex justify-between items-center text-sm">
                      <b>{change.change_type}</b>
                      <span className="border border-blue-400 text-blue-600 px-1.5 py-0.5 rounded text-[10px]">
                        {change.changed_by}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs">
                      {changeTripHistory(change)}
                    </div>

                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <p>{formatDateTime(change.changed_at)}</p>
                      {change.notes && (
                        <p className="text-violet-600 truncate max-w-[60%]">
                          {change.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DetailCard>
      ),
    },

    {
      key: "triptime",
      data: (
        <DetailCard
          icon={<IoCalendarOutline size={18} className="text-indigo-600" />}
          title="Trip Timeline"
        >
          <div className="pl-3">
            {items.map((item, index) => (
              <div key={index} className="relative flex gap-3 pb-5">
                {index !== items.length - 1 && (
                  <span className="absolute left-3.5 top-7 h-full w-px bg-gray-200" />
                )}

                <div
                  className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full ${item.bg}`}
                >
                  <span className={`text-sm ${item.iconColor}`}>
                    {item.icon}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-gray-400 leading-tight">
                    {item.label}
                  </p>
                  <p className="text-sm text-gray-800 leading-tight">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DetailCard>
      ),
    },

    {
      key: "User-Trip",
      data: (
        <DetailCard
          icon={<HistoryOutlined style={{ fontSize: 18, color: "#4f46e5" }} />}
          title="User Trip Changes History"
        >
          {!trip?.trip_changes || trip.trip_changes.length === 0 ? (
            <div className="py-4 text-center text-gray-400 text-xs">
              No changes have been made to this trip yet
            </div>
          ) : (
            <div className="space-y-3">
              {trip.trip_changes.map((change, index) => (
                <div
                  key={change.id ?? index}
                  className="border-b pb-2 last:border-b-0"
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold">{change.change_type}</span>
                    <span className="inline-block border border-yellow-400 text-yellow-600 px-1.5 py-0.5 rounded text-[10px]">
                      {change.changed_by}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs">
                    {changeTripHistory(change)}
                  </div>

                  <div className="flex justify-between text-[11px] text-gray-400 mt-2">
                    <p>{formatDateTime(change.changed_at)}</p>
                    <p className="text-violet-700">
                      {changeTripContent(change)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DetailCard>
      ),
    },

    {
      key: "userdriverdetals",
      data: (
        <DetailCard
          icon={<IoPeopleOutline size={20} className="text-indigo-600" />}
          title="User & Driver Details"
        >
          <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
            {/* Customer */}
            <div className="pr-2">
              <div className="text-xs font-semibold mb-2">
                <UserOutlined className="text-yellow-500 bg-yellow-200 rounded px-2 py-1 mr-1" />
                CUSTOMER
              </div>

              <Text strong>{trip.user_name}</Text>

              <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                <GrPhone /> {trip.user_phone}
              </div>

              <div className="flex gap-1 pt-2">
                <Button
                  size="small"
                  className="h-6 px-1 text-[10px] flex items-center gap-1"
                >
                  <GrPhone className="text-[12px]" /> Call
                </Button>

                <Button
                  size="small"
                  className="h-6 px-1 text-[10px] flex items-center gap-1"
                >
                  <MessageOutlined className="text-[12px]" /> Msg
                </Button>
              </div>
            </div>

            {/* ✅ Vertical Line (ALWAYS visible) */}
            <div className="w-px bg-gray-300 " />

            {/* Driver */}
            <div className="pl-2">
              <div className="text-xs font-semibold mb-2">
                <CarOutlined className="text-green-500 bg-green-200 rounded px-2 py-1 mr-1" />
                DRIVER
              </div>

              {trip?.driver_name ? (
                <>
                  <Text strong>{trip.driver_name}</Text>

                  <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                    <GrPhone /> {trip.driver_phone}
                  </div>

                  <div className="flex gap-1 pt-2">
                    <Button
                      size="small"
                      className="h-6 px-1 text-[10px] flex items-center gap-1"
                    >
                      <GrPhone className="text-[12px]" /> Call
                    </Button>

                    <Button
                      size="small"
                      className="h-6 px-1 text-[10px] flex items-center gap-1"
                    >
                      <MessageOutlined className="text-[12px]" /> Msg
                    </Button>
                  </div>
                </>
              ) : (
                <div className="inline-block border border-dashed border-gray-400 text-gray-500 px-3 py-1 rounded text-xs">
                  Not Assigned
                </div>
              )}
            </div>
          </div>
        </DetailCard>
      ),
    },
  ];

  return (
    <Masonry
      columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
      gutter={10}
      items={cards}
      itemRender={(item) => item.data}
    />
  );
};

export default TripDetailsMasonry;
