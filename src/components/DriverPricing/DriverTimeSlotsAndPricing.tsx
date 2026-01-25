import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Input,
  List,
  Segmented,
  Select,
  Tag,
  TimePicker,
} from "antd";
import { useState, useEffect } from "react";
import { BsClock } from "react-icons/bs";
import { FaRegStar } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import dayjs, { type Dayjs } from "dayjs";
import { LuZap } from "react-icons/lu";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchHotspots } from "../../store/slices/hotspotSlice";

export type Day =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface TimeSlot {
  id: number;
  day: Day;
  timeRange: [Dayjs, Dayjs] | null;
  price: number;
}

export type UserType = "normal-driver" | "premium-driver" | "elite-driver";

export interface UserTimeSlots {
  "normal-driver": TimeSlot[];
  "premium-driver": TimeSlot[];
  "elite-driver": TimeSlot[];
}

const dayOptions = [
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
  { label: "Sunday", value: "sunday" },
];

const TimeSlotItem = ({
  slot,
  index,
  updateTimeSlot,
  removeTimeSlot,
  globalPrice,
  hasCollision,
}: {
  slot: TimeSlot;
  index: number;
  updateTimeSlot: (index: number, updatedSlot: Partial<TimeSlot>) => void;
  removeTimeSlot: (id: number) => void;
  globalPrice: number;
  hasCollision: boolean;
}) => {
  return (
    <div
      className={`w-full p-3 sm:p-4 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start sm:items-center justify-start sm:justify-center rounded-md ${
        hasCollision
          ? "bg-red-50 border-2 border-red-300"
          : "bg-[#F8F9FA] border-2 border-transparent"
      }`}
    >
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="font-medium">Slot {index + 1}</span>
        {hasCollision && (
          <Tag color="error" className="text-xs">
            Time Collision!
          </Tag>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:flex-1">
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <span className="text-sm font-medium min-w-fit">Day:</span>
          <Select
            value={slot.day}
            options={dayOptions}
            className="w-full sm:w-32"
            onChange={(day) => updateTimeSlot(index, { day })}
            status={hasCollision ? "error" : undefined}
          />
        </div>

        <div className="flex gap-2 items-center w-full sm:w-auto">
          <span className="text-sm font-medium min-w-fit">Time:</span>
          <TimePicker.RangePicker
            value={slot.timeRange}
            format="h:mm A"
            onChange={(timeRange) =>
              updateTimeSlot(index, {
                timeRange: timeRange as [Dayjs, Dayjs] | null,
              })
            }
            className="w-full sm:w-48"
            use12Hours
            status={hasCollision ? "error" : undefined}
          />
        </div>

        <div className="flex gap-2 items-center w-full sm:w-auto">
          <span className="text-sm font-medium min-w-fit">Price:</span>
          <Input
            style={{
              width: 110,
            }}
            value={slot.price}
            onChange={(e) =>
              updateTimeSlot(index, { price: Number(e.target.value) })
            }
            type="number"
            addonBefore="₹"
          />
        </div>
      </div>

      <div className="flex items-baseline justify-between w-full sm:w-auto gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-green-600 text-sm sm:text-base">
            ₹{slot.price || "0"}
          </span>
          <Badge
            status="success"
            count={`${
              globalPrice > 0
                ? Math.round(((slot.price - globalPrice) / globalPrice) * 100)
                : 0
            }%`}
            overflowCount={1000}
            style={{ backgroundColor: "#52c41a" }}
          />
        </div>
        <Button
          icon={<DeleteOutlined />}
          onClick={() => removeTimeSlot(slot.id)}
          danger
          size="small"
        />
      </div>
    </div>
  );
};

interface DriverTimeSlotsAndPricingProps {
  timeSlots: UserTimeSlots;
  setTimeSlots: (timeSlots: UserTimeSlots) => void;
  hotspotEnabled: boolean;
  hotspotId: string;
  multiplier: number;
  globalPrice: number;
}

const DriverTimeSlotsAndPricing = ({
  timeSlots,
  setTimeSlots,
  hotspotEnabled,
  hotspotId,
  multiplier,
  globalPrice,
}: DriverTimeSlotsAndPricingProps) => {
  const [userType, setUserType] = useState<UserType>("normal-driver");

  const dispatch = useAppDispatch();
  const { hotspots } = useAppSelector((state) => state.hotspot);

  // Load hotspots on component mount
  useEffect(() => {
    dispatch(fetchHotspots({ limit: 100 }));
  }, [dispatch]);

  // Get selected hotspot details
  const selectedHotspot = hotspots.find((h) => h.id === hotspotId);

  // Check if a time slot overlaps with any existing slots
  const hasTimeCollision = (
    day: Day,
    timeRange: [Dayjs, Dayjs] | null,
    excludeIndex?: number,
  ): boolean => {
    if (!timeRange) return false;

    const [startTime, endTime] = timeRange;
    const currentSlots = timeSlots[userType];

    return currentSlots.some((slot, index) => {
      // Skip the slot we're currently editing
      if (index === excludeIndex) return false;

      // Check if same day
      if (slot.day !== day) return false;

      // Check if time ranges overlap
      if (!slot.timeRange) return false;

      const [slotStart, slotEnd] = slot.timeRange;

      // Two ranges overlap if:
      // - start falls within existing range, OR
      // - end falls within existing range, OR
      // - existing range falls completely within new range
      const overlaps =
        ((startTime.isAfter(slotStart) || startTime.isSame(slotStart)) &&
          startTime.isBefore(slotEnd)) ||
        (endTime.isAfter(slotStart) &&
          (endTime.isBefore(slotEnd) || endTime.isSame(slotEnd))) ||
        ((startTime.isBefore(slotStart) || startTime.isSame(slotStart)) &&
          (endTime.isAfter(slotEnd) || endTime.isSame(slotEnd)));

      return overlaps;
    });
  };

  const userTypeDetails = {
    "normal-driver": {
      tag: "Normal Driver",
      description: "Standard ride pricing",
      icon: <FiUsers />,
      color: "#5599FF",
      badge: "+5%",
    },
    "premium-driver": {
      tag: "Premium Driver",
      description: "Enhanced service features",
      icon: <FaRegStar className="text-yellow-400" />,
      color: "gold",
      badge: "+10%",
    },
    "elite-driver": {
      tag: "Elite Driver",
      description: "Luxury ride experience",
      icon: <FaRegStar className="text-blue-400" />,
      color: "#5599FF",
      badge: "+8%",
    },
  };

  const addTimeSlot = () => {
    const currentUserTimeSlots = timeSlots[userType];
    const newTimeSlot = {
      id:
        currentUserTimeSlots.length > 0
          ? Math.max(...currentUserTimeSlots.map((t) => t.id)) + 1
          : 1,
      day: "monday" as Day,
      timeRange: [dayjs("7:00 AM", "h:mm A"), dayjs("9:00 AM", "h:mm A")] as [
        Dayjs,
        Dayjs,
      ],
      price: 500,
    };
    setTimeSlots({
      ...timeSlots,
      [userType]: [...currentUserTimeSlots, newTimeSlot],
    });
  };

  const updateTimeSlot = (index: number, updatedSlot: Partial<TimeSlot>) => {
    const newTimeSlots = { ...timeSlots };
    const updatedFullSlot = {
      ...newTimeSlots[userType][index],
      ...updatedSlot,
    };

    newTimeSlots[userType][index] = updatedFullSlot;
    setTimeSlots(newTimeSlots);
  };

  const removeTimeSlot = (id: number) => {
    setTimeSlots({
      ...timeSlots,
      [userType]: timeSlots[userType].filter((slot) => slot.id !== id),
    });
  };

  return (
    <Card size="small">
      <div className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-between w-full">
          <div className="w-full flex items-center gap-1">
            <div>
              <BsClock className="text-[20px] text-[#0080FF]" />
            </div>
            <div className="flex items-center">
              <span className="text-[19px] font-semibold p-0 m-0">
                Driver Time Slots & Pricing
              </span>
            </div>
          </div>
          <div className=""></div>
        </div>
        <div className="w-full px-4">
          <Segmented<string>
            options={[
              {
                className: "w-full",
                label: (
                  <div className="flex gap-1 items-center justify-center flex-wrap py-1 sm:py-0 ">
                    <FiUsers />
                    <span>Normal Driver</span>
                  </div>
                ),
                value: "normal-driver",
              },
              {
                className: "w-full",
                label: (
                  <div className="flex gap-1 items-center justify-center flex-wrap py-1 sm:py-0">
                    <span>
                      <FaRegStar className="text-yellow-400" />
                    </span>
                    <span>Premium Driver</span>
                  </div>
                ),
                value: "premium-driver",
              },
              {
                className: "w-full",
                label: (
                  <div className="flex gap-1 items-center justify-center flex-wrap py-1 sm:py-0">
                    <span>
                      <FaRegStar className="text-yellow-400" />
                    </span>
                    <span>Elite Driver</span>
                  </div>
                ),
                value: "elite-driver",
              },
            ]}
            size="large"
            value={userType}
            className="w-full "
            onChange={(value) => setUserType(value as UserType)}
          />
        </div>
        <div className="flex gap-1 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            <div>
              <Tag color={userTypeDetails[userType].color}>
                <div className="flex gap-1 items-center">
                  {userTypeDetails[userType].icon}
                  <span>{userTypeDetails[userType].tag}</span>
                </div>
              </Tag>
            </div>
            <span className="text-[#535454]">
              {userTypeDetails[userType].description}
            </span>
          </div>
          <div>
            <Button icon={<PlusOutlined />} onClick={addTimeSlot}>
              Add Time Slot
            </Button>
          </div>
        </div>
        <div className="max-h-[37vh] overflow-y-auto pr-1">
          <List
            size="small"
            split={false}
            itemLayout="horizontal"
            dataSource={timeSlots[userType]}
            renderItem={(item, index) => {
              const hasCollision = hasTimeCollision(
                item.day,
                item.timeRange,
                index,
              );
              return (
                <List.Item className="py-0">
                  <TimeSlotItem
                    slot={item}
                    index={index}
                    updateTimeSlot={updateTimeSlot}
                    removeTimeSlot={removeTimeSlot}
                    globalPrice={globalPrice}
                    hasCollision={hasCollision}
                  />
                </List.Item>
              );
            }}
          />
        </div>

        {hotspotEnabled && selectedHotspot && (
          <div className="w-full p-4 flex flex-col gap-2 bg-[#F8F9FA] rounded-md">
            <div className="flex gap-2 items-center">
              <Tag color="processing">
                <div className="flex gap-1 items-center">
                  <LuZap />
                  <span>{selectedHotspot.hotspot_name}</span>
                </div>
              </Tag>
              <span className="text-sm">Active Hotspot Configuration</span>
            </div>
            <span className="text-sm">
              Fare: ₹{Number(selectedHotspot.fare).toFixed(2)} • Multiplier:{" "}
              {multiplier}x
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DriverTimeSlotsAndPricing;
