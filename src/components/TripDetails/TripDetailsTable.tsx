import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Table,
  Tag,
  Drawer,
  Divider,
  Descriptions,
  Button,
  Dropdown,
  Popconfirm,
  Select,
  Spin,
  Input,
  Tooltip,
  notification,
} from "antd";

import type { TableColumnsType } from "antd";

import { GrPhone, GrLocation } from "react-icons/gr";

import {
  UserOutlined,
  CarOutlined,
  EnvironmentOutlined,
  UserAddOutlined,
  DollarOutlined,
  CloseCircleOutlined,
  BellOutlined,
  MessageOutlined,
  FolderOutlined,
  MoneyCollectOutlined,
  MoreOutlined,
  StopOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

import {
  IoReceiptOutline,
  IoPeopleOutline,
  IoCalendarOutline,
} from "react-icons/io5";

import { CloseOutlined } from "@ant-design/icons";
import {
  adjustFareUI,
  assignDriverUI,
  buildTripHistory,
  type TripDetailsType,
  type TripHistoryItem,
} from "../../store/slices/tripSlice";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";

const { Text } = Typography;

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

type ActionType =
  | "ASSIGN_DRIVER"
  | "CANCEL_TRIP"
  | "ADJUST_FARE"
  | "TRIGGER_DRIVER"
  | null;

type ActionSource = "DRAWER" | "TABLE" | null;

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

  const tripHistory = trip ? buildTripHistory(trip) : [];

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverLoading, setDriverLoading] = useState(false);

  const [activeAction, setActiveAction] = useState<ActionType>(null);

  const [actionSource, setActionSource] = useState<ActionSource>(null);

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
          isDriverAssigned(r) ? "Reassign Driver" : "Assign Driver"
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

  const timelineItems = [
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

  //trip change history

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

  const changeTripContent = (
    change: TripDetailsType["trip_changes"][number]
  ) => {
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
        <span className="font-medium" style={{ color: "#000080" }}>
          {r.trip_id}
        </span>
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
        <div onClick={(e) => e.stopPropagation()}>
          {/* Assign Driver Popconfirm anchor */}
          <Popconfirm
            {...getAssignDriverPopconfirmProps(r)}
            open={
              activeAction === "ASSIGN_DRIVER" &&
              actionSource === "TABLE" &&
              actionTrip?.trip_id === r.trip_id
            }
            title={isDriverAssigned(r) ? "Reassign Driver" : "Assign Driver"}
            icon={<UserAddOutlined />}
            onConfirm={() => {
              confirmAssignDriver(r);
              closeAssignDriver();
            }}
            onCancel={closeAssignDriver}
            okButtonProps={{
              disabled: !selectedDriver,
              loading: driverLoading,
            }}
          >
            <span style={{ display: "inline-block", width: 0, height: 0 }} />
          </Popconfirm>

          {/* Adjust Fare Popconfirm */}
          <Popconfirm
            title="Adjust Fare"
            description={AdjustFareContent}
            open={
              activeAction === "ADJUST_FARE" &&
              actionSource === "TABLE" &&
              actionTrip?.trip_id === r.trip_id
            }
            icon={<DollarOutlined />}
            okText="Update"
            cancelText="Cancel"
            okButtonProps={{ disabled: !adjustedFare }}
            onConfirm={() => confirmAdjustFare(r)}
            onCancel={closeAdjustFare}
          >
            <span style={{ display: "inline-block", width: 0, height: 0 }} />
          </Popconfirm>

          <Popconfirm
            title="Cancel Trip"
            description={CancelTripContent}
            icon={<CloseCircleOutlined />}
            okText="Yes, Cancel"
            cancelText="No"
            okButtonProps={{ danger: true }}
            open={
              activeAction === "CANCEL_TRIP" &&
              actionSource === "TABLE" &&
              actionTrip?.trip_id === r.trip_id
            }
            onConfirm={() => confirmCancelTrip(r)}
            onCancel={closeCancelTrip}
          >
            <span style={{ display: "inline-block", width: 0, height: 0 }} />
          </Popconfirm>

          <Popconfirm
            title="Trigger Drivers"
            description={TriggerDriversContent}
            icon={<BellOutlined />}
            okText="Trigger"
            cancelText="Cancel"
            open={
              activeAction === "TRIGGER_DRIVER" &&
              actionSource === "TABLE" &&
              actionTrip?.trip_id === r.trip_id
            }
            onConfirm={() => confirmTriggerDrivers(r)}
            onCancel={closeTriggerDrivers}
          >
            <span style={{ display: "inline-block", width: 0, height: 0 }} />
          </Popconfirm>

          <Dropdown
            trigger={["click"]}
            menu={{
              items: menuItems(r),
              onClick: ({ key }) => {
                if (isTripCompleted(r)) return;

                setActionTrip(r);
                setActionSource("TABLE");

                switch (key) {
                  case "assign_driver":
                    setActiveAction("ASSIGN_DRIVER");
                    break;
                  case "fare":
                    setActiveAction("ADJUST_FARE");
                    break;
                  case "cancel":
                    setActiveAction("CANCEL_TRIP");
                    break;
                  case "trigger":
                    setActiveAction("TRIGGER_DRIVER");
                    break;
                }
              },
            }}
          >
            <MoreOutlined style={{ cursor: "pointer" }} />
          </Dropdown>
        </div>
      ),
    },
  ];

  // 🔹 Reusable Card Section
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
        })
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
    setActionSource(null);
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
      })
    );

    setAdjustedFare("");
    closeAdjustFare();
  };

  const closeAdjustFare = () => {
    setActiveAction(null);
    setActionSource(null);

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
    setActionSource(null);
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
    setActionSource(null);
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="trip_id"
        pagination={{ pageSize: 6 }}
        onRow={(record) => ({
          onClick: () => {
            setActionTrip(record);
            setDrawerOpen(true);
          },
        })}
      />

      {/* Drawer */}
      <Drawer
        title={
          <div className="flex gap-20 flex-wrap">
            <div>
              <div>Trip Details</div>
              <p className="font-medium" style={{ color: "#000080" }}>
                {trip?.trip_id}
              </p>
            </div>
            <div className="flex gap-2">
              <Popconfirm
                {...getAssignDriverPopconfirmProps(trip)}
                open={
                  activeAction === "ASSIGN_DRIVER" && actionSource === "DRAWER"
                }
                okButtonProps={{
                  disabled: !selectedDriver || isTripCompleted(trip),
                }}
                icon={<UserAddOutlined style={{ color: "blue" }} />}
                onConfirm={() => {
                  confirmAssignDriver(trip);
                  closeAssignDriver();
                }}
                onCancel={closeAssignDriver}
              >
                <Tooltip
                  title={isTripCompleted(trip) ? "Trip already completed" : ""}
                >
                  <Button
                    disabled={isTripCompleted(trip)}
                    onClick={() => {
                      if (!trip) return;
                      setActionTrip(trip);
                      setActionSource("DRAWER");
                      setActiveAction("ASSIGN_DRIVER");
                    }}
                  >
                    <UserAddOutlined />
                    {isDriverAssigned(trip)
                      ? "Reassign Driver"
                      : "Assign Driver"}
                  </Button>
                </Tooltip>
              </Popconfirm>

              <Popconfirm
                title="Adjust Fare"
                description={AdjustFareContent}
                open={
                  activeAction === "ADJUST_FARE" && actionSource === "DRAWER"
                }
                icon={<DollarOutlined />}
                okText="Update"
                cancelText="Cancel"
                okButtonProps={{ disabled: !adjustedFare }}
                onConfirm={() => confirmAdjustFare(actionTrip)}
                onCancel={closeAdjustFare}
              >
                <Button
                  onClick={() => {
                    if (!trip) return;
                    setActionTrip(trip);
                    setActionSource("DRAWER");
                    setActiveAction("ADJUST_FARE");
                  }}
                >
                  <DollarOutlined />
                  Adjust Fare
                </Button>
              </Popconfirm>

              <Popconfirm
                title="Cancel Trip"
                description={CancelTripContent}
                icon={<CloseCircleOutlined style={{ color: "red" }} />}
                okText="Yes, Cancel"
                cancelText="No"
                okButtonProps={{ danger: true }}
                open={
                  activeAction === "CANCEL_TRIP" && actionSource === "DRAWER"
                }
                onConfirm={() => confirmCancelTrip(trip)}
                onCancel={closeCancelTrip}
              >
                <Button
                  danger
                  onClick={() => {
                    if (!trip) return;
                    setActionTrip(trip);
                    setActionSource("DRAWER");
                    setActiveAction("CANCEL_TRIP");
                  }}
                >
                  <CloseCircleOutlined />
                  Cancel Trip
                </Button>
              </Popconfirm>

              <Popconfirm
                title="Trigger Drivers"
                description={TriggerDriversContent}
                icon={<BellOutlined />}
                okText="Trigger"
                cancelText="Cancel"
                open={
                  activeAction === "TRIGGER_DRIVER" && actionSource === "DRAWER"
                }
                onConfirm={() => confirmTriggerDrivers(trip)}
                onCancel={closeTriggerDrivers}
              >
                <Button
                  onClick={() => {
                    if (!trip) return;
                    setActionTrip(trip);
                    setActionSource("DRAWER");
                    setActiveAction("TRIGGER_DRIVER");
                  }}
                >
                  <BellOutlined />
                  Trigger Drivers
                </Button>
              </Popconfirm>
            </div>
          </div>
        }
        placement="right"
        width="100%"
        //width={window.innerWidth < 768 ? "100%" : 620}
        onClose={() => {
          setDrawerOpen(false);
          setActionTrip(null);
          setActiveAction(null);
          setActionSource(null);
        }}
        open={drawerOpen}
        closeIcon={<CloseOutlined />}
      >
        {!trip ? (
          <p>No trip selected</p>
        ) : (
          <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:[grid-template-columns:28%_26%_23%_23%]">
            <div>
              {/* basic information */}
              <DetailCard
                icon={
                  <IoReceiptOutline size={20} className="text-indigo-600" />
                }
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
                <Descriptions
                  layout="vertical"
                  size="small"
                  colon={false}
                  column={1}
                >
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
                    <div className="flex gap-3">
                      <div className="w-[80px] border border-gray-300 bg-gray-300 rounded-md px-2 py-2 text-center">
                        <strong className="block text-[10px]">
                          {trip?.Estimate_km}
                        </strong>
                        <p className="m-0 text-[10px]">Estimate Km</p>
                      </div>

                      <div className="w-[80px] border border-gray-300 bg-gray-300 rounded-md px-2 py-2 text-center">
                        <strong className="block text-[10px]">
                          {trip?.trip_duration_minutes}
                        </strong>
                        <p className="m-0 text-[10px]">Duration</p>
                      </div>

                      <div className="w-[80px] border border-gray-300 bg-gray-300 rounded-md px-2 py-2 text-center">
                        <strong className="block text-[10px]">
                          {trip?.distance_km}
                        </strong>
                        <p className="m-0 text-[10px]">Covered Km</p>
                      </div>

                      <div className="w-[80px] border border-violet-300 bg-violet-100 rounded-md px-2 py-2 text-center">
                        <strong className="block text-[10px]">
                          ₹{trip?.total_fare}
                        </strong>
                        <p className="m-0 text-[10px]">Total Fare</p>
                      </div>
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </DetailCard>

              {/* User Trip Changes History */}
              <DetailCard
                icon={
                  <HistoryOutlined style={{ fontSize: 18, color: "#4f46e5" }} />
                }
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
                          <span className="font-semibold">
                            {change.change_type}
                          </span>
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
            </div>

            {/* 2nd  div */}
            <div>
              {/* payment details */}
              <DetailCard
                icon={
                  <FolderOutlined style={{ fontSize: 20, color: "#4f46e5" }} />
                }
                title="Payment Details"
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item>
                    <div className="flex gap-10">
                      <div>
                        <p className="m-0 text-xs">Amount</p>
                        <strong className="block text-xs ">
                          ₹{trip?.total_fare}
                        </strong>
                      </div>

                      <div className="w-px bg-gray-300 self-stretch" />

                      <div>
                        <p className="m-0 text-xs">Method</p>
                        <strong className="block text-xs ">
                          {trip?.payment_method}
                        </strong>
                      </div>

                      <div className="w-px bg-gray-300 self-stretch" />

                      <div>
                        <p className="m-0 text-xs">Status</p>
                        <strong
                          className={`inline-block px-2 py-[2px] text-[11px] rounded border font-medium
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

              {/* Timeline */}
              <DetailCard
                icon={
                  <IoCalendarOutline size={18} className="text-indigo-600" />
                }
                title="Trip Timeline"
              >
                <div className="pl-3">
                  {timelineItems.map((item, index) => (
                    <div key={index} className="relative flex gap-3 pb-5">
                      {index !== timelineItems.length - 1 && (
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

              {/* user and driver details*/}
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
                      <Button size="small">
                        <GrPhone /> Call
                      </Button>
                      <Button size="small">
                        <MessageOutlined /> Message
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
                          <Button size="small">
                            <GrPhone /> Call
                          </Button>
                          <Button size="small">
                            <MessageOutlined /> Message
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
            </div>

            {/* 3rd div */}
            <div>
              {/* Fare Breakdown */}
              <DetailCard
                icon={
                  <MoneyCollectOutlined
                    style={{ fontSize: 20, color: "#4f46e5" }}
                  />
                }
                title="Fare Breakdown"
              >
                <Descriptions.Item>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-2 items-center text-sm ">
                    <div className="text-gray-800">
                      Base Fare
                      <span className="text-gray-400 ml-1">
                        (Fixed Minimum)
                      </span>
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
                      <span className="text-gray-400 ml-1">
                        ({trip?.ride_type} )
                      </span>
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
                    <div className="text-violet-800 font-semibold">
                      Total Fare
                    </div>

                    <div className="font-semibold text-violet-900 justify-self-end">
                      ₹ {trip?.total_fare}
                    </div>
                  </div>
                </Descriptions.Item>
              </DetailCard>
            </div>

            {/* 4th div */}

            <div>
              {/* Trip Change History */}

              <DetailCard
                icon={
                  <HistoryOutlined style={{ fontSize: 18, color: "#4f46e5" }} />
                }
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
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TripDetailsTable;
