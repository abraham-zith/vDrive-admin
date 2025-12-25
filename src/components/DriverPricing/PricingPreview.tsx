import { useState, useEffect } from "react";
import { Card, Typography, Tag } from "antd";
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
import { useAppSelector } from "../../store/hooks";

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

  // Get location data from Redux
  const { countries, states } = useAppSelector((state) => state.location);

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

  // Find labels from Redux data
  const countryLabel =
    countries.find((c) => c.id === country)?.country_name || country;
  const stateLabel = states.find((s) => s.id === state)?.state_name || state;
  const districtLabel = district || "N/A";
  const areaLabel = area || "N/A";
  const pincodeLabel = pincode || "N/A";

  const userTypeTags = {
    "normal-driver": <Tag color="default">Normal Driver</Tag>,
    "premium-driver": <Tag color="gold">Premium Driver</Tag>,
    "elite-driver": <Tag color="blue">Elite Driver</Tag>,
  };

  return (
    <Card size="small" className="w-full">
      <div className="w-full flex flex-col gap-4">
        <Typography.Title level={5} className="text-lg sm:text-xl">
          Pricing Preview
        </Typography.Title>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Location */}
          <div className="flex flex-col gap-2 sm:flex-1">
            <div className="flex items-center gap-2">
              <MdOutlineLocationOn className="text-[20px] text-[#0080FF]" />
              <span className="font-semibold">Location</span>
            </div>

            <div className="p-2 bg-[#F8F9FA] rounded-md">
              <span className="text-sm break-all">
                {countryLabel} - {stateLabel} - {districtLabel} - {areaLabel} -{" "}
                {pincodeLabel}
              </span>
            </div>
          </div>

          {/* Right: Total Configuration */}
          <div className="flex flex-col gap-1 sm:items-end sm:text-right">
            <span className="text-sm font-medium text-gray-700">
              Total configuration
            </span>

            <div className="flex gap-2 flex-wrap justify-end text-xs">
              {Object.entries(timeSlots).map(([userType, slots]) => (
                <span
                  key={userType}
                  className="px-2 py-[2px] rounded-sm border
                     border-violet-300 bg-violet-50 text-violet-700"
                >
                  <span className="capitalize">
                    {userType.replace("-", " ")}
                  </span>
                  <span className="mx-1">:</span>
                  <span className="font-medium">{slots.length}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <BsClock className="text-[18px] text-[#0080FF]" />
            <span className="font-semibold">Time Slots Summary</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(timeSlots).map(([userType, slots]) => (
              <div key={userType} className="flex flex-col gap-2">
                <div className="font-semibold text-center">
                  {userTypeTags[userType as UserType]}
                </div>
                {slots.map((slot: TimeSlot) => (
                  <div
                    key={slot.id}
                    className="p-2 bg-[#F8F9FA] rounded-md flex flex-col gap-1"
                  >
                    <span className="capitalize font-medium">{slot.day}</span>

                    <span className="text-[12px] text-gray-600">
                      {slot.timeRange
                        ? `${slot.timeRange[0].format(
                            "h:mm A"
                          )} - ${slot.timeRange[1].format("h:mm A")}`
                        : "No time set"}
                    </span>

                    <span className="text-[12px] text-gray-600">
                      Base: ₹{slot.price}
                    </span>

                    <span className="font-semibold text-green-600">
                      Final: ₹
                      {hotspotEnabled
                        ? slot.price * multiplier + hotspotAddition
                        : slot.price}
                    </span>
                  </div>
                ))}
              </div>
            ))}
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
      </div>
    </Card>
  );
};

export default PricingPreview;
