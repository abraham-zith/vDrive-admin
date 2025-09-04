import { useState, useEffect } from "react";
import { Card, Typography, Tag, Button, Spin } from "antd";
import { MdOutlineLocationOn } from "react-icons/md";
import { BsClock } from "react-icons/bs";
import { ThunderboltOutlined, LoadingOutlined } from "@ant-design/icons";
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
  const [loading, setLoading] = useState(true);

  // Load hotspot types on component mount
  useEffect(() => {
    loadHotspotTypes();
  }, []);

  const loadHotspotTypes = async () => {
    try {
      setLoading(true);
      const types = await mockHotspotApi.getHotspotTypes();
      setHotspotTypes(types);
    } catch (error) {
      console.error("Failed to load hotspot types");
    } finally {
      setLoading(false);
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

  return (
    <Card size="small" className="w-full">
      <div className="w-full flex flex-col gap-4">
        <Typography.Title level={5}>Pricing Preview</Typography.Title>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <MdOutlineLocationOn className="text-[20px] text-[#0080FF]" />
            <span className="font-semibold">Location</span>
          </div>
          <div className="p-2 bg-[#F8F9FA] rounded-md">
            <span>
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
                  <div className="p-2 bg-[#F8F9FA] rounded-md flex justify-between">
                    <div>
                      <span className="capitalize">{slot.day}</span>
                      <br />
                      <span className="text-[12px]">
                        {slot.timeRange
                          ? `${slot.timeRange[0].format(
                              "h:mm A"
                            )} - ${slot.timeRange[1].format("h:mm A")}`
                          : "No time set"}
                      </span>
                      <br />
                      <span className="text-[12px]">Base: ₹{slot.price}</span>
                    </div>
                    <div className="font-semibold">
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
              <div>Addition: +₹{hotspotAddition}</div>
              <div>Multiplier: {multiplier}x</div>
              <div className="text-green-500">Base rate increase applied</div>
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

        <div className="flex justify-end gap-2">
          <Button>Cancel</Button>
          <Button type="primary">Save Rule</Button>
          <Button type="primary" style={{ background: "#4CAF50" }}>
            Save & Add Another
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PricingPreview;
