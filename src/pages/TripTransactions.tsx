import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { store } from "../store";
import type { RootState, AppDispatch } from "../store";
import { fetchTripTransaction, clearTripTransaction } from "../store/slices/tripTransactionSlice";
import { selectTripIdByCode } from "../store/slices/tripSlice";
import type { TripTransactionEvent } from "../store/slices/tripTransactionSlice";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import { Card, Input, Button, Timeline, Typography, Tag, Descriptions, Empty, Spin } from "antd";
import { SearchOutlined, EnvironmentOutlined, CarOutlined, CheckCircleOutlined, ClockCircleOutlined, UserOutlined, StopOutlined, HistoryOutlined } from "@ant-design/icons";
import dayjs from "dayjs";


const { Title, Text } = Typography;

interface TimelineEvent {
    title: string;
    time: string;
    type: string;
    icon: React.ReactNode;
    color: string;
    details?: React.ReactNode;
}

const FIELD_LABELS: Record<string, string> = {
    driver_id: "Driver",
    vehicle_id: "Vehicle",
    status: "Status",
    pickup_location: "Pickup",
    dropoff_location: "Drop-off",
    fare: "Fare",
    distance: "Distance",
    duration: "Duration",
    payment_method: "Payment",
    cancellation_reason: "Cancel Reason",
    rating: "Rating",
    notes: "Notes",
    trip_id: "Trip ID",
    user_id: "User",
    service_type: "Service Type",
    ride_type: "Ride Type",
    total_fare: "Total Fare",
    trip_status: "Trip Status",
    payment_status: "Payment Status",
};

const formatValue = (key: string, value: unknown) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if ((key.includes("at") || key.includes("time")) && typeof value === "string" && dayjs(value).isValid()) {
        return dayjs(value).format("DD MMM YYYY, hh:mm A");
    }
    if (typeof value === "object") {
        try {
            return JSON.stringify(value, null, 2);
        } catch {
            return String(value);
        }
    }
    return String(value);
};

