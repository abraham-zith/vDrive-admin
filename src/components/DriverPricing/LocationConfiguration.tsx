import { Card, Input, Select, Switch } from "antd";
import { MdOutlineLocationOn } from "react-icons/md";

interface LocationConfigurationProps {
  country: string;
  setCountry: (country: string) => void;
  state: string;
  setState: (state: string) => void;
  district: string;
  setDistrict: (district: string) => void;
  area: string;
  setArea: (area: string) => void;
  pincode: string;
  setPincode: (pincode: string) => void;
  hotspotArea: boolean;
  setHotspotArea: (hotspotArea: boolean) => void;
}

const LocationConfiguration = ({
  country,
  setCountry,
  state,
  setState,
  district,
  setDistrict,
  area,
  setArea,
  pincode,
  setPincode,
  hotspotArea,
  setHotspotArea,
}: LocationConfigurationProps) => {
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
            <Select value={country} onChange={setCountry} options={[]} />
          </div>
          <div className="w-full flex flex-col">
            <span>State</span>
            <Select value={state} onChange={setState} options={[]} />
          </div>
          <div className="w-full flex flex-col">
            <span>District</span>
            <Select value={district} onChange={setDistrict} options={[]} />
          </div>
        </div>
        <div className="w-full flex gap-4">
          <div className="w-full flex flex-col">
            <span>Area</span>
            <Input value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
          <div className="w-full flex flex-col">
            <span>Pincode</span>
            <Input
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
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
                <Switch checked={hotspotArea} onChange={setHotspotArea} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Card>
  );
};

export default LocationConfiguration;
