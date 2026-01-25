import { useState, useEffect } from "react";
import { Segmented, Button, Card, Drawer, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  createPricingRuleWithSlots,
  fetchPricingFareRuleById,
  updatePricingRuleWithSlots,
} from "../store/slices/pricingFareRulesSlice";
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
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { isLoading, fareRules } = useAppSelector(
    (state) => state.pricingFareRules,
  );
  const [country, setCountry] = useState(""); // Default
  const [state, setState] = useState(""); // Default
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [globalPrice, setGlobalPrice] = useState(1000);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [timeSlots, setTimeSlots] = useState<UserTimeSlots>({
    "normal-driver": [],
    "premium-driver": [],
    "elite-driver": [],
  });

  const [hotspotEnabled, setHotspotEnabled] = useState(true);
  const [hotspotId, setHotspotId] = useState("");
  const [multiplier, setMultiplier] = useState(1);

  // Fetch data if editing
  useEffect(() => {
    if (id) {
      dispatch(fetchPricingFareRuleById(id))
        .unwrap()
        .then((data) => {
          console.log({ data });
          setDistrict(data.city_id || "");
          setArea(data.area_id || "");
          setPincode(data.pincode || "");
          setGlobalPrice(Number(data.global_price));
          setHotspotEnabled(data.is_hotspot);
          setHotspotId(data.hotspot_id || "");
          setMultiplier(Number(data.multiplier) || 1);

          // Transform time slots
          const newSlots: UserTimeSlots = {
            "normal-driver": [],
            "premium-driver": [],
            "elite-driver": [],
          };

          if (data.time_slots) {
            data.time_slots.forEach((slot: any, index: number) => {
              if (newSlots[slot.driver_types]) {
                newSlots[slot.driver_types].push({
                  id: index + 1, // Simple ID generation
                  day: slot.day,
                  timeRange: [
                    dayjs(slot.from_time, "HH:mm:ss"),
                    dayjs(slot.to_time, "HH:mm:ss"),
                  ],
                  price: slot.price,
                });
              }
            });
          }
          setTimeSlots(newSlots);
        })
        .catch((err) => {
          message.error("Failed to fetch pricing rule details");
          navigate("/PricingAndFareRules");
        });
    } else {
      // Default initialization for Add mode
      setTimeSlots({
        "normal-driver": [
          {
            id: 1,
            day: "monday",
            timeRange: [
              dayjs("9:00 AM", "h:mm A"),
              dayjs("11:00 AM", "h:mm A"),
            ],
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
    }
  }, [id, dispatch, navigate]);

  // Transform and save pricing rule with time slots
  const handleSave = async () => {
    // Debug log to see what we're sending
    console.log("Attempting to save with values:", {
      district,
      area,
      globalPrice,
      hotspotEnabled,
    });

    // Validation
    if (!district || district === "") {
      message.error("Please select a district (City)");
      return;
    }

    if (!area || area === "") {
      message.error("Please select an area");
      return;
    }

    if (hotspotEnabled && !hotspotId) {
      message.error("Please select a hotspot when hotspot is enabled");
      return;
    }

    // Validate that we have at least one time slot
    const totalSlots = Object.values(timeSlots).reduce(
      (sum, slots) => sum + slots.length,
      0,
    );
    if (totalSlots === 0) {
      message.error("Please add at least one time slot");
      return;
    }

    try {
      // Transform time slots from object to array
      const timeSlotsArray = Object.entries(timeSlots).flatMap(
        ([driverType, slots]) =>
          slots.map((slot) => {
            if (!slot.timeRange) {
              throw new Error(`Time range is required for all slots`);
            }

            return {
              driver_types: driverType,
              day: slot.day.toLowerCase(),
              from_time: slot.timeRange[0].format("HH:mm:ss"),
              to_time: slot.timeRange[1].format("HH:mm:ss"),
              price: slot.price,
            };
          }),
      );

      // Build the payload
      // Note: Database schema naming is confusing:
      // - district_id column references 'areas' table
      // - city_id column references 'cities' table
      // Frontend state:
      // - 'district' state holds City ID (from City dropdown)
      // - 'area' state holds Area ID (from Area dropdown)
      const payload = {
        district_id: area, // Maps to 'areas' table
        city_id: district, // Maps to 'cities' table
        global_price: globalPrice,
        is_hotspot: hotspotEnabled,
        hotspot_id: hotspotEnabled ? hotspotId : null,
        multiplier: hotspotEnabled ? multiplier : null,
        time_slots: timeSlotsArray,
      };

      console.log("Sending payload (corrected mapping):", payload);

      if (id) {
        // Update existing rule
        await dispatch(
          updatePricingRuleWithSlots({ id, data: payload }),
        ).unwrap();
        message.success("Pricing rule updated successfully!");
      } else {
        // Create new rule
        await dispatch(createPricingRuleWithSlots(payload)).unwrap();
        message.success("Pricing rule created successfully!");
      }

      navigate("/PricingAndFareRules");
    } catch (error: any) {
      console.error("Save error:", error);
      message.error(error || "Failed to save pricing rule");
    }
  };
  return (
    <div className="h-full w-full">
      <div className="h-full flex justify-center px-0">
        <div className="w-full flex flex-col min-h-screen gap-2">
          <TitleBar
            className="w-full h-full "
            title={id ? "Edit Pricing" : "Add Pricing"}
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
                      hotspotId={hotspotId}
                      setHotspotId={setHotspotId}
                      multiplier={multiplier}
                      setMultiplier={setMultiplier}
                    />
                  </div>
                  <div className="flex flex-col h-full overflow-auto">
                    <DriverTimeSlotsAndPricing
                      timeSlots={timeSlots}
                      setTimeSlots={setTimeSlots}
                      hotspotEnabled={hotspotEnabled}
                      hotspotId={hotspotId}
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
                    onClick={handleSave}
                    loading={isLoading}
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
            hotspotId={hotspotId}
            multiplier={multiplier}
          />
        </div>
      </Drawer>
    </div>
  );
};

export default DriverPricing;