const TripTransactions: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [searchId, setSearchId] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const { tripData, loading, error } = useSelector(
        (state: RootState) => state.tripTransaction,
    );
    console.log(tripData, "tripData");

    const handleSearch = () => {
        if (!searchId.trim()) return;
        
        // Find internal trip_id from the human-readable trip_code
        // We use the selector directly with the state
        const state = store.getState() as RootState;
        const resolvedTripId = selectTripIdByCode(state, searchId.trim());

        if (resolvedTripId) {
            dispatch(fetchTripTransaction(resolvedTripId));
            setHasSearched(true);
        } else {
            // If it's not a trip_code, it might be a trip_id itself (fallback)
            // or we show an error if it doesn't match anything
            dispatch(fetchTripTransaction(searchId.trim()));
            setHasSearched(true);
        }
    };

    const handleClear = () => {
        setSearchId("");
        setHasSearched(false);
        dispatch(clearTripTransaction());
    };

    const getEventConfig = (eventType: string) => {
        switch (eventType) {
            case "trip_requested":
                return { title: "Ride Requested", color: "blue", icon: <ClockCircleOutlined /> };
            case "trip_assigned":
                return { title: "Driver Assigned", color: "cyan", icon: <UserOutlined /> };
            case "trip_started":
                return { title: "Journey Started", color: "green", icon: <CarOutlined /> };
            case "trip_completed":
                return { title: "Journey Completed", color: "green", icon: <CheckCircleOutlined /> };
            case "trip_cancelled":
                return { title: "Trip Cancelled", color: "red", icon: <StopOutlined /> };
            case "trip_updated":
                return { title: "Trip Updated", color: "orange", icon: <HistoryOutlined /> };
            default:
                return { title: eventType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), color: "gray", icon: <EnvironmentOutlined /> };
        }
    };

    const generateTimeline = (transactions: TripTransactionEvent[]): TimelineEvent[] => {
        return transactions.map((transaction) => {
            const config = getEventConfig(transaction.event_type);
            return {
                title: config.title,
                time: transaction.event_at,
                type: "CHANGE", // We use a generic type for new events
                icon: config.icon,
                color: config.color,
                details: (
                    <div className="flex flex-col gap-2">
                        {transaction.notes && <Text className="text-sm font-medium">{transaction.notes}</Text>}

                        <Descriptions size="small" column={1} className="mt-1">
                            {transaction.actor_name && (
                                <Descriptions.Item label="Action by">
                                    <Tag icon={<UserOutlined />} color="default">
                                        {transaction.actor_name} ({transaction.actor_type})
                                    </Tag>
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Status">
                                <Tag color={transaction.status === "success" ? "success" : "error"}>
                                    {transaction.status.toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        {transaction.event_type === "trip_requested" && transaction.entity_snapshot && (
                            <div className="mt-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex items-start gap-2">
                                        <EnvironmentOutlined className="text-blue-500 mt-1" />
                                        <div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase">Pickup</div>
                                            <div className="text-xs text-gray-700">{transaction.entity_snapshot.pickup_address || "N/A"}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <EnvironmentOutlined className="text-red-500 mt-1" />
                                        <div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase">Drop</div>
                                            <div className="text-xs text-gray-700">{transaction.entity_snapshot.drop_address || "N/A"}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {transaction.changed_fields && transaction.changed_fields.length > 0 && transaction.event_type !== "trip_requested" && (
                            <div className="mt-2 border-t border-gray-100 pt-2">
                                <Text type="secondary" className="text-xs font-bold block mb-1 uppercase tracking-wider">What Changed:</Text>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {transaction.changed_fields.map((field) => (
                                        <Tag key={field} color="blue" className="m-0 text-[10px]">
                                            {FIELD_LABELS[field] || field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </Tag>
                                    ))}
                                </div>
                                {transaction.new_value && Object.keys(transaction.new_value).length > 0 && (
                                    <div className="text-xs bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                                        <div className="grid grid-cols-1 gap-1">
                                            {Object.entries(transaction.new_value).map(([key, val]) => (
                                                <div key={key} className="flex flex-col sm:flex-row sm:gap-2">
                                                    <span className="font-semibold text-gray-600">
                                                        {FIELD_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}:
                                                    </span>
                                                    <span className="text-blue-700">{formatValue(key, val)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ),
            };
        }).sort((a, b) => dayjs(a.time).valueOf() - dayjs(b.time).valueOf());
    };

    return (
        <TitleBar
            title="Trip Transactions"
            description="Track the complete activity lifecycle and chronological events for a specific trip."
        >
            <div className="p-4 max-w-4xl mx-auto">
                <Card className="mb-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-grow w-full">
                            <Input
                                size="large"
                                placeholder="Enter Trip ID (e.g. trip_124)"
                                prefix={<SearchOutlined className="text-gray-400" />}
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                onPressEnter={handleSearch}
                                onClear={handleClear}
                                allowClear
                            />
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            icon={<SearchOutlined />}
                            loading={loading}
                            onClick={handleSearch}
                            className="w-full md:w-auto"
                        >
                            Track Trip
                        </Button>
                    </div>
                </Card>

                {loading && (
                    <div className="flex justify-center my-12">
                        <Spin size="large" tip="Fetching trip data..." />
                    </div>
                )}

                {hasSearched && !loading && error && (
                    <Card className="mb-6 shadow-sm border-red-100 bg-red-50">
                        <Text type="danger">{error}</Text>
                    </Card>
                )}

                {hasSearched && !loading && !tripData?.transactions?.length && !error && (
                    <Empty
                        description={
                            <span>
                                No transactions found for Trip ID <Text strong>{searchId}</Text>
                            </span>
                        }
                        className="my-12"
                    />
                )}

                {hasSearched && !loading && tripData?.transactions?.length && (
                    <Card
                        title={
                            <div className="flex flex-col gap-4 py-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <HistoryOutlined className="text-blue-500 text-lg" />
                                        <span className="font-bold text-gray-800 text-lg">Trip Timeline Activity</span>
                                        <Tag color="blue" className="ml-2 font-medium">
                                            {tripData.total} Events
                                        </Tag>
                                    </div>
                                    <Text type="secondary" className="text-xs font-mono font-medium bg-gray-100 px-2 py-1 rounded">
                                        TRIP ID: {searchId}
                                    </Text>
                                </div>

                                <div className="flex flex-wrap gap-8 items-center bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                                            <UserOutlined className="text-lg" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rider</span>
                                            <span className="text-sm font-bold text-gray-800">{tripData.user?.name || "N/A"}</span>
                                            {tripData.user?.phone_number && (
                                                <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                                                    <span className="text-gray-300">|</span> {tripData.user.phone_number}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full ${tripData.driver ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"} flex items-center justify-center shadow-inner`}>
                                            <CarOutlined className="text-lg" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Driver</span>
                                            {tripData.driver ? (
                                                <>
                                                    <span className="text-sm font-bold text-gray-800">{tripData.driver.name}</span>
                                                    {tripData.driver.phone_number && (
                                                        <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                                                            <span className="text-gray-300">|</span> {tripData.driver.phone_number}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-sm font-medium text-gray-400 italic">Not Assigned</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        className="shadow-sm"
                    >
                        <div className="max-h-[66vh] overflow-y-auto pr-4 custom-scrollbar">
                            <Timeline
                                mode="left"
                                items={generateTimeline(tripData.transactions).map((event) => ({
                                    color: event.color,
                                    dot: event.icon,
                                    label: <Text type="secondary" className="text-xs">{dayjs(event.time).format("DD MMM YYYY, hh:mm A")}</Text>,
                                    children: (
                                        <div className="mb-6 bg-white border border-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
                                            <Title level={5} className="!mt-0 !mb-2" style={{ color: event.color }}>
                                                {event.title}
                                            </Title>
                                            {event.details && <div className="mt-3">{event.details}</div>}
                                        </div>
                                    ),
                                }))}
                            />
                        </div>
                    </Card>
                )}
            </div>
        </TitleBar>
    );
};

export default TripTransactions;
// import React, { useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import type { RootState, AppDispatch } from "../store";
// import { fetchTripTransaction, clearTripTransaction } from "../store/slices/tripTransactionSlice";
// import type { TripTransactionEvent } from "../store/slices/tripTransactionSlice";
// import TitleBar from "../components/TitleBarCommon/TitleBar";
// import { Card, Input, Button, Typography, Tag, Empty, Spin } from "antd";
// import {
//     SearchOutlined,
//     EnvironmentOutlined,
//     CarOutlined,
//     CheckCircleOutlined,
//     ClockCircleOutlined,
//     UserOutlined,
//     StopOutlined,
//     HistoryOutlined,
//     CalendarOutlined,
// } from "@ant-design/icons";
// import dayjs from "dayjs";

// const { Text } = Typography;

// // ─── Essential field label map ────────────────────────────────────────────────
// const FIELD_LABELS: Record<string, string> = {
//     driver_id: "Driver",
//     vehicle_id: "Vehicle",
//     status: "Status",
//     pickup_location: "Pickup",
//     dropoff_location: "Drop-off",
//     fare: "Fare",
//     distance: "Distance",
//     duration: "Duration",
//     payment_method: "Payment",
//     cancellation_reason: "Cancel Reason",
//     rating: "Rating",
//     notes: "Notes",
// };

// // Fields we deliberately hide from the changed-fields summary
// const HIDDEN_FIELDS = new Set(["updated_at", "created_at", "id", "trip_id"]);

// // ─── Event visual config ──────────────────────────────────────────────────────
// const EVENT_CONFIG: Record<
//     string,
//     { label: string; icon: React.ReactNode; accent: string; bg: string; tagColor: string }
// > = {
//     trip_requested: {
//         label: "Ride Requested",
//         icon: <ClockCircleOutlined />,
//         accent: "#3B82F6",
//         bg: "#EFF6FF",
//         tagColor: "blue",
//     },
//     trip_assigned: {
//         label: "Driver Assigned",
//         icon: <UserOutlined />,
//         accent: "#06B6D4",
//         bg: "#ECFEFF",
//         tagColor: "cyan",
//     },
//     trip_started: {
//         label: "Journey Started",
//         icon: <CarOutlined />,
//         accent: "#10B981",
//         bg: "#ECFDF5",
//         tagColor: "green",
//     },
//     trip_completed: {
//         label: "Journey Completed",
//         icon: <CheckCircleOutlined />,
//         accent: "#059669",
//         bg: "#D1FAE5",
//         tagColor: "success",
//     },
//     trip_cancelled: {
//         label: "Trip Cancelled",
//         icon: <StopOutlined />,
//         accent: "#EF4444",
//         bg: "#FEF2F2",
//         tagColor: "error",
//     },
//     trip_updated: {
//         label: "Trip Updated",
//         icon: <HistoryOutlined />,
//         accent: "#F59E0B",
//         bg: "#FFFBEB",
//         tagColor: "warning",
//     },
// };

// const getEventConfig = (eventType: string) =>
//     EVENT_CONFIG[eventType] ?? {
//         label: eventType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
//         icon: <EnvironmentOutlined />,
//         accent: "#6B7280",
//         bg: "#F9FAFB",
//         tagColor: "default",
//     };

// // ─── Extract only the meaningful changed fields ────────────────────────────────
// const extractEssentialChanges = (
//     changedFields: string[] | undefined,
//     newValue: Record<string, unknown> | undefined,
// ): { label: string; value: string }[] => {
//     if (!changedFields?.length || !newValue) return [];
//     return changedFields
//         .filter((f) => !HIDDEN_FIELDS.has(f) && newValue[f] !== undefined && newValue[f] !== null)
//         .map((f) => ({
//             label: FIELD_LABELS[f] ?? f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
//             value: String(newValue[f]),
//         }));
// };

// // ─── Single timeline card ──────────────────────────────────────────────────────
// const TimelineCard: React.FC<{ transaction: TripTransactionEvent; isLast: boolean }> = ({
//     transaction,
//     isLast,
// }) => {
//     const config = getEventConfig(transaction.event_type);
//     const essentialChanges = extractEssentialChanges(
//         transaction.changed_fields,
//         transaction.new_value as Record<string, unknown> | undefined,
//     );
//     const showChanges = transaction.event_type !== "trip_requested" && essentialChanges.length > 0;

//     return (
//         <div className="flex gap-4 relative">
//             {/* Vertical connector line */}
//             {!isLast && (
//                 <div
//                     className="absolute left-[19px] top-10 w-[2px] bottom-0 z-0"
//                     style={{ background: "linear-gradient(to bottom, #E5E7EB, transparent)" }}
//                 />
//             )}

//             {/* Icon bubble */}
//             <div
//                 className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-sm border-2 border-white"
//                 style={{ background: config.bg, color: config.accent }}
//             >
//                 {config.icon}
//             </div>

//             {/* Card body */}
//             <div
//                 className="flex-1 mb-6 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md"
//                 style={{ borderColor: `${config.accent}22`, background: "#FAFAFA" }}
//             >
//                 {/* Header row */}
//                 <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
//                     <div className="flex items-center gap-2">
//                         <span className="font-semibold text-gray-800 text-sm">{config.label}</span>
//                         <Tag color={config.tagColor} className="!text-xs !px-2 !py-0 !leading-5">
//                             {transaction.status.toUpperCase()}
//                         </Tag>
//                     </div>
//                     <div className="flex items-center gap-1 text-xs text-gray-400">
//                         <CalendarOutlined />
//                         <span>{dayjs(transaction.event_at).format("DD MMM YYYY, hh:mm A")}</span>
//                     </div>
//                 </div>

//                 {/* Actor row */}
//                 {transaction.actor_name && (
//                     <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
//                         <UserOutlined className="text-gray-400" />
//                         <span>
//                             <span className="font-medium text-gray-700">{transaction.actor_name}</span>
//                             <span className="ml-1 text-gray-400">· {transaction.actor_type}</span>
//                         </span>
//                     </div>
//                 )}

//                 {/* Notes */}
//                 {transaction.notes && (
//                     <p className="text-xs text-gray-500 italic mb-3 leading-relaxed">
//                         "{transaction.notes}"
//                     </p>
//                 )}

//                 {/* Cancellation details */}
//                 {transaction.event_type === "trip_cancelled" && (
//                     <div className="flex flex-col gap-2 mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
//                         {transaction.actor_name && (
//                             <div className="flex items-center gap-2 text-xs">
//                                 <UserOutlined className="text-red-400" />
//                                 <span className="text-gray-500">Cancelled by</span>
//                                 <span className="font-semibold text-red-600">{transaction.actor_name}</span>
//                                 {transaction.actor_type && (
//                                     <Tag color="error" className="!text-xs !px-1.5 !py-0 !leading-4 !m-0">
//                                         {transaction.actor_type}
//                                     </Tag>
//                                 )}
//                             </div>
//                         )}
//                         {(() => {
//                             const reason = (transaction.new_value as Record<string, unknown>)?.cancellation_reason;
//                             return reason ? (
//                                 <div className="flex items-start gap-2 text-xs">
//                                     <StopOutlined className="text-red-400 mt-0.5" />
//                                     <span className="text-gray-500">Reason</span>
//                                     <span className="font-medium text-red-700">{String(reason)}</span>
//                                 </div>
//                             ) : null;
//                         })()}
//                     </div>
//                 )}

//                 {/* Essential changed fields as pill-chips */}
//                 {showChanges && (
//                     <div className="pt-3 border-t border-gray-100">
//                         <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
//                             What Changed
//                         </p>
//                         <div className="flex flex-wrap gap-2">
//                             {essentialChanges.map(({ label, value }) => (
//                                 <div
//                                     key={label}
//                                     className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs border"
//                                     style={{
//                                         background: config.bg,
//                                         borderColor: `${config.accent}33`,
//                                         color: config.accent,
//                                     }}
//                                 >
//                                     <span className="font-medium text-gray-500">{label}:</span>
//                                     <span className="font-semibold">{value}</span>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// // ─── Main page ─────────────────────────────────────────────────────────────────
// const TripTransactions: React.FC = () => {
//     const dispatch = useDispatch<AppDispatch>();
//     const [searchId, setSearchId] = useState("");
//     const [hasSearched, setHasSearched] = useState(false);
//     const { tripData, loading, error } = useSelector(
//         (state: RootState) => state.tripTransaction,
//     );

//     const handleSearch = () => {
//         if (!searchId.trim()) return;
//         dispatch(fetchTripTransaction(searchId.trim()));
//         setHasSearched(true);
//     };

//     const handleClear = () => {
//         setSearchId("");
//         setHasSearched(false);
//         dispatch(clearTripTransaction());
//     };

//     const sortedTransactions = [...(tripData?.transactions ?? [])].sort(
//         (a, b) => dayjs(a.event_at).valueOf() - dayjs(b.event_at).valueOf(),
//     );

//     return (
//         <TitleBar
//             title="Trip Transactions"
//             description="Track the complete activity lifecycle and chronological events for a specific trip."
//         >
//             <div className="p-4 max-w-3xl mx-auto">
//                 {/* ── Search bar ── */}
//                 <Card className="mb-6 shadow-sm">
//                     <div className="flex flex-col md:flex-row gap-3 items-center">
//                         <Input
//                             size="large"
//                             placeholder="Enter Trip ID (e.g. trip_124)"
//                             prefix={<SearchOutlined className="text-gray-400" />}
//                             value={searchId}
//                             onChange={(e) => setSearchId(e.target.value)}
//                             onPressEnter={handleSearch}
//                             onClear={handleClear}
//                             allowClear
//                             className="flex-1"
//                         />
//                         <Button
//                             type="primary"
//                             size="large"
//                             icon={<SearchOutlined />}
//                             loading={loading}
//                             onClick={handleSearch}
//                             className="w-full md:w-auto"
//                         >
//                             Track Trip
//                         </Button>
//                     </div>
//                 </Card>

//                 {/* ── Loading ── */}
//                 {loading && (
//                     <div className="flex justify-center my-16">
//                         <Spin size="large" tip="Fetching trip data..." />
//                     </div>
//                 )}

//                 {/* ── Error ── */}
//                 {hasSearched && !loading && error && (
//                     <Card className="mb-6 border-red-100 bg-red-50 shadow-sm">
//                         <Text type="danger">{error}</Text>
//                     </Card>
//                 )}

//                 {/* ── Empty ── */}
//                 {hasSearched && !loading && !sortedTransactions.length && !error && (
//                     <Empty
//                         description={
//                             <span>
//                                 No transactions found for Trip ID{" "}
//                                 <Text strong>{searchId}</Text>
//                             </span>
//                         }
//                         className="my-16"
//                     />
//                 )}

//                 {/* ── Timeline ── */}
//                 {hasSearched && !loading && sortedTransactions.length > 0 && (
//                     <Card
//                         title={
//                             <div className="flex justify-between items-center">
//                                 <span className="font-semibold text-gray-700">
//                                     Trip Activity
//                                     <span className="ml-2 text-sm font-normal text-gray-400">
//                                         {tripData?.total} events
//                                     </span>
//                                 </span>
//                                 <Text type="secondary" className="text-xs font-mono">
//                                     {searchId}
//                                 </Text>
//                             </div>
//                         }
//                         className="shadow-sm"
//                     >
//                         <div className="max-h-[66vh] overflow-y-auto pr-2 custom-scrollbar pt-2">
//                             {sortedTransactions.map((txn, idx) => (
//                                 <TimelineCard
//                                     key={txn.event_at + txn.event_type}
//                                     transaction={txn}
//                                     isLast={idx === sortedTransactions.length - 1}
//                                 />
//                             ))}
//                         </div>
//                     </Card>
//                 )}
//             </div>
//         </TitleBar>
//     );
// };

// export default TripTransactions;