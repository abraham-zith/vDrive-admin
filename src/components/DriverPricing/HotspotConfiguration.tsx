import { Card, Select, Switch, InputNumber, Tag, Spin } from "antd";
import { ThunderboltOutlined, LoadingOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../store/hooks";

interface HotspotConfigurationProps {
  hotspotEnabled: boolean;
  setHotspotEnabled: (enabled: boolean) => void;
  hotspotType: string;
  setHotspotType: (type: string) => void;
  multiplier: number;
  setMultiplier: (multiplier: number) => void;
}

const HotspotConfiguration = ({
  hotspotEnabled,
  setHotspotEnabled,
  hotspotType,
  setHotspotType,
  multiplier,
  setMultiplier,
}: HotspotConfigurationProps) => {
  const { hotspots, loading } = useAppSelector((state) => state.hotspot);

  // Load hotspot types on component mount
  // Fetching moved to parent page (DriverPricing)

  // Get selected hotspot type details
  const selectedHotspotType = hotspots.find((type) => type.id === hotspotType);

  if (loading && hotspots.length === 0) {
    return (
      <Card size="small">
        <div className="flex justify-center items-center h-32">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          <span className="ml-2">Loading hotspot configuration...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card size="small">
      <div className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-between w-full">
          <div className="w-full flex items-center gap-2">
            <ThunderboltOutlined className="text-[20px] text-[#0080FF]" />
            <span className="text-[19px] font-semibold p-0 m-0">
              Hotspot Configuration
            </span>
          </div>
        </div>

        <Card variant="borderless" size="small" className="w-full bg-[#F8F9FA]">
          <div className="w-full flex items-center gap-2 justify-between">
            <div className="flex flex-col gap-2 ">
              <span className="text-[16px] font-semibold p-0 m-0">
                Enable Hotspot Pricing
              </span>
              <span className="text-[10px]  p-0 m-0">
                Apply dynamic pricing based on demand
              </span>
            </div>
            <div>
              <Switch checked={hotspotEnabled} onChange={setHotspotEnabled} />
            </div>
          </div>
        </Card>

        {hotspotEnabled && (
          <>
            <div className="w-full flex flex-col">
              <span>Hotspot Type</span>
              <Select
                value={hotspotType}
                onChange={(value) => {
                  setHotspotType(value);
                  const selected = hotspots.find((h) => h.id === value);
                  if (selected) {
                    setMultiplier(selected.multiplier);
                  }
                }}
                placeholder="Select a hotspot type"
                options={hotspots.map((type) => ({
                  value: type.id,
                  label: (
                    <div className="flex items-center gap-2">
                      <ThunderboltOutlined />
                      <span>{type.hotspot_name}</span>
                      <span className="text-xs text-gray-500">
                        +₹{type.fare} - {type.multiplier}x
                      </span>
                    </div>
                  ),
                }))}
              />
            </div>
            {selectedHotspotType && (
              <div className="w-full flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2 flex flex-col">
                  <Tag color="blue" className="mb-2">
                    {selectedHotspotType.hotspot_name}
                  </Tag>
                  <span className="text-sm text-gray-600">
                    Addition: +₹{selectedHotspotType.fare}
                  </span>
                </div>
                <div className="w-full sm:w-1/2 flex flex-col">
                  <span className="text-sm font-medium mb-1">Multiplier:</span>
                  <InputNumber
                    min={0.1}
                    step={0.1}
                    value={multiplier}
                    onChange={(value) => setMultiplier(value || 1)}
                    addonAfter="x"
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default HotspotConfiguration;
