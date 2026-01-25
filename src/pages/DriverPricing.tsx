import { useState } from "react";
import { Segmented, Button, Card, Drawer } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import LocationConfiguration from "../components/DriverPricing/LocationConfiguration";
import DriverTimeSlotsAndPricing, {
  type UserTimeSlots,
} from "../components/DriverPricing/DriverTimeSlotsAndPricing";
import HotspotConfiguration from "../components/DriverPricing/HotspotConfiguration";
import PricingPreview from "../components/DriverPricing/PricingPreview";
import HotspotTypes from "../components/DriverPricing/HotspotTypes";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import { EyeOutlined } from "@ant-design/icons";

const DriverPricing = () => {
  const [activeTab, setActiveTab] = useState("configuration");
  const navigate = useNavigate();
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("Kanchipuram");
  const [area, setArea] = useState("Madippakkam");
  const [pincode, setPincode] = useState("");
  const [globalPrice, setGlobalPrice] = useState(1000);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [timeSlots, setTimeSlots] = useState<UserTimeSlots>({
    "normal-driver": [
      {
        id: 1,
        day: "monday",
        timeRange: [dayjs("9:00 AM", "h:mm A"), dayjs("11:00 AM", "h:mm A")],
        price: 300,
      },
    ],
    "premium-driver": [
      {
        id: 1,
        day: "monday",
        timeRange: [dayjs("7:00 AM", "h:mm A"), dayjs("9:00 AM", "h:mm A")],
        price: 400,
      },
    ],
    "elite-driver": [
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
    <div className="h-full w-full">
      <div className="h-full flex justify-center px-0">
        <div className="w-full flex flex-col min-h-screen gap-2">
          <TitleBar
            className="w-full h-full "
            title="Add Pricing"
            description="Configure pricing for different user types and time slots"
            extraContent={
              <div>
                <Button
                  icon={<EyeOutlined />}
                  type="primary"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  Pricing Preview
                </Button>
              </div>
            }
          >
            <div className="w-full">
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
              <div className="w-full">
                <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-4 lg:gap-6 mt-2">
                  <div className="flex flex-col gap-4 min-w-0">
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
                  </div>
                  <div className="flex flex-col h-full overflow-auto">
                    <DriverTimeSlotsAndPricing
                      timeSlots={timeSlots}
                      setTimeSlots={setTimeSlots}
                      hotspotEnabled={hotspotEnabled}
                      hotspotType={hotspotType}
                      multiplier={multiplier}
                      globalPrice={globalPrice}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <HotspotTypes />
            )}
          </TitleBar>

          <div className="w-full mt-1">
            {activeTab === "configuration" ? (
              <Card className="w-full mt-auto">
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => navigate("/PricingAndFareRules")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    className="w-full sm:w-auto"
                    // onClick={handleSave}
                  >
                    Save Rule
                  </Button>
                  <Button
                    type="primary"
                    className="w-full sm:w-auto"
                    style={{ background: "#4CAF50" }}
                  >
                    Save & Add Another
                  </Button>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
      <Drawer
        title="Pricing Preview"
        open={isDrawerOpen}
        width={"80%"}
        onClose={() => setIsDrawerOpen(false)}
      >
        <div className="lg:col-span-1">
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
      </Drawer>
    </div>
  );
};

export default DriverPricing;
