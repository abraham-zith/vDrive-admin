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
} from "antd";

import type { TableColumnsType } from "antd";

import { GrPhone } from "react-icons/gr";

import {
  UserOutlined,
  CarOutlined,
  EnvironmentOutlined,
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

const TripDetailsTable: React.FC<Props> = ({ data }) => {
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

    return [
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
      },
    ];
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
      title: "Trip ID",
      dataIndex: "trip_id",
      sorter: (a, b) => a.trip_id.localeCompare(b.trip_id),
      render: (_, r) => (
        <Tooltip title="Click to Open Slider">
          <span
            style={{ color: "#000080", cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              setActionTrip(r);
              setDrawerOpen(true);
            }}
          >
            {r.trip_id}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "User",
      render: (_, r) => (
        <div>
          <div>
            {" "}
            <UserOutlined style={{ marginRight: 6 }} />
            {r.user_name}
          </div>
          <small className="flex items-center gap-1 text-gray-500">
            <GrPhone className="text-xs" />
            {r.user_phone}
          </small>
        </div>
      ),
    },
    {
      title: "Driver",
      render: (_, r) => {
        const hasDriver = isDriverAssigned(r);

        return (
          <div>
            <div className="flex items-center">
              {hasDriver ? (
                <>
                  <CarOutlined style={{ marginRight: 6 }} />
                  <span>{r.driver_name}</span>
                </>
              ) : (
                <span className="text-gray-400 text-xs italic">
                  Not Assigned
                </span>
              )}
            </div>

            {hasDriver && r.driver_phone && (
              <small className="flex items-center gap-1 text-gray-500">
                <GrPhone className="text-xs" />
                {r.driver_phone}
              </small>
            )}
          </div>
        );
      },
    },

    {
      title: "Route",
      render: (_, r) => (
        <div>
          <div className="flex">
            <EnvironmentOutlined style={{ marginRight: 6, color: "green" }} />
            <p className="text-xs">
              {r.pickup_address} → {r.drop_address}
            </p>
          </div>

          <div style={{ fontSize: 12, color: "#888" }}>
            <p className="pl-5">
              {r.distance_km} • ~{r.trip_duration_minutes}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Trip Status",
      render: (_, r) => (
        <Tag
          color={
            r.trip_status === "LIVE"
              ? "green"
              : r.trip_status === "COMPLETED"
                ? "blue"
                : r.trip_status === "REQUESTED"
                  ? "yellow"
                  : r.trip_status === "CANCELLED"
                    ? "red"
                    : r.trip_status === "MID-CANCELLED"
                      ? "pink"
                      : "orange"
          }
        >
          {r.trip_status}
        </Tag>
      ),
    },
    {
      title: "Fare",
      render: (_, r) => <>₹{r.base_fare.toFixed(2)}</>,
    },
    {
      title: "Service",
      render: (_, r) => (
        <Tag style={{ backgroundColor: "#ede9fe", color: "#5b21b6" }}>
          {r.service_type}
        </Tag>
      ),
    },
    {
      title: "Type",
      render: (_, r) => <Tag style={{ color: "#000080" }}>{r.ride_type}</Tag>,
    },
    {
      title: "Actions",
      render: (_, r) => (
        <div className="flex gap-2">
          <div>
            <EyeOutlined
              style={{ cursor: "pointer", fontSize: 16, color: "#000080" }}
              onClick={(e) => {
                e.stopPropagation();
                setActionTrip(r);
                setDrawerOpen(true);
              }}
            />
          </div>

          <div>
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
              <MoreOutlined style={{ cursor: "pointer" }} />
            </Dropdown>
          </div>
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

  const confirmCancelTrip = (trip: TripDetailsType | null) => {
    if (!trip) return;

    console.log("Cancel trip:", trip.trip_id);

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

  const confirmTriggerDrivers = (trip: TripDetailsType | null) => {
    if (!trip) return;

    console.log("Trigger drivers for trip:", trip.trip_id);

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
        confirmCancelTrip(actionTrip);
        break;
      case "TRIGGER_DRIVER":
        confirmTriggerDrivers(actionTrip);
        break;
    }

    setActiveAction(null);
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="trip_id"
        pagination={{ pageSize: 6 }}
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
        onCancelTripClick={() => confirmCancelTrip(trip)}
        onTriggerDriversClick={() => confirmTriggerDrivers(trip)}
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
