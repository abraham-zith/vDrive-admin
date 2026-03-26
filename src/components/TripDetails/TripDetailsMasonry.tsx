import React from "react";
import {
  Masonry, Card, Tag, Descriptions, Divider, Typography, Button,
} from "antd";
import { GrPhone, GrLocation } from "react-icons/gr";
import { IoReceiptOutline, IoPeopleOutline, IoCalendarOutline } from "react-icons/io5";
import {
  UserOutlined, CarOutlined, MessageOutlined, FolderOutlined,
  MoneyCollectOutlined, HistoryOutlined, CalendarOutlined,
  PlayCircleOutlined, CheckCircleOutlined, ArrowRightOutlined,
} from "@ant-design/icons";
import {
  buildTripHistory,
  type TripTransaction,
  type TripDetailsType,
} from "../../store/slices/tripSlice";

const { Text } = Typography;

interface Props {
  trip: TripDetailsType;
}

// ─── DetailCard wrapper ───────────────────────────────────────────────────────
const DetailCard = ({ icon, title, children }: {
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

// ─── Formatters ───────────────────────────────────────────────────────────────
const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  let hours = date.getHours();
  const mins = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day}-${month}-${year}, ${hours}:${mins} ${ampm}`;
};

// ─── Actor badge color ────────────────────────────────────────────────────────
const actorColor = (actor_type: string) => {
  switch (actor_type) {
    case "user": return "border-blue-400   text-blue-600";
    case "driver": return "border-green-400  text-green-600";
    case "admin": return "border-purple-400 text-purple-600";
    case "system": return "border-gray-400   text-gray-500";
    default: return "border-gray-300   text-gray-500";
  }
};

// ─── Render diff for a transaction ────────────────────────────────────────────
const renderTransactionDiff = (tx: TripTransaction) => {
  const oldVal = tx.old_value ?? {};
  const newVal = tx.new_value ?? {};

  switch (tx.event_type) {
    case "fare_updated":
      return (
        <>
          <span className="line-through text-gray-500 text-xs">₹{String(oldVal.total_fare ?? "—")}</span>
          <ArrowRightOutlined />
          <span className="text-xs">₹{String(newVal.total_fare ?? "—")}</span>
        </>
      );

    case "driver_assigned":
    case "driver_reassigned":
      return (
        <>
          <span className="line-through text-gray-500 text-xs">{String(oldVal.driver_id ?? "None")}</span>
          <ArrowRightOutlined />
          <span className="text-xs">{String(newVal.driver_id ?? "—")}</span>
        </>
      );

    case "trip_rescheduled":
    case "scheduled_time_updated":
      return (
        <>
          <span className="line-through text-gray-500 text-xs">
            {formatDateTime(oldVal.scheduled_start_time as string)}
          </span>
          <ArrowRightOutlined />
          <span className="text-xs">
            {formatDateTime(newVal.scheduled_start_time as string)}
          </span>
        </>
      );

    case "trip_requested":
    case "trip_accepted":
    case "trip_started":
    case "trip_completed":
    case "trip_cancelled":
    case "status_changed":
      return (
        <>
          <span className="line-through text-gray-500 text-xs">{String(oldVal.trip_status ?? "—")}</span>
          <ArrowRightOutlined />
          <span className="text-xs">{String(newVal.trip_status ?? "—")}</span>
        </>
      );

    case "pickup_location_updated":
      return (
        <>
          <span className="line-through text-gray-500 text-xs">{String(oldVal.pickup_address ?? "—")}</span>
          <ArrowRightOutlined />
          <span className="text-xs">{String(newVal.pickup_address ?? "—")}</span>
        </>
      );

    case "dropoff_location_updated":
      return (
        <>
          <span className="line-through text-gray-500 text-xs">{String(oldVal.drop_address ?? "—")}</span>
          <ArrowRightOutlined />
          <span className="text-xs">{String(newVal.drop_address ?? "—")}</span>
        </>
      );

    case "payment_status_changed":
      return (
        <>
          <span className="line-through text-gray-500 text-xs">{String(oldVal.payment_status ?? "—")}</span>
          <ArrowRightOutlined />
          <span className="text-xs">{String(newVal.payment_status ?? "—")}</span>
        </>
      );

    case "rating_submitted":
      return (
        <>
          <span className="text-xs text-yellow-500">
            {"★".repeat(Number(newVal.rating ?? 0))}{"☆".repeat(5 - Number(newVal.rating ?? 0))}
          </span>
          <span className="text-xs text-gray-500 ml-1">{String(newVal.rating ?? "—")} / 5</span>
        </>
      );

    case "note_added":
      return (
        <span className="text-xs text-gray-600 italic">
          {String(newVal.notes ?? "Note added")}
        </span>
      );

    default:
      return (
        <span className="text-xs text-gray-500">
          {tx.changed_fields?.join(", ") ?? tx.event_type.replace(/_/g, " ")}
        </span>
      );
  }
};

// ─── Timeline items ───────────────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────────
const TripDetailsMasonry: React.FC<Props> = ({ trip }) => {
  const items = timelineItems(trip);
  const tripHistory = trip ? buildTripHistory(trip) : [];
  const userTxs = trip.trip_transactions?.filter(tx => tx.actor_type === "user") ?? [];

  const cards = [

    // ── 1. Basic Information ──────────────────────────────────────────────────
    {
      key: "basic-info",
      data: (
        <DetailCard
          icon={<IoReceiptOutline size={20} className="text-indigo-600" />}
          title="Basic Information"
        >
          <div className="flex flex-wrap gap-2 mb-3">
            <Tag>{trip?.service_type}</Tag>
            <Tag>{trip?.ride_type}</Tag>
            <Tag
              color={
                trip.trip_status === "LIVE" ? "green"
                  : trip.trip_status === "COMPLETED" ? "blue"
                    : trip.trip_status === "REQUESTED" ? "yellow"
                      : trip.trip_status === "CANCELLED" ? "red"
                        : trip.trip_status === "MID-CANCELLED" ? "pink"
                          : "orange"
              }
            >
              {trip?.trip_status}
            </Tag>
          </div>

          <Descriptions layout="vertical" size="small" colon={false} column={1}>
            <Descriptions.Item>
              <div className="flex w-full items-start">
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

          <div className="flex gap-2">
            {[
              { label: "Estimate Km", value: trip?.Estimate_km, cls: "border-gray-300  bg-gray-300" },
              { label: "Duration", value: trip?.trip_duration_minutes, cls: "border-gray-300  bg-gray-300" },
              { label: "Covered Km", value: trip?.distance_km, cls: "border-gray-300  bg-gray-300" },
              { label: "Total Fare", value: `₹${trip?.total_fare}`, cls: "border-violet-300 bg-violet-100" },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`w-[70px] border ${cls} rounded px-2 py-2 text-center`}>
                <strong className="block text-[9px] leading-tight">{value}</strong>
                <p className="m-0 text-[8px] leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </DetailCard>
      ),
    },

    // ── 2. Payment Details ────────────────────────────────────────────────────
    {
      key: "payment",
      data: (
        <DetailCard
          icon={<FolderOutlined style={{ fontSize: 16, color: "#4f46e5" }} />}
          title="Payment Details"
        >
          <div className="flex items-center gap-8">
            <div>
              <p className="m-0 text-[10px] text-gray-500">Amount</p>
              <strong className="block text-[11px]">₹{trip?.total_fare}</strong>
            </div>
            <div className="w-px h-6 bg-gray-300" />
            <div>
              <p className="m-0 text-[10px] text-gray-500">Method</p>
              <strong className="block text-[11px]">{trip?.payment_method}</strong>
            </div>
            <div className="w-px h-6 bg-gray-300" />
            <div>
              <p className="m-0 text-[10px] text-gray-500">Status</p>
              <strong className={`inline-block px-1.5 py-[1px] text-[10px] rounded border font-medium
                ${trip?.payment_status === "PAID" ? "bg-green-100 text-green-700 border-green-300"
                  : trip?.payment_status === "PENDING" ? "bg-amber-100 text-amber-700 border-amber-300"
                    : trip?.payment_status === "FAILED" ? "bg-red-100   text-red-700   border-red-300"
                      : "bg-gray-100  text-gray-600  border-gray-300"}`}>
                {trip?.payment_status}
              </strong>
            </div>
          </div>
        </DetailCard>
      ),
    },

    // ── 3. Fare Breakdown ─────────────────────────────────────────────────────
    {
      key: "farebreakdown",
      data: (
        <DetailCard
          icon={<MoneyCollectOutlined style={{ fontSize: 20, color: "#4f46e5" }} />}
          title="Fare Breakdown"
        >
          {[
            { label: "Base Fare", sub: "(Fixed Minimum)", value: trip?.base_fare },
            { label: "Distance Fare", sub: "(Per KM)", value: trip?.distance_fare },
            { label: "Time Fare", sub: "(Per minute)", value: trip?.time_fare },
          ].map(({ label, sub, value }) => (
            <div key={label} className="grid grid-cols-[1fr_auto] gap-2 items-center text-sm mt-1">
              <div className="text-gray-800">{label}<span className="text-gray-400 ml-1">{sub}</span></div>
              <div className="font-medium text-right">₹{value ?? 0}</div>
            </div>
          ))}

          <Divider style={{ margin: "10px 2px" }} />

          {[
            { label: "Waiting Fare", sub: `(After ${trip?.waiting_time_minutes} min)`, value: trip?.waiting_charges },
            { label: "Driver Allowance", sub: "", value: trip?.driver_allowance },
            { label: "Return Compensation", sub: `(${trip?.ride_type})`, value: trip?.return_compensation },
            { label: "Surge Pricing", sub: `(${trip?.surge_multiplier}x)`, value: trip?.surge_pricing },
          ].map(({ label, sub, value }) => (
            <div key={label} className="grid grid-cols-[1fr_auto] gap-2 items-center text-sm mt-1">
              <div className="text-gray-800">{label}<span className="text-gray-400 ml-1">{sub}</span></div>
              <div className="font-medium text-right">₹{value ?? 0}</div>
            </div>
          ))}

          <Divider style={{ margin: "10px 2px" }} />

          {[
            { label: "Tip", value: trip?.tip },
            { label: "Toll Charges", value: trip?.toll_charges },
            { label: "Night Charges", value: trip?.night_charges },
          ].map(({ label, value }) => (
            <div key={label} className="grid grid-cols-[1fr_auto] gap-2 items-center text-sm mt-1">
              <div className="text-gray-800">{label}</div>
              <div className="font-medium text-right">₹{value ?? 0}</div>
            </div>
          ))}

          <Divider style={{ margin: "10px 2px" }} />

          <div className="grid grid-cols-[1fr_auto] items-center text-sm mt-1">
            <div className="text-gray-800">Discount / Promo</div>
            <div className="font-medium text-right">- ₹{trip?.discount ?? 0}</div>
          </div>

          <Divider style={{ margin: "10px 2px" }} />

          <div className="grid grid-cols-[1fr_auto] items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm">
            <div className="text-blue-800 font-medium">Subtotal</div>
            <div className="font-semibold text-blue-900 justify-self-end">₹{trip?.subtotal ?? 0}</div>
          </div>

          <Divider style={{ margin: "10px 2px" }} />

          {[
            { label: `GST (${trip?.gst_percentage}%)`, value: trip?.gst_amount },
            { label: "Platform Fee", value: trip?.platform_fee },
          ].map(({ label, value }) => (
            <div key={label} className="grid grid-cols-[1fr_auto] gap-2 items-center text-sm mt-1">
              <div className="text-gray-800">{label}</div>
              <div className="font-medium text-right">₹{value ?? 0}</div>
            </div>
          ))}

          <Divider style={{ margin: "10px 2px" }} />

          <div className="grid grid-cols-[1fr_auto] items-center rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-sm">
            <div className="text-violet-800 font-semibold">Total Fare</div>
            <div className="font-semibold text-violet-900 justify-self-end">₹{trip?.total_fare}</div>
          </div>
        </DetailCard>
      ),
    },

    // ── 4. Full Transaction History ───────────────────────────────────────────
    {
      key: "tripchangehistory",
      data: (
        <DetailCard
          icon={<HistoryOutlined style={{ fontSize: 18, color: "#4f46e5" }} />}
          title="Trip Transaction History"
        >
          <div className="h-[60vh] flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {tripHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">
                  No transaction history for this trip yet
                </div>
              ) : (
                tripHistory.map((tx, index) => (
                  <div key={tx.id ?? index} className="border-b pb-2 last:border-b-0">

                    {/* Header: sequence + event type + actor badge */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-mono">#{tx.sequence_no}</span>
                        <b className="capitalize">{tx.event_type.replace(/_/g, " ")}</b>
                      </div>
                      <span className={`border px-1.5 py-0.5 rounded text-[10px] ${actorColor(tx.actor_type)}`}>
                        {tx.actor_type.toUpperCase()}
                      </span>
                    </div>

                    {/* Diff */}
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      {renderTransactionDiff(tx)}
                    </div>

                    {/* Footer: actor name + time + notes */}
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <div className="flex items-center gap-1">
                        <span>{tx.actor_name ?? tx.actor_type}</span>
                        <span>·</span>
                        <span>{formatDateTime(tx.event_at as string)}</span>
                      </div>
                      {tx.notes && (
                        <p className="text-violet-600 truncate max-w-[55%]">{tx.notes}</p>
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

    // ── 5. Trip Timeline ──────────────────────────────────────────────────────
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
                <div className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full ${item.bg}`}>
                  <span className={`text-sm ${item.iconColor}`}>{item.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 leading-tight">{item.label}</p>
                  <p className="text-sm text-gray-800 leading-tight">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </DetailCard>
      ),
    },

    // ── 6. User Trip Changes ──────────────────────────────────────────────────
    {
      key: "user-trip",
      data: (
        <DetailCard
          icon={<HistoryOutlined style={{ fontSize: 18, color: "#4f46e5" }} />}
          title="User Trip Changes"
        >
          {userTxs.length === 0 ? (
            <div className="py-4 text-center text-gray-400 text-xs">
              No changes made by user yet
            </div>
          ) : (
            <div className="space-y-3">
              {userTxs.map((tx, index) => (
                <div key={tx.id ?? index} className="border-b pb-2 last:border-b-0">

                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold capitalize">
                      {tx.event_type.replace(/_/g, " ")}
                    </span>
                    <span className="inline-block border border-yellow-400 text-yellow-600 px-1.5 py-0.5 rounded text-[10px]">
                      USER
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs">
                    {renderTransactionDiff(tx)}
                  </div>

                  <div className="flex justify-between text-[11px] text-gray-400 mt-2">
                    <p>{formatDateTime(tx.event_at as string)}</p>
                    <p className="text-violet-700">{tx.notes ?? "User requested change"}</p>
                  </div>

                </div>
              ))}
            </div>
          )}
        </DetailCard>
      ),
    },

    // ── 7. User & Driver Details ──────────────────────────────────────────────
    {
      key: "userdriverdetails",
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
                <Button size="small" className="h-6 px-1 text-[10px] flex items-center gap-1">
                  <GrPhone className="text-[12px]" /> Call
                </Button>
                <Button size="small" className="h-6 px-1 text-[10px] flex items-center gap-1">
                  <MessageOutlined className="text-[12px]" /> Msg
                </Button>
              </div>
            </div>

            <div className="w-px bg-gray-300" />

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
                    <Button size="small" className="h-6 px-1 text-[10px] flex items-center gap-1">
                      <GrPhone className="text-[12px]" /> Call
                    </Button>
                    <Button size="small" className="h-6 px-1 text-[10px] flex items-center gap-1">
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