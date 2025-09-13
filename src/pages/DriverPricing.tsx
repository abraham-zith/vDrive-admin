import { useState } from "react";
import { Segmented, Typography } from "antd";
import dayjs from "dayjs";
import LocationConfiguration from "../components/DriverPricing/LocationConfiguration";
import DriverTimeSlotsAndPricing, {
  type UserTimeSlots,
} from "../components/DriverPricing/DriverTimeSlotsAndPricing";
import HotspotConfiguration from "../components/DriverPricing/HotspotConfiguration";
import PricingPreview from "../components/DriverPricing/PricingPreview";
import HotspotTypes from "../components/DriverPricing/HotspotTypes";

const DriverPricing = () => {
  const [activeTab, setActiveTab] = useState("configuration");
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("Kanchipuram");
  const [area, setArea] = useState("Madippakkam");
  const [pincode, setPincode] = useState("60091");
  const [globalPrice, setGlobalPrice] = useState(1000);

  const [timeSlots, setTimeSlots] = useState<UserTimeSlots>({
    "normal-user": [
      {
        id: 1,
        day: "monday",
        timeRange: [dayjs("9:00 AM", "h:mm A"), dayjs("11:00 AM", "h:mm A")],
        price: 300,
      },
    ],
    "premium-user": [
      {
        id: 1,
        day: "monday",
        timeRange: [dayjs("7:00 AM", "h:mm A"), dayjs("9:00 AM", "h:mm A")],
        price: 400,
      },
    ],
    "elite-user": [
      {
        id: 1,
        day: "monday",
        timeRange: [dayjs("7:00 AM", "h:mm A"), dayjs("9:00 AM", "h:mm A")],
        price: 500,
      },
    ],
  });

  const [hotspotEnabled, setHotspotEnabled] = useState(true);
  const [hotspotType, setHotspotType] = useState("rush-zone");
  const [multiplier, setMultiplier] = useState(1);

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="flex justify-center px-2 sm:px-4 lg:px-6 xl:px-4 2xl:px-6">
        <div className="w-full max-w-6xl xl:max-w-7xl flex flex-col">
          <Typography.Title level={2} className="text-xl sm:text-2xl">
            Driver Pricing Management
          </Typography.Title>
          <Typography.Text className="text-sm sm:text-base">
            Configure dynamic pricing rules for different locations and time
            periods
          </Typography.Text>

          <div className="w-full my-4">
            <Segmented<string>
              options={[
                {
                  label: "Configuration",
                  className: "w-full",
                  value: "configuration",
                },
                {
                  label: "Hotspot Types",
                  className: "w-full",
                  value: "hotspot-types",
                },
              ]}
              size="large"
              className="w-full"
              value={activeTab}
              onChange={setActiveTab}
            />
          </div>
          {activeTab === "configuration" ? (
            <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 my-4">
              <div className="w-full lg:w-2/3 flex flex-col gap-4">
                <LocationConfiguration
                  country={country}
                  setCountry={setCountry}
                  state={state}
                  setState={setState}
                  district={district}
                  setDistrict={setDistrict}
                  area={area}
                  setArea={setArea}
                  pincode={pincode}
                  setPincode={setPincode}
                  globalPrice={globalPrice}
                  setGlobalPrice={setGlobalPrice}
                />
                <HotspotConfiguration
                  hotspotEnabled={hotspotEnabled}
                  setHotspotEnabled={setHotspotEnabled}
                  hotspotType={hotspotType}
                  setHotspotType={setHotspotType}
                  multiplier={multiplier}
                  setMultiplier={setMultiplier}
                />
                <DriverTimeSlotsAndPricing
                  timeSlots={timeSlots}
                  setTimeSlots={setTimeSlots}
                  hotspotEnabled={hotspotEnabled}
                  hotspotType={hotspotType}
                  multiplier={multiplier}
                  globalPrice={globalPrice}
                />
              </div>
              <div className="w-full lg:w-1/3">
                <PricingPreview
                  country={country}
                  state={state}
                  district={district}
                  area={area}
                  pincode={pincode}
                  timeSlots={timeSlots}
                  hotspotEnabled={hotspotEnabled}
                  hotspotType={hotspotType}
                  multiplier={multiplier}
                />
              </div>
            </div>
          ) : (
            <HotspotTypes />
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverPricing;
