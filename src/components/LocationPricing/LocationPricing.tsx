import { Card, Radio, Select, Switch } from "antd";
import { useState } from "react";

const LocationPricing = () => {
  const [driverType, setDriverType] = useState<"normal" | "premium">("normal");
  return (
    <div className="h-full w-full flex flex-col md:flex-row gap-2 overflow-y-auto pr-4">
      <Card className="min-h-72 min-w-72" size="small"></Card>
      <div className="h-full min-h-96 w-full flex flex-col gap-2">
        <div className="w-full flex justify-between gap-2">
          <div className="w-full flex items-center">
            <Radio.Group
              value={driverType}
              buttonStyle="solid"
              onChange={(e) => setDriverType(e.target.value)}
            >
              <Radio.Button value="normal">Normal Driver</Radio.Button>
              <Radio.Button value="premium">Premium Driver</Radio.Button>
            </Radio.Group>
          </div>
          <div className="w-full flex items-center justify-end gap-2">
            <Select />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPricing;
