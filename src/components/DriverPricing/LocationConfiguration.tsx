import { Card, Input, InputNumber, Select, Button, Spin } from "antd";
import { MdOutlineLocationOn } from "react-icons/md";
import { usePricingData } from "../../hooks/usePricingData";

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
  const {
    countries,
    loading,
    error,
    hasMore,
    loadMore,
    totalCountries,
    loadedCountries,
  } = usePricingData();

  // Transform countries data for Select component
  const countryOptions = countries.map((countryData) => ({
    label: `${countryData.country_flag} ${countryData.country_name}`,
    value: countryData.country_code,
  }));

  const handleLoadMore = () => {
    loadMore(50); // Load 50 more countries
  };

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
            <Select
              value={country}
              onChange={setCountry}
              options={countryOptions}
              placeholder="Select a country"
              loading={loading}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              notFoundContent={
                loading ? (
                  <div className="flex items-center justify-center py-2">
                    <Spin size="small" />
                    <span className="ml-2">Loading countries...</span>
                  </div>
                ) : error ? (
                  <div className="text-red-500 py-2">
                    Error loading countries: {error}
                  </div>
                ) : (
                  "No countries found"
                )
              }
            />
            {hasMore && (
              <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                <span>
                  Loaded {loadedCountries} of {totalCountries} countries
                </span>
                <Button
                  size="small"
                  type="link"
                  onClick={handleLoadMore}
                  loading={loading}
                  disabled={!hasMore}
                >
                  Load More
                </Button>
              </div>
            )}
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
