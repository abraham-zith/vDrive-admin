import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Dropdown,
  Select,
  Spin,
  Input,
  Tooltip,
  notification,
  Modal,
  Avatar,
  Button,
} from "antd";

import type { TableColumnsType } from "antd";

import { GrPhone } from "react-icons/gr";

import {
  UserOutlined,
  CarOutlined,
  UserAddOutlined,
  DollarOutlined,
  BellOutlined,
  MoreOutlined,
  StopOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import {
  adjustFareUI,
  assignDriverUI,
  type TripDetailsType,
} from "../../store/slices/tripSlice";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import TripDetailsDrawer from "./TripDetailsDrawer";
import axiosIns from "../../api/axios";

interface Props {
  data: TripDetailsType[];
  isSuperAdmin?: boolean;
}

type Driver = {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  location: string;
  distanceKm: number;
  etaMinutes: number;
  phonenumber: string;
};

export type ActionType =
  | "ASSIGN_DRIVER"
  | "CANCEL_TRIP"
  | "ADJUST_FARE"
  | "TRIGGER_DRIVER"
  | null;

const okTextMap = {
  ASSIGN_DRIVER: "Assign",
  CANCEL_TRIP: "Cancel Trip",
  ADJUST_FARE: "Update Fare",
  TRIGGER_DRIVER: "Broadcast Alert",
};

const titleMap = {
  ASSIGN_DRIVER: "Assign Driver Partner",
  CANCEL_TRIP: "Terminate Trip",
  ADJUST_FARE: "Adjust Trip Pricing",
  TRIGGER_DRIVER: "Trigger Broadcast Alert",
};

const mockDrivers: Driver[] = [
  {
    id: "driver_1",
    name: "Sathish",
    status: "ACTIVE",
    location: "Anna Nagar",
    distanceKm: 3.2,
    etaMinutes: 8,
    phonenumber: "8825857024",
  },
  {
    id: "driver_2",
    name: "Senthil",
    status: "ACTIVE",
    location: "Velachery",
    distanceKm: 6.5,
    etaMinutes: 18,
    phonenumber: "8825857026",
  },
  {
    id: "driver_3",
    name: "Karthik",
    status: "INACTIVE",
    location: "KK Nagar",
    distanceKm: 4.1,
    etaMinutes: 12,
    phonenumber: "8855857024",
  },
];

const TripDetailsTable: React.FC<Props> = ({ data, isSuperAdmin = false }) => {
  const dispatch = useDispatch();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const trips = useSelector((state: RootState) => state.trips.trips);

  const [actionTrip, setActionTrip] = useState<TripDetailsType | null>(null);

  const trip = React.useMemo(() => {
    if (!actionTrip) return null;
    return trips.find((t) => t.trip_id === actionTrip.trip_id) ?? null;
  }, [trips, actionTrip]);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverLoading, setDriverLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState<number>(500);

  const [activeAction, setActiveAction] = useState<ActionType>(null);

  const [adjustedFare, setAdjustedFare] = useState<string>("");
  const adjustedFareNumber = Number(adjustedFare || 0);

  console.log("activeAction", activeAction, trip);

  // Reset driver selection when trip changes
  React.useEffect(() => {
    setSelectedDriver(null);
    setSearchRadius(500);
  }, [trip]);

  const fetchAvailableDrivers = async (radius: number) => {
    console.log(`[DriverFetch] Triggered for trip ${trip?.trip_code} within ${radius}m`);
    if (!trip) return;
    try {
      setDriverLoading(true);
      const response = await axiosIns.post("/api/drivers/available-for-assignment", {
        lat: trip.pickup_lat,
        lng: trip.pickup_lng,
        radius: radius
      });

      const driverData = response.data?.data || [];
      console.log(`[DriverFetch] Successfully found ${response.data?.data?.length || 0} drivers`);

      const mappedDrivers: Driver[] = driverData.map((d: any) => ({
        id: d.id,
        name: d.name,
        status: "ACTIVE",
        location: d.current_address || 'Unknown',
        distanceKm: d.distance_km,
        etaMinutes: d.eta_minutes,
        phonenumber: d.phone_number || 'N/A'
      }));

      setDrivers(mappedDrivers);
    } catch (error) {
      console.error("Error fetching available drivers:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch nearby drivers."
      });
    } finally {
      setDriverLoading(false);
    }
  };

  useEffect(() => {
    if (activeAction === "ASSIGN_DRIVER" && trip) {
      fetchAvailableDrivers(searchRadius);
    }
  }, [activeAction, trip, searchRadius]);

  const handleDriverChange = (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId) || null;
    setSelectedDriver(driver);
  };

  const menuItems = (r: TripDetailsType) => {
    const completed = isTripCompleted(r);

    const withTooltip = (label: string) =>
      completed ? (
        <Tooltip title="Trip already completed">
          <span>{label}</span>
        </Tooltip>
      ) : (
        label
      );

    const items = [];

    if (isSuperAdmin) {
      items.push(
        {
          key: "assign_driver",
          label: withTooltip(
            isDriverAssigned(r) ? "Reassign Driver" : "Assign Driver",
          ),
          icon: <UserAddOutlined />,
          disabled: completed,
        },
        {
          key: "fare",
          label: withTooltip("Adjust Fare"),
          icon: <DollarOutlined />,
          disabled: completed,
        },
        {
          key: "cancel",
          label: withTooltip("Cancel Trip"),
          icon: <StopOutlined />,
          danger: true,
          disabled: completed,
        },
        {
          key: "trigger",
          label: withTooltip("Trigger to Drivers"),
          icon: <BellOutlined />,
          disabled: completed,
        }
      );
    }

    return items;
  };

  const isDriverAssigned = (trip: TripDetailsType | null) =>
    Boolean(trip?.driver_id && trip?.driver_name?.trim());

  const isTripCompleted = (trip: TripDetailsType | null) =>
    trip?.trip_status === "COMPLETED";

  const columns: TableColumnsType<TripDetailsType> = [
    {
      title: <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Trip ID</span>,
      dataIndex: "trip_code",
      width: 140,
      render: (_, r) => (
        <Tooltip title="View Detailed Trip Analytics">
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActionTrip(r);
              setDrawerOpen(true);
            }}
            className="group cursor-pointer flex items-center gap-2"
          >
            <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-mono text-[11px] font-extrabold tracking-tight border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
              {r.trip_code}
            </div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Customer Details</span>,
      width: 200,
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <Avatar
            className="flex-shrink-0 bg-gradient-to-tr from-amber-400 to-orange-300 border-2 border-white shadow-sm"
            icon={<UserOutlined />}
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800 tracking-tight leading-none">{r.user_name}</span>
            <span className="text-[10px] text-gray-400 font-medium tracking-wider mt-1 flex items-center gap-1">
              <GrPhone className="text-[9px]" /> {r.user_phone}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Driver Partner</span>,
      width: 200,
      render: (_, r) => {
        const hasDriver = isDriverAssigned(r);
        return (
          <div className="flex items-center gap-3">
            <Avatar
              className={`flex-shrink-0 border-2 border-white shadow-sm ${hasDriver ? 'bg-gradient-to-tr from-emerald-400 to-teal-300' : 'bg-gray-100'}`}
              icon={hasDriver ? <CarOutlined /> : <UserAddOutlined className="text-gray-400" />}
            />
            <div className="flex flex-col">
              {hasDriver ? (
                <>
                  <span className="text-sm font-bold text-gray-800 tracking-tight leading-none">{r.driver_name}</span>
                  <span className="text-[10px] text-gray-400 font-medium tracking-wider mt-1 flex items-center gap-1">
                    <GrPhone className="text-[9px]" /> {r.driver_phone}
                  </span>
                </>
              ) : (
                <span className="text-xs font-medium text-gray-400 italic">Assign Pending...</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Route Geography</span>,
      width: 450,
      render: (_, r) => (
        <div className="flex flex-col gap-1 py-1">
          <div className="flex items-center gap-2 group">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 flex-shrink-0" />
            <span className="text-[11px] font-bold text-gray-700 truncate max-w-[400px] leading-none">{r.pickup_address}</span>
          </div>
          <div className="ml-0.5 w-0.5 h-3 bg-gray-100" />
          <div className="flex items-center gap-2 group">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 ring-4 ring-rose-50 flex-shrink-0" />
            <span className="text-[11px] font-bold text-gray-700 truncate max-w-[400px] leading-none">{r.drop_address}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 pl-4">
            <Tag className="m-0 border-gray-100 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg px-2">
              {r.distance_km} KM
            </Tag>
            <Tag className="m-0 border-indigo-100 bg-indigo-50 text-indigo-500 text-[10px] font-bold rounded-lg px-2">
              ~{r.trip_duration_minutes} MINS
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Trip Status</span>,
      width: 140,
      render: (_, r) => {
        const getStatusColor = () => {
          switch (r.trip_status) {
            case "LIVE": return "from-emerald-500 to-teal-400 shadow-emerald-200";
            case "COMPLETED": return "from-indigo-600 to-blue-500 shadow-blue-200 text-white";
            case "ASSIGNED": return "from-blue-600 to-cyan-400 shadow-blue-200 text-white";
            case "REQUESTED": return "from-amber-400 to-orange-300 shadow-amber-200";
            case "CANCELLED": return "from-rose-500 to-pink-500 shadow-rose-200 text-white";
            default: return "from-slate-400 to-slate-500 shadow-slate-200 text-white";
          }
        };
        return (
          <div className={`inline-flex bg-gradient-to-r ${getStatusColor()} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg`}>
            {r.trip_status}
          </div>
        );
      },
    },
    {
      title: <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Total Revenue</span>,
      width: 120,
      render: (_, r) => (
        <div className="text-gray-800 font-extrabold text-sm tracking-tight">
          ₹{Number(r.total_fare || 0).toLocaleString()}
        </div>
      ),
    },
    {
      title: <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Service</span>,
      width: 120,
      render: (_, r) => (
        <span className="bg-slate-50 text-slate-500 border border-slate-100 px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-widest uppercase">
          {r.service_type}
        </span>
      ),
    },
    {
      title: "",
      width: 80,
      render: (_, r) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="Deep Dive">
            <Button
              type="text"
              icon={<EyeOutlined className="text-indigo-600 text-lg" />}
              onClick={(e) => {
                e.stopPropagation();
                setActionTrip(r);
                setDrawerOpen(true);
              }}
              className="hover:bg-indigo-50 rounded-full"
            />
          </Tooltip>
          {isSuperAdmin && (
            <Dropdown
              trigger={["click"]}
              menu={{
                items: menuItems(r),
                onClick: ({ key }) => {
                  setActionTrip(r);
                  console.log(`[TableAction] Menu item clicked: ${key} for trip ${r.trip_code}`);
                  if (key === "assign_driver") setActiveAction("ASSIGN_DRIVER");
                  if (key === "fare") setActiveAction("ADJUST_FARE");
                  if (key === "cancel") setActiveAction("CANCEL_TRIP");
                  if (key === "trigger") setActiveAction("TRIGGER_DRIVER");
                },
              }}
            >
              <Button
                type="text"
                icon={<MoreOutlined className="text-gray-400 text-xl" />}
                className="hover:bg-gray-50 rounded-full"
              />
            </Dropdown>
          )}
        </div>
      ),
    },
  ];

  // ============================================
  // ASSIGN DRIVER CONTENT
  // ============================================

  const AssignDriverContent = (
    <div style={{ width: 280 }}>
      {/* Radius Selector */}
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5 flex justify-between">
          Search Radius <span>{searchRadius >= 1000 ? `${searchRadius / 1000}km` : `${searchRadius}m`}</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[500, 1000, 2000, 5000].map(r => (
            <Tag.CheckableTag
              key={r}
              checked={searchRadius === r}
              onChange={() => setSearchRadius(r)}
              className={`text-[10px] m-0 px-2 py-0.5 border rounded-lg transition-all
                ${searchRadius === r ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-indigo-200'}`}
            >
              {r >= 1000 ? `${r / 1000}km` : `${r}m`}
            </Tag.CheckableTag>
          ))}
          <Select
            size="small"
            placeholder="More"
            className="text-[10px] min-w-[60px]"
            onChange={(val) => setSearchRadius(val)}
            value={searchRadius > 5000 ? searchRadius : undefined}
          >
            <Select.Option value={10000}>10km</Select.Option>
            <Select.Option value={20000}>20km</Select.Option>
            <Select.Option value={50000}>50km</Select.Option>
          </Select>
        </div>
      </div>

      {/* Driver Select */}
      <Select
        showSearch
        placeholder="Type driver name"
        style={{ width: "100%" }}
        value={selectedDriver?.id}
        optionLabelProp="label"
        optionFilterProp="label"
        loading={driverLoading}
        onChange={handleDriverChange}
        dropdownRender={(menu) => (
          <>
            {menu}
            {drivers.length === 0 && !driverLoading && (
              <div className="p-4 text-center border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-2 font-medium italic">
                  No online drivers within {searchRadius >= 1000 ? `${searchRadius / 1000}km` : `${searchRadius}m`}
                </p>
                <Button
                  size="small"
                  type="primary"
                  ghost
                  className="text-[10px] h-7 rounded-lg font-bold"
                  onMouseDown={(e) => {
                    e.preventDefault(); // ✅ Prevent default behavior
                    e.stopPropagation(); // ✅ Prevent event bubbling
                    console.log(`[ExpandSearch] Expanding from ${searchRadius}m`);
                    const nextRadii = [500, 1000, 2000, 5000, 10000, 20000, 50000];
                    const currentIndex = nextRadii.indexOf(searchRadius);
                    if (currentIndex < nextRadii.length - 1) {
                      console.log(`[ExpandSearch] Setting radius to ${nextRadii[currentIndex + 1]}m`);
                      setSearchRadius(nextRadii[currentIndex + 1]);
                    }
                  }}
                >
                  Expand Search to {
                    (() => {
                      const nextRadii = [500, 1000, 2000, 5000, 10000, 20000, 50000];
                      const currentIndex = nextRadii.indexOf(searchRadius);
                      const next = nextRadii[currentIndex + 1] || searchRadius;
                      return next >= 1000 ? `${next / 1000}km` : `${next}m`;
                    })()
                  }
                </Button>
              </div>
            )}
          </>
        )}
      >
        {drivers.map((driver) => (
          <Select.Option
            key={driver.id}
            value={driver.id}
            label={driver.name}
            disabled={driver.status !== "ACTIVE"}
          >
            <div className="flex justify-between items-center py-1">
              <div>
                <div className="font-bold text-gray-800 text-[11px] leading-tight">{driver.name}</div>
                <div className="text-[9px] text-gray-400 mt-0.5">{driver.distanceKm}km away • ~{driver.etaMinutes} min</div>
              </div>
              <Tag color="green" className="m-0 text-[8px] px-1 line-height-[1.4]">
                ONLINE
              </Tag>
            </div>
          </Select.Option>
        ))}
      </Select>

      {driverLoading && (
        <div className="mt-4 flex items-center justify-center rounded-xl border bg-white p-6">
          <Spin size="large" />
        </div>
      )}

      {drivers.length === 0 && !driverLoading && (
        <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tight mb-2">No drivers in vicinity</p>
          <Button
            block
            size="small"
            type="primary"
            className="bg-amber-500 hover:bg-amber-600 border-none h-8 text-[11px] font-bold shadow-sm"
            onMouseDown={(e) => {
              e.preventDefault(); // ✅ Prevent default behavior
              e.stopPropagation(); // ✅ Prevent event bubbling
              console.log(`[ExpandSearch2] Expanding from ${searchRadius}m`);
              const nextRadii = [500, 1000, 2000, 5000, 10000, 20000, 50000];
              const currentIndex = nextRadii.indexOf(searchRadius);
              if (currentIndex < nextRadii.length - 1) {
                console.log(`[ExpandSearch2] Setting radius to ${nextRadii[currentIndex + 1]}m`);
                setSearchRadius(nextRadii[currentIndex + 1]);
              }
            }}
          >
            Expand Search under {
              (() => {
                const nextRadii = [500, 1000, 2000, 5000, 10000, 20000, 50000];
                const currentIndex = nextRadii.indexOf(searchRadius);
                const next = nextRadii[currentIndex + 1] || searchRadius;
                return next >= 1000 ? `${next / 1000}km` : `${next}m`;
              })()
            }
          </Button>
        </div>
      )}

      {!driverLoading && selectedDriver && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm text-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-400">
                Driver
              </p>
              <p className="font-semibold text-gray-900 leading-tight">
                {selectedDriver.name}
              </p>
            </div>

            <Tag color="green">
              ONLINE
            </Tag>
          </div>

          <div className="mb-2">
            <p className="text-gray-400 text-[11px]">Last Known Location</p>
            <p className="font-medium text-gray-900 leading-tight truncate">
              {selectedDriver.location}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-[11px]">Distance</p>
              <p className="font-medium text-indigo-600 leading-tight">
                {selectedDriver.distanceKm} km
              </p>
            </div>

            <div className="text-right">
              <p className="text-gray-400 text-[11px]">ETA</p>
              <p className="font-medium text-emerald-600 leading-tight">
                ~{selectedDriver.etaMinutes} mins
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ============================================
  // TRIGGER BROADCAST CONTENT
  // ============================================

  const TriggerBroadcastContent = (
    <div style={{ width: 280 }}>
      {/* Radius Selector */}
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-2 flex justify-between">
          Broadcast Radius <span>{searchRadius >= 1000 ? `${searchRadius / 1000}km` : `${searchRadius}m`}</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[500, 1000, 2000, 5000].map(r => (
            <Tag.CheckableTag
              key={r}
              checked={searchRadius === r}
              onChange={() => setSearchRadius(r)}
              className={`text-[10px] m-0 px-2 py-0.5 border rounded-lg transition-all
                ${searchRadius === r ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-amber-200'}`}
            >
              {r >= 1000 ? `${r / 1000}km` : `${r}m`}
            </Tag.CheckableTag>
          ))}
          <Select
            size="small"
            placeholder="More"
            className="text-[10px] min-w-[60px]"
            onChange={(val) => setSearchRadius(val)}
            value={searchRadius > 5000 ? searchRadius : undefined}
          >
            <Select.Option value={10000}>10km</Select.Option>
            <Select.Option value={20000}>20km</Select.Option>
            <Select.Option value={50000}>50km</Select.Option>
          </Select>
        </div>
      </div>

      {driverLoading ? (
        <div className="py-8 flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <Spin size="small" className="mb-2" />
          <p className="text-[10px] text-gray-400 font-medium animate-pulse">Scanning for nearby partners...</p>
        </div>
      ) : (
        <div className={`p-4 rounded-2xl border ${drivers.length > 0 ? 'bg-emerald-50/30 border-emerald-100' : 'bg-amber-50/30 border-amber-100'} text-center`}>
          <div className="flex justify-center mb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${drivers.length > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              <BellOutlined className={`text-lg ${drivers.length > 0 ? 'animate-bounce' : ''}`} />
            </div>
          </div>
          <h4 className={`text-xs font-black uppercase tracking-tight mb-1 ${drivers.length > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
            {drivers.length} Partners Found
          </h4>
          <p className="text-[10px] text-gray-500 leading-tight">
            {drivers.length > 0 
              ? `Ready to broadcast "NEW_TRIP_REQUEST" alert to all ${drivers.length} partners in this range.`
              : `No online partners found within ${searchRadius >= 1000 ? `${searchRadius / 1000}km` : `${searchRadius}m`}. Try expanding the radius.`}
          </p>

          {drivers.length === 0 && (
            <Button
              block
              size="small"
              type="primary"
              className="mt-3 bg-amber-500 hover:bg-amber-600 border-none h-8 text-[11px] font-bold shadow-sm"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const nextRadii = [500, 1000, 2000, 5000, 10000, 20000, 50000];
                const currentIndex = nextRadii.indexOf(searchRadius);
                if (currentIndex < nextRadii.length - 1) {
                  setSearchRadius(nextRadii[currentIndex + 1]);
                }
              }}
            >
              Expand Search to {
                (() => {
                  const nextRadii = [500, 1000, 2000, 5000, 10000, 20000, 50000];
                  const currentIndex = nextRadii.indexOf(searchRadius);
                  const next = nextRadii[currentIndex + 1] || searchRadius;
                  return next >= 1000 ? `${next / 1000}km` : `${next}m`;
                })()
              }
            </Button>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
        <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
          <EyeOutlined className="text-[11px]" /> Pro Tip
        </p>
        <p className="text-[10px] text-indigo-500/80 leading-relaxed italic">
          Broadcasting starts a 15-second response window for all notified drivers.
        </p>
      </div>
    </div>
  );

  // ============================================
  // CONFIRM ASSIGN DRIVER
  // ============================================

  const confirmAssignDriver = async (trip: TripDetailsType | null) => {
    console.log(`[AssignAction] Confirming assignment for trip ${trip?.trip_code} to driver ${selectedDriver?.name}`);
    if (!trip || !selectedDriver) return;

    const key = `assign-driver-${trip.trip_id}`;

    notification.open({
      key,
      message: "Assigning Driver",
      description: "Please wait while we send the assignment request...",
      placement: "topRight",
      duration: 0,
    });

    setDriverLoading(true);

    try {
      // 🚀 REAL API CALL
      await axiosIns.post(`/api/trips/${trip.trip_id}/assign`, {
        driver_id: selectedDriver.id,
      });

      dispatch(
        assignDriverUI({
          trip_id: trip.trip_id,
          driver_id: selectedDriver.id,
          driver_name: selectedDriver.name,
          driver_phone: selectedDriver.phonenumber,
        }),
      );

      notification.success({
        key,
        message: "Assignment Request Sent",
        description: `Notification sent to ${selectedDriver.name}. Waiting for driver acceptance.`,
        placement: "topRight",
        duration: 4,
      });
    } catch (error: any) {
      console.error("[AssignAction] Failed:", error);
      notification.error({
        key,
        message: "Assignment Failed",
        description: error.response?.data?.message || "Could not assign driver. Please try again.",
        placement: "topRight",
      });
    } finally {
      setDriverLoading(false);
      setSelectedDriver(null);
      setActiveAction(null);
    }
  };

  // ============================================
  // ADJUST FARE CONTENT & HANDLER
  // ============================================

  const AdjustFareContent = (
    <div style={{ width: 260 }}>
      <div className="mb-2 text-xs text-gray-500">
        Current Fare: <b>₹{trip?.total_fare ?? 0}</b>
      </div>

      <Input
        type="number"
        prefix="₹"
        placeholder="Enter new total fare"
        value={adjustedFare}
        onChange={(e) => setAdjustedFare(e.target.value)}
      />

      {adjustedFare && (
        <div className="mt-2 text-xs text-green-600">
          New Total Fare: <b>₹{adjustedFareNumber}</b>
        </div>
      )}
    </div>
  );

  const confirmAdjustFare = (trip: TripDetailsType | null) => {
    console.log(`[AdjustFare] Confirming fare adjustment for trip ${trip?.trip_code}`);
    if (!trip || !adjustedFare) return;

    dispatch(
      adjustFareUI({
        trip_id: trip.trip_id,
        total_fare: Number(adjustedFare),
      }),
    );

    notification.success({
      message: "Fare Updated",
      description: `New fare: ₹${adjustedFare}`,
      placement: "topRight",
      duration: 2,
    });

    setAdjustedFare("");
    setActiveAction(null); // ✅ Only close after confirmation
  };

  // ============================================
  // CANCEL TRIP CONTENT & HANDLER
  // ============================================

  const CancelTripContent = (
    <div className="text-sm">
      <p className="font-medium text-red-600">
        Are you sure you want to cancel this trip?
      </p>
      <p className="text-gray-500 mt-1">This action cannot be undone.</p>
    </div>
  );

  const handleCancelTrip = async (trip: TripDetailsType | null) => {
    console.log(`[CancelTrip] Cancelling trip ${trip?.trip_code}`);
    if (!trip) return;

    try {
      // later API: await api.post(`/trips/${trip.trip_id}/cancel`)

      notification.success({
        message: "Trip Cancelled",
        description: `Trip ${trip.trip_code} has been cancelled`,
        placement: "topRight",
        duration: 2,
      });

      setActiveAction(null); // ✅ Only close after confirmation
    } catch (error) {
      console.error("Failed to cancel trip:", error);
      notification.error({
        message: "Error",
        description: "Failed to cancel trip",
        placement: "topRight",
      });
    }
  };

  const confirmTriggerBroadcast = async (trip: TripDetailsType | null) => {
    console.log(`[TriggerAction] Confirming broadcast for trip ${trip?.trip_code} with radius ${searchRadius}m`);
    if (!trip) return;

    const key = `trigger-broadcast-${trip.trip_id}`;

    notification.open({
      key,
      message: "Broadcasting Trip",
      description: `Notifying partners within ${searchRadius >= 1000 ? `${searchRadius / 1000}km` : `${searchRadius}m`}...`,
      placement: "topRight",
      duration: 0,
    });

    setDriverLoading(true);

    try {
      // 🚀 REAL API CALL
      const response = await axiosIns.post(`/api/trips/${trip.trip_id}/trigger`, {
        radius: searchRadius,
      });

      const notifiedCount = response.data?.data?.notifiedCount || 0;

      notification.success({
        key,
        message: "Broadcast Successful",
        description: `Successfully notified ${notifiedCount} partners near the pickup location.`,
        placement: "topRight",
        duration: 4,
      });
    } catch (error: any) {
      console.error("[TriggerAction] Failed:", error);
      notification.error({
        key,
        message: "Broadcast Failed",
        description: error.response?.data?.message || "Could not trigger broadcast. Please try again.",
        placement: "topRight",
      });
    } finally {
      setDriverLoading(false);
      setActiveAction(null);
    }
  };

  // ============================================
  // MODAL OK HANDLER
  // ============================================

  const handleModalOk = () => {
    console.log(`[ModalOk] Handling action: ${activeAction}`);
    if (!actionTrip) return;

    switch (activeAction) {
      case "ASSIGN_DRIVER":
        confirmAssignDriver(actionTrip);
        break;
      case "ADJUST_FARE":
        confirmAdjustFare(actionTrip);
        break;
      case "CANCEL_TRIP":
        handleCancelTrip(actionTrip);
        break;
      case "TRIGGER_DRIVER":
        confirmTriggerBroadcast(actionTrip);
        break;
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="flex-grow overflow-hidden h-full">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="trip_id"
        pagination={{
          pageSize: 6,
          className: "!mb-0 !mt-4",
          size: "small"
        }}
        scroll={{ x: 'max-content', y: 'calc(100vh - 425px)' }}
        sticky
        className="premium-table-container"
      />

      {/* Drawer */}
      <TripDetailsDrawer
        open={drawerOpen}
        trip={trip}
        onClose={() => {
          setDrawerOpen(false);
          setActionTrip(null);
          // ✅ Removed: setActiveAction(null) - Don't close modal when drawer closes
        }}
        activeAction={activeAction}
        onAssignDriverClick={() => {
          console.log("[DrawerCallback] Setting activeAction to ASSIGN_DRIVER");
          setActiveAction("ASSIGN_DRIVER");
        }}
        onAdjustFareClick={() => {
          console.log("[DrawerCallback] Setting activeAction to ADJUST_FARE");
          setActiveAction("ADJUST_FARE");
        }}
        onCancelTripClick={() => {
          console.log("[DrawerCallback] Setting activeAction to CANCEL_TRIP");
          setActiveAction("CANCEL_TRIP");
        }}
        onTriggerDriversClick={() => {
          console.log("[DrawerCallback] Setting activeAction to TRIGGER_DRIVER");
          setActiveAction("TRIGGER_DRIVER");
        }}
        isTripCompleted={isTripCompleted}
        isDriverAssigned={isDriverAssigned}
      />

      {/* Modal */}
      <Modal
        open={activeAction !== null}
        onCancel={() => {
          console.log(`[Modal] Cancelled action: ${activeAction}`);
          setActiveAction(null);
          setSelectedDriver(null);
          setAdjustedFare("");
          setSearchRadius(500);
        }}
        onOk={handleModalOk}
        title={
          activeAction === "ASSIGN_DRIVER"
            ? trip?.driver_name
              ? "Reassign Driver"
              : "Assign Driver"
            : activeAction
              ? titleMap[activeAction]
              : ""
        }
        okButtonProps={{
          disabled:
            (activeAction === "ASSIGN_DRIVER" && !selectedDriver) ||
            (activeAction === "ADJUST_FARE" && !adjustedFare),
        }}
        okText={activeAction ? okTextMap[activeAction] : "OK"}
      >
        {activeAction === "ASSIGN_DRIVER" && AssignDriverContent}
        {activeAction === "ADJUST_FARE" && AdjustFareContent}
        {activeAction === "CANCEL_TRIP" && CancelTripContent}
        {activeAction === "TRIGGER_DRIVER" && TriggerBroadcastContent}
      </Modal>
    </div>
  );
};

export default TripDetailsTable;