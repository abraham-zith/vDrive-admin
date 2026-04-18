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

interface Props {
  data: TripDetailsType[];
  isSuperAdmin?: boolean;
}

// driver details popconfirms

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
  ADJUST_FARE: "Update",
  CANCEL_TRIP: "Cancel",
  TRIGGER_DRIVER: "Trigger",
};

const okTitleMap = {
  ADJUST_FARE: "Adjust Fare ",
  CANCEL_TRIP: "Cancel Trip",
  TRIGGER_DRIVER: "Trigger Driver",
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
  //const [trip, setTrip] = useState<TripDetailsType | null>(null);

  const trips = useSelector((state: RootState) => state.trips.trips);

  const [actionTrip, setActionTrip] = useState<TripDetailsType | null>(null);

  const trip = React.useMemo(() => {
    if (!actionTrip) return null;
    return trips.find((t) => t.trip_id === actionTrip.trip_id) ?? null;
  }, [trips, actionTrip]);

  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverLoading, setDriverLoading] = useState(false);

  const [activeAction, setActiveAction] = useState<ActionType>(null);

  const [adjustedFare, setAdjustedFare] = useState<string>("");
  const adjustedFareNumber = Number(adjustedFare || 0);

  // assign driver pop confirm
  React.useEffect(() => {
    setSelectedDriver(null);
  }, [trip]);

  useEffect(() => {
    if (!trip) return;

    // later API call
    setDrivers(mockDrivers); // remove this later
  }, [trip]);

  const handleDriverChange = (driverId: string) => {
    // 1️⃣ start loading
    setDriverLoading(true);

    // 2️⃣ clear old data
    setSelectedDriver(null);

    // 3️⃣ simulate API delay (2 seconds)
    setTimeout(() => {
      const driver = drivers.find((d) => d.id === driverId) || null;

      setSelectedDriver(driver);
      setDriverLoading(false);
    }, 2000);
  };

  // tabl actions menu

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

  // timeline (covert date and time in readable formate)

  // checking if driver is assigned or not
  const isDriverAssigned = (trip: TripDetailsType | null) =>
    Boolean(trip?.driver_id && trip?.driver_name?.trim());

  // check tripstates completed or not to disable driver assignment

  const isTripCompleted = (trip: TripDetailsType | null) =>
    trip?.trip_status === "COMPLETED";

  //  Table Columns
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

  // Assigndriver,adjustfare

  const AssignDriverContent = (
    <div style={{ width: 260 }}>
      <Select
        showSearch
        placeholder="Type driver name"
        style={{ width: "100%" }}
        value={selectedDriver?.id}
        optionLabelProp="label"
        optionFilterProp="label"
        onChange={handleDriverChange}
      >
        {drivers.map((driver) => (
          <Select.Option
            key={driver.id}
            value={driver.id}
            label={driver.name}
            disabled={driver.status !== "ACTIVE"}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{driver.name}</div>
              </div>
              <Tag color={driver.status === "ACTIVE" ? "green" : "red"}>
                {driver.status}
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

            <Tag color={selectedDriver.status === "ACTIVE" ? "green" : "red"}>
              {selectedDriver.status}
            </Tag>
          </div>

          <div className="mb-2">
            <p className="text-gray-400 text-[11px]">Location</p>
            <p className="font-medium text-gray-900 leading-tight">
              {selectedDriver.location}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-[11px]">Distance</p>
              <p className="font-medium text-gray-900 leading-tight">
                {selectedDriver.distanceKm} km
              </p>
            </div>

            <div className="text-right">
              <p className="text-gray-400 text-[11px]">ETA</p>
              <p className="font-medium text-gray-900 leading-tight">
                {selectedDriver.etaMinutes} mins
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const confirmAssignDriver = (trip: TripDetailsType | null) => {
    if (!trip || !selectedDriver) return;

    const key = `assign-driver-${trip.trip_id}`;

    // 🔹 1️⃣ SHOW LOADING NOTIFICATION
    notification.open({
      key,
      message: "Assigning Driver",
      description: "Please wait while we assign the driver...",
      placement: "topRight",
      duration: 0, // stays until updated
    });

    setDriverLoading(true);

    // 🔹 2️⃣ SIMULATE API CALL
    setTimeout(() => {
      // 🔹 UPDATE REDUX
      dispatch(
        assignDriverUI({
          trip_id: trip.trip_id,
          driver_id: selectedDriver.id,
          driver_name: selectedDriver.name,
          driver_phone: selectedDriver.phonenumber,
        }),
      );

      // 🔹 3️⃣ UPDATE TO SUCCESS NOTIFICATION
      notification.success({
        key,
        message: "Driver Assigned Successfully",
        description: `${selectedDriver.name} has been assigned to this trip`,
        placement: "topRight",
        duration: 3,
      });

      setDriverLoading(false);
      setSelectedDriver(null);
      closeAssignDriver();
    }, 1500);
  };

  const getAssignDriverPopconfirmProps = (trip: TripDetailsType | null) => ({
    title: "Assign Driver",
    description: AssignDriverContent,
    okText: "Assign",
    cancelText: "Cancel",
    okButtonProps: { disabled: !selectedDriver },
    onConfirm: () => confirmAssignDriver(trip),
    onCancel: () => setActiveAction(null),
  });

  const closeAssignDriver = () => {
    setActiveAction(null);
    setSelectedDriver(null);
  };

  const AdjustFareContent = (
    <div style={{ width: 260 }}>
      {/* Existing Fare */}
      <div className="mb-2 text-xs text-gray-500">
        Current Fare: <b>₹{trip?.total_fare ?? 0}</b>
      </div>

      {/* Input */}
      <Input
        type="number"
        prefix="₹"
        placeholder="Enter new total fare"
        value={adjustedFare}
        onChange={(e) => setAdjustedFare(e.target.value)}
      />

      {/* Preview */}
      {adjustedFare && (
        <div className="mt-2 text-xs text-green-600">
          New Total Fare: <b>₹{adjustedFareNumber}</b>
        </div>
      )}
    </div>
  );

  const confirmAdjustFare = (trip: TripDetailsType | null) => {
    if (!trip || !adjustedFare) return;

    dispatch(
      adjustFareUI({
        trip_id: trip.trip_id,
        total_fare: Number(adjustedFare),
      }),
    );

    setAdjustedFare("");
    closeAdjustFare();
  };

  const closeAdjustFare = () => {
    setActiveAction(null);
    setAdjustedFare("");
  };

  //cancel trip

  const CancelTripContent = (
    <div className="text-sm">
      <p className="font-medium text-red-600">
        Are you sure you want to cancel this trip?
      </p>
      <p className="text-gray-500 mt-1">This action cannot be undone.</p>
    </div>
  );

  const handleCancelTrip = async (trip: TripDetailsType | null) => {
    if (!trip) return;

    // later API:
    // api.post(`/trips/${trip.trip_id}/cancel`)

    closeCancelTrip();
  };

  const closeCancelTrip = () => {
    setActiveAction(null);
  };

  // trigger user

  const TriggerDriversContent = (
    <div className="text-sm">
      <p className="font-medium">Notify nearby drivers for this trip?</p>
      <p className="text-gray-500 mt-1">
        This will send a request to available drivers.
      </p>
    </div>
  );

  const handleTriggerDrivers = async (trip: TripDetailsType | null) => {
    if (!trip) return;

    // later API
    // api.post(`/trips/${trip.trip_id}/trigger-drivers`)

    closeTriggerDrivers();
  };

  const closeTriggerDrivers = () => {
    setActiveAction(null);
  };

  const handleModalOk = () => {
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
        handleTriggerDrivers(actionTrip);
        break;
    }

    setActiveAction(null);
  };

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
          setActiveAction(null);
        }}
        activeAction={activeAction}
        onAssignDriverClick={() => confirmAssignDriver(trip)}
        onAdjustFareClick={() => confirmAdjustFare(trip)}
        onCancelTripClick={() => handleCancelTrip(trip)}
        onTriggerDriversClick={() => handleTriggerDrivers(trip)}
        getAssignDriverPopconfirmProps={getAssignDriverPopconfirmProps}
        isTripCompleted={isTripCompleted}
        isDriverAssigned={isDriverAssigned}
        AdjustFareContent={AdjustFareContent}
      />

      <Modal
        open={activeAction !== null}
        onCancel={() => {
          setActiveAction(null);
        }}
        onOk={handleModalOk}
        title={
          activeAction === "ASSIGN_DRIVER"
            ? trip?.driver_name
              ? "Reassign Driver"
              : "Assign Driver"
            : activeAction
              ? okTitleMap[activeAction]
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
        {activeAction === "TRIGGER_DRIVER" && TriggerDriversContent}
      </Modal>
    </div>
  );
};

export default TripDetailsTable;
