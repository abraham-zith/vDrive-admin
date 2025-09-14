import { useState, useEffect } from "react";
import { Card, Typography, Tag, Button } from "antd";
import { MdOutlineLocationOn } from "react-icons/md";
import { BsClock } from "react-icons/bs";
import { ThunderboltOutlined } from "@ant-design/icons";
import {
  type UserTimeSlots,
  type UserType,
  type TimeSlot,
} from "./DriverTimeSlotsAndPricing";
import {
  mockHotspotApi,
  type HotspotType,
} from "../../utilities/mockHotspotApi";

interface PricingPreviewProps {
  country: string;
  state: string;
  district: string;
  area: string;
  pincode: string;
  timeSlots: UserTimeSlots;
  hotspotEnabled: boolean;
  hotspotType: string;
  multiplier: number;
}

const PricingPreview = ({
  country,
  state,
  district,
  area,
  pincode,
  timeSlots,
  hotspotEnabled,
  hotspotType,
  multiplier,
}: PricingPreviewProps) => {
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

  const hotspotAddition = selectedHotspotType?.addition || 40;

  const userTypeTags = {
    "normal-user": <Tag color="default">Normal User</Tag>,
    "premium-user": <Tag color="gold">Premium User</Tag>,
    "elite-user": <Tag color="blue">Elite User</Tag>,
  };

  const handleSave = async () => {
    try {
    } catch (error) {}
  };

  return (
    <Card size="small" className="w-full">
      <div className="w-full flex flex-col gap-4">
        <Typography.Title level={5} className="text-lg sm:text-xl">
          Pricing Preview
        </Typography.Title>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <MdOutlineLocationOn className="text-[20px] text-[#0080FF]" />
            <span className="font-semibold">Location</span>
          </div>
          <div className="p-2 bg-[#F8F9FA] rounded-md">
            <span className="text-sm break-all">
              {country}-{state}-{district}-{area}-{pincode}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <BsClock className="text-[18px] text-[#0080FF]" />
            <span className="font-semibold">Time Slots Summary</span>
          </div>
          <div className="flex flex-col gap-2">
            {Object.entries(timeSlots).map(([userType, slots]) =>
              slots.map((slot: TimeSlot) => (
                <div key={`${userType}-${slot.id}`}>
                  {userTypeTags[userType as UserType]}
                  <div className="p-2 bg-[#F8F9FA] rounded-md flex flex-col sm:flex-row sm:justify-between gap-2">
                    <div className="flex-1">
                      <span className="capitalize font-medium">{slot.day}</span>
                      <br />
                      <span className="text-[12px] text-gray-600">
                        {slot.timeRange
                          ? `${slot.timeRange[0].format(
                              "h:mm A"
                            )} - ${slot.timeRange[1].format("h:mm A")}`
                          : "No time set"}
                      </span>
                      <br />
                      <span className="text-[12px] text-gray-600">
                        Base: ₹{slot.price}
                      </span>
                    </div>
                    <div className="font-semibold text-green-600 sm:text-right">
                      Final: ₹
                      {hotspotEnabled
                        ? slot.price * multiplier + hotspotAddition
                        : slot.price}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {hotspotEnabled && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <ThunderboltOutlined className="text-[18px] text-[#0080FF]" />
              <span className="font-semibold">Hotspot Effect</span>
            </div>
            <div className="p-2 bg-[#F8F9FA] rounded-md">
              <Tag color="blue">{selectedHotspotType?.name || "Hotspot"}</Tag>
              <div className="text-sm">Addition: +₹{hotspotAddition}</div>
              <div className="text-sm">Multiplier: {multiplier}x</div>
              <div className="text-green-500 text-sm">
                Base rate increase applied
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className="font-semibold">Total Configuration</span>
          {Object.entries(timeSlots).map(([userType, slots]) => (
            <div key={userType} className="text-[12px]">
              <span className="capitalize">{userType.replace("-", " ")}:</span>{" "}
              {slots.length} slots
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PricingPreview;
