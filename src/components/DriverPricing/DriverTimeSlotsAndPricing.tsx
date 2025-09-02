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
  Form,
} from "antd";
import { useState } from "react";
import { BsClock } from "react-icons/bs";
import { FaRegStar } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import type { Dayjs } from "dayjs";

type Day =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

interface TimeSlot {
  id: number;
  day: Day;
  timeRange: [Dayjs | null, Dayjs | null];
  price: number;
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
    <div className="w-full p-4 flex flex-wrap gap-4 items-center justify-center md:justify-around">
      <span>Slot {index + 1}</span>
      <div className="flex gap-1 items-center">
        <span>Day</span>
        <div>
          <Select
            value={slot.day}
            options={dayOptions}
            className="w-32"
            onChange={(day) => updateTimeSlot(index, { day })}
          />
        </div>
      </div>
      <div className="flex gap-1 items-center">
        <div>
          <TimePicker.RangePicker
            placeholder={["From", "To"]}
            format={"HH:mm A"}
            needConfirm={false}
            value={slot.timeRange}
            onChange={(timeRange) =>
              updateTimeSlot(index, {
                timeRange: timeRange as [Dayjs | null, Dayjs | null],
              })
            }
          />
        </div>
      </div>
      <div className="flex gap-1 items-center">
        <span>Price(₹)</span>
        <div>
          <Input
            style={{
              width: 100,
            }}
            value={slot.price}
            onChange={(e) =>
              updateTimeSlot(index, { price: Number(e.target.value) })
            }
            type="number"
          />
        </div>
      </div>
      <div className="flex gap-1 items-center">
        <span>₹{slot.price || "0"}</span>
        <Badge
          status="success"
          count={"+90 %"}
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

const DriverTimeSlotsAndPricing = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: 1, day: "monday", timeRange: [null, null], price: 1000 },
  ]);

  const addTimeSlot = () => {
    setTimeSlots([
      ...timeSlots,
      {
        id:
          timeSlots.length > 0
            ? Math.max(...timeSlots.map((t) => t.id)) + 1
            : 1,
        day: "monday",
        timeRange: [null, null],
        price: 0,
      },
    ]);
  };

  const updateTimeSlot = (index: number, updatedSlot: Partial<TimeSlot>) => {
    const newTimeSlots = [...timeSlots];
    newTimeSlots[index] = { ...newTimeSlots[index], ...updatedSlot };
    setTimeSlots(newTimeSlots);
  };

  const removeTimeSlot = (id: number) => {
    setTimeSlots(timeSlots.filter((slot) => slot.id !== id));
  };

  return (
    <Card size="small">
      <div className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-between w-full">
          <div className="w-full flex items-center gap-1">
            <div>
              <BsClock className="text-[20px] text-[#0080FF]" />
            </div>
            <div>
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
            defaultValue="normal-user"
            className="w-full "
            onChange={(value) => {
              console.log(value); // string
            }}
          />
        </div>
        <div className="flex gap-1 justify-between items-center">
          <div className="flex gap-2">
            <div>
              <Tag color="#5599FF">
                <div className="flex gap-1 items-center">
                  <FiUsers />
                  <span>Normal User</span>
                </div>
              </Tag>
            </div>
            <span className="text-[#535454]">Standard ride pricing</span>
          </div>
          <div>
            <Button icon={<PlusOutlined />} onClick={addTimeSlot}>
              Add Time Slot
            </Button>
          </div>
        </div>
        <List
          itemLayout="horizontal"
          dataSource={timeSlots}
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
      </div>
    </Card>
  );
};

export default DriverTimeSlotsAndPricing;
