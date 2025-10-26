import { Card, Input, InputNumber, Select } from "antd";
import { MdOutlineLocationOn } from "react-icons/md";
import { useEffect, useCallback, useMemo } from "react";
import { debounce } from "lodash";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCountries, fetchState } from "../../store/slices/locationSlice";

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
  const dispatch = useAppDispatch();
  const { countries, isLoadingCountries, states, isLoadingStates } =
    useAppSelector((state) => state.location);

  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      dispatch(fetchCountries({ limit: 20, search: searchValue }));
    }, 500),
    [dispatch]
  );

  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };

  const countryOptions = useMemo(
    () =>
      countries.map((c) => ({
        label: `${c.country_flag} ${c.country_name}`,
        value: c.id,
        searchValue: c.country_name.toLowerCase(),
      })),
    [countries]
  );
  const stateOptions = useMemo(
    () =>
      states.map((c) => ({
        label: `${c.state_name}`,
        value: c.id,
        searchValue: c.state_name.toLowerCase(),
      })),
    [states]
  );

  useEffect(() => {
    dispatch(fetchCountries({ limit: 20, search: "india" }));
  }, [dispatch]);

  useEffect(() => {
    if (country) {
      dispatch(fetchState({ countryId: country }));
    }
  }, [country]);

  useEffect(() => {
    if (countries.length > 0 && !country) {
      const indiaCountry = countries.find(
        (c) =>
          c.country_code === "IN" || c.country_name.toLowerCase() === "india"
      );
      if (indiaCountry) {
        setCountry(indiaCountry.id);
      }
    }
  }, [countries, country, setCountry]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

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
              showSearch
              placeholder="Search and select country"
              filterOption={false}
              onSearch={handleSearch}
              loading={isLoadingCountries}
              notFoundContent={
                isLoadingCountries ? "Loading..." : "No countries found"
              }
            />
          </div>
          <div className="w-full flex flex-col">
            <span className="text-sm font-medium mb-1">State</span>
            <Select
              value={state}
              onChange={setState}
              options={stateOptions}
              loading={isLoadingStates}
              notFoundContent={
                isLoadingStates ? "Loading..." : "No states found"
              }
            />
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
