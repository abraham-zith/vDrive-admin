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
import {
  mockHotspotApi,
  type HotspotType,
} from "../../utilities/mockHotspotApi";

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

export type UserType = "normal-user" | "premium-user" | "elite-user";

export interface UserTimeSlots {
  "normal-user": TimeSlot[];
  "premium-user": TimeSlot[];
  "elite-user": TimeSlot[];
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
}: {
  slot: TimeSlot;
  index: number;
  updateTimeSlot: (index: number, updatedSlot: Partial<TimeSlot>) => void;
  removeTimeSlot: (id: number) => void;
}) => {
  return (
    <div className="w-full p-4 flex flex-wrap gap-4 items-center justify-center md:justify-around bg-[#F8F9FA] rounded-md">
      <span>Slot {index + 1}</span>
      <div className="flex gap-1 items-center">
        <span>Day</span>
        <Select
          value={slot.day}
          options={dayOptions}
          className="w-32"
          onChange={(day) => updateTimeSlot(index, { day })}
        />
      </div>
      <div className="flex gap-1 items-center">
        {/* <span>Time Range</span> */}
        <TimePicker.RangePicker
          value={slot.timeRange}
          format="h:mm A"
          onChange={(timeRange) =>
            updateTimeSlot(index, { timeRange: timeRange || null })
          }
          className="w-48"
          use12Hours
        />
      </div>
      <div className="flex gap-1 items-center">
        <span>Price</span>
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
      <div className="flex gap-1 items-center">
        <span className="font-bold text-green-600">₹{slot.price || "0"}</span>
        <Badge
          status="success"
          count={"+13%"}
          overflowCount={1000}
          style={{ backgroundColor: "#52c41a" }}
        />
      </div>
      <Button
        icon={<DeleteOutlined />}
        onClick={() => removeTimeSlot(slot.id)}
        danger
      />
    </div>
  );
};

interface DriverTimeSlotsAndPricingProps {
  timeSlots: UserTimeSlots;
  setTimeSlots: (timeSlots: UserTimeSlots) => void;
  hotspotEnabled: boolean;
  hotspotType: string;
  multiplier: number;
}

const DriverTimeSlotsAndPricing = ({
  timeSlots,
  setTimeSlots,
  hotspotEnabled,
  hotspotType,
  multiplier,
}: DriverTimeSlotsAndPricingProps) => {
  const [userType, setUserType] = useState<UserType>("elite-user");
  const [hotspotTypes, setHotspotTypes] = useState<HotspotType[]>([]);

  // Load hotspot types on component mount
  useEffect(() => {
    loadHotspotTypes();
  }, []);

  const loadHotspotTypes = async () => {
    try {
      const types = await mockHotspotApi.getHotspotTypes();
      setHotspotTypes(types);
    } catch (error) {
      console.error("Failed to load hotspot types");
    }
  };

  // Get selected hotspot type details
  const selectedHotspotType = hotspotTypes.find(
    (type) => type.name.toLowerCase().replace(/\s+/g, "-") === hotspotType
  );

  const userTypeDetails = {
    "normal-user": {
      tag: "Normal User",
      description: "Standard ride pricing",
      icon: <FiUsers />,
      color: "#5599FF",
      badge: "+5%",
    },
    "premium-user": {
      tag: "Premium User",
      description: "Enhanced service features",
      icon: <FaRegStar className="text-yellow-400" />,
      color: "gold",
      badge: "+10%",
    },
    "elite-user": {
      tag: "Elite User",
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
        Dayjs
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
    newTimeSlots[userType][index] = {
      ...newTimeSlots[userType][index],
      ...updatedSlot,
    };
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
                  <div className="flex gap-1 items-center justify-center">
                    <FiUsers />
                    <span>Normal User</span>
                  </div>
                ),
                value: "normal-user",
              },
              {
                className: "w-full",
                label: (
                  <div className="flex gap-1 items-center justify-center">
                    <span>
                      <FaRegStar className="text-yellow-400" />
                    </span>
                    Premium User
                  </div>
                ),
                value: "premium-user",
              },
              {
                className: "w-full",
                label: (
                  <div className="flex gap-1 items-center justify-center">
                    <span>
                      <FaRegStar className="text-yellow-400" />
                    </span>
                    Elite User
                  </div>
                ),
                value: "elite-user",
              },
            ]}
            size="large"
            value={userType}
            className="w-full "
            onChange={(value) => setUserType(value as UserType)}
          />
        </div>
        <div className="flex gap-1 justify-between items-center">
          <div className="flex gap-2">
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
        <List
          itemLayout="horizontal"
          dataSource={timeSlots[userType]}
          renderItem={(item, index) => (
            <List.Item>
              <TimeSlotItem
                slot={item}
                index={index}
                updateTimeSlot={updateTimeSlot}
                removeTimeSlot={removeTimeSlot}
              />
            </List.Item>
          )}
        />
        {hotspotEnabled && selectedHotspotType && (
          <div className="w-full p-4 flex flex-col gap-2 bg-[#F8F9FA] rounded-md">
            <div className="flex gap-2 items-center">
              <Tag color="processing">
                <div className="flex gap-1 items-center">
                  <LuZap />
                  <span>{selectedHotspotType.name}</span>
                </div>
              </Tag>
              <span className="text-sm">Active Hotspot Configuration</span>
            </div>
            <span className="text-sm">
              Addition: +₹{selectedHotspotType.addition} • Multiplier:{" "}
              {multiplier}x
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DriverTimeSlotsAndPricing;
