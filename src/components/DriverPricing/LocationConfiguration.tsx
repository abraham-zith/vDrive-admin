import { Card, Input, Select, Switch } from "antd";
import { MdOutlineLocationOn } from "react-icons/md";

const LocationConfiguration = () => {
  return (
    <Card className="w-full" size="small">
      <div className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-between w-full">
          <div className="w-full flex items-center gap-1">
            <div>
              <MdOutlineLocationOn className="text-[25px] text-[#0080FF]" />
            </div>
            <div>
              <span className="text-[20px] font-semibold p-0 m-0">
                Location Configuration
              </span>
            </div>
          </div>
          <div className=""></div>
        </div>
        <div className="w-full flex gap-4">
          <div className="w-full flex flex-col">
            <span>Country</span>
            <Select options={[]} />
          </div>
          <div className="w-full flex flex-col">
            <span>State</span>
            <Select options={[]} />
          </div>
          <div className="w-full flex flex-col">
            <span>District</span>
            <Select options={[]} />
          </div>
        </div>
        <div className="w-full flex gap-4">
          <div className="w-full flex flex-col">
            <span>Area</span>
            <Input />
          </div>
          <div className="w-full flex flex-col">
            <span>Pincode</span>
            <Input />
          </div>
        </div>
        <Card variant="borderless" size="small" className="w-full">
          <div className="w-full flex items-center gap-2 justify-between">
            <div className="flex flex-col gap-2 ">
              <span className="text-[16px] font-semibold p-0 m-0">
                Hotspot Area
              </span>
              <span className="text-[10px]  p-0 m-0">
                Enable dynamic pricing for this location
              </span>
            </div>
            <div>
              <div>
                <Switch />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Card>
  );
};

export default LocationConfiguration;
