import { Card, Segmented, Typography } from "antd";
import { MdOutlineLocationOn } from "react-icons/md";
import LocationConfiguration from "../components/DriverPricing/LocationConfiguration";
import DriverTimeSlotsAndPricing from "../components/DriverPricing/DriverTimeSlotsAndPricing";

const DriverPricing = () => {
  //   const [driverType, setDriverType] = useState<"normal" | "premium">("normal");
  return (
    <div className="h-full w-full">
      <div className="flex justify-center  ">
        <div className="w-4/5 flex flex-col">
          <Typography.Title level={2}>Driver Pricing</Typography.Title>

          <div className="w-full">
            <Segmented<string>
              options={[
                {
                  className: "w-full",
                  label: "Configuration",
                  value: "configuration",
                },
                {
                  className: "w-full",
                  label: "Hotspot Types",
                  value: "hotspot-types",
                },
              ]}
              size="large"
              className="w-full "
              onChange={(value) => {
                console.log(value); // string
              }}
            />
          </div>
          <div className="w-full flex gap-10 my-4">
            <div className="w-2/3 flex flex-col gap-4">
              <LocationConfiguration />
              <DriverTimeSlotsAndPricing />
            </div>
            <div className="w-1/3  h-96">
              <Card size="small"></Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverPricing;
