import { Card, Input, InputNumber, Select } from "antd";
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
  globalPrice: number;
  setGlobalPrice: (globalPrice: number) => void;
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
  globalPrice,
  setGlobalPrice,
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
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="w-full flex flex-col">
            <span className="text-sm font-medium mb-1">Country</span>
            <Select value={country} onChange={setCountry} options={[]} />
          </div>
          <div className="w-full flex flex-col">
            <span className="text-sm font-medium mb-1">State</span>
            <Select value={state} onChange={setState} options={[]} />
          </div>
          <div className="w-full flex flex-col">
            <span className="text-sm font-medium mb-1">District</span>
            <Select value={district} onChange={setDistrict} options={[]} />
          </div>
        </div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="w-full flex flex-col">
            <span className="text-sm font-medium mb-1">Area</span>
            <Input value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
          <div className="w-full flex flex-col">
            <span className="text-sm font-medium mb-1">Pincode</span>
            <Input
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
          </div>
          <div className="w-full flex flex-col">
            <span className="text-sm font-medium mb-1">Global Price</span>
            <InputNumber
              value={globalPrice}
              onChange={(e) => setGlobalPrice(e || 0)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LocationConfiguration;
