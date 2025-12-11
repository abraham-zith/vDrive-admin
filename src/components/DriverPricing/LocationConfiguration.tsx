import { Card, Input, InputNumber, Select } from "antd";
import { MdOutlineLocationOn } from "react-icons/md";
import { useEffect, useCallback, useMemo } from "react";
import { debounce } from "lodash";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchCountries,
  fetchState,
  fetchDistricts,
  fetchAreas,
} from "../../store/slices/locationSlice";

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
  const {
    countries,
    isLoadingCountries,
    states,
    isLoadingStates,
    districts,
    isLoadingDistricts,
    areas,
    isLoadingAreas,
  } = useAppSelector((state) => state.location);

  const debouncedCountrySearch = useCallback(
    debounce((searchValue: string) => {
      dispatch(fetchCountries({ limit: 20, search: searchValue }));
    }, 500),
    [dispatch]
  );

  const debouncedStateSearch = useCallback(
    debounce((searchValue: string) => {
      dispatch(
        fetchState({ countryId: country, search: searchValue, limit: 20 })
      );
    }, 500),
    [dispatch, country]
  );

  const debouncedDistrictSearch = useCallback(
    debounce((searchValue: string) => {
      dispatch(
        fetchDistricts({
          countryId: country,
          stateId: state,
          search: searchValue,
          limit: 20,
        })
      );
    }, 500),
    [dispatch, country, state]
  );

  const debouncedAreaSearch = useCallback(
    debounce((searchValue: string) => {
      dispatch(
        fetchAreas({
          countryId: country,
          stateId: state,
          cityId: district,
          search: searchValue,
          limit: 20,
        })
      );
    }, 500),
    [dispatch, country, state, district]
  );

  const handleCountrySearch = (value: string) => {
    debouncedCountrySearch(value);
  };
  const handleStateSearch = (value: string) => {
    debouncedStateSearch(value);
  };
  const handleDistrictSearch = (value: string) => {
    debouncedDistrictSearch(value);
  };
  const handleAreaSearch = (value: string) => {
    debouncedAreaSearch(value);
  };

  const countryOptions = useMemo(
    () =>
      countries.map((c) => ({
        label: `${c.country_flag} ${c.country_name}`,
        value: c.id,
        searchValue: c.country_name?.toLowerCase() || "",
      })),
    [countries]
  );
  const stateOptions = useMemo(
    () =>
      states.map((c) => ({
        label: `${c.state_name}`,
        value: c.id,
        searchValue: c.state_name?.toLowerCase() || "",
      })),
    [states]
  );
  const districtOptions = useMemo(
    () =>
      districts.map((c) => ({
        label: `${c.city_name}`,
        value: c.id,
        searchValue: c.city_name?.toLowerCase() || "",
      })),
    [districts]
  );
  const areaOptions = useMemo(
    () =>
      areas.map((c) => ({
        label: `${c.place}`,
        value: c.id,
        searchValue: c.place?.toLowerCase() || "",
      })),
    [areas]
  );

  useEffect(() => {
    dispatch(fetchCountries({ limit: 20, search: "india" }));
  }, [dispatch]);

  useEffect(() => {
    if (
      country &&
      countries.find((x) => x.id === country)?.country_name.toLowerCase() ===
        "india"
    ) {
      dispatch(fetchState({ countryId: country, search: "tamil nadu" }));
    } else if (country) {
      dispatch(fetchState({ countryId: country, search: "" }));
    }
  }, [country, dispatch, countries]);

  useEffect(() => {
    setState("");
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
    if (states.length > 0 && !state && country && !isLoadingStates) {
      const tamilNaduState = states.find(
        (s) => s.state_name.toLowerCase() === "tamil nadu"
      );
      if (tamilNaduState) {
        setState(tamilNaduState.id);
      }
    }
  }, [states, state, country, setState, isLoadingStates]);

  useEffect(() => {
    if (districts.length > 0 && !district && state && !isLoadingDistricts) {
      const chennaiDistrict = districts.find((d) =>
        d.city_name.toLowerCase().includes("chennai")
      );
      if (chennaiDistrict) {
        setDistrict(chennaiDistrict.id);
      }
    }
  }, [districts, district, state, setDistrict, isLoadingDistricts]);

  useEffect(() => {
    setDistrict("");
    if (country && state) {
      const selectedState = states.find((s) => s.id === state);
      if (
        selectedState &&
        selectedState.state_name.toLowerCase() === "tamil nadu"
      ) {
        dispatch(
          fetchDistricts({
            countryId: country,
            stateId: state,
            search: "chennai",
          })
        );
      } else {
        dispatch(fetchDistricts({ countryId: country, stateId: state }));
      }
    }
  }, [country, state, dispatch, setDistrict, states]);

  useEffect(() => {
    setArea("");
    if (country && state && district) {
      dispatch(
        fetchAreas({ countryId: country, stateId: state, cityId: district })
      );
    }
  }, [country, state, district, dispatch, setArea]);

  useEffect(() => {
    return () => {
      debouncedCountrySearch.cancel();
    };
  }, [debouncedCountrySearch]);
  useEffect(() => {
    console.log({ isLoadingCountries, isLoadingStates });
  }, [isLoadingCountries, isLoadingStates]);
  const handleAreaChange = (value: string) => {
    setArea(value);
    const selectedArea = areas.find((a) => a.id === value);
    if (selectedArea) {
      setPincode(selectedArea.zipcode);
    }
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
              showSearch
              placeholder="Search and select country"
              filterOption={false}
              onSearch={handleCountrySearch}
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
              showSearch
              disabled={!country}
              placeholder="Search and select state"
              filterOption={false}
              onSearch={handleStateSearch}
              loading={isLoadingStates}
              notFoundContent={
                isLoadingStates ? "Loading..." : "No states found"
              }
            />
          </div>
          <div className="w-full flex flex-col">
            <span className="text-sm font-medium mb-1">District</span>
            <Select
              value={district}
              onChange={setDistrict}
              options={districtOptions}
              showSearch
              disabled={!state}
              placeholder="Search and select district"
              filterOption={false}
              onSearch={handleDistrictSearch}
              loading={isLoadingDistricts}
              notFoundContent={
                isLoadingDistricts ? "Loading..." : "No districts found"
              }
            />
          </div>
        </div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="w-full flex flex-col">
            <span className="text-sm font-medium mb-1">Area</span>
            <Select
              value={area}
              onChange={handleAreaChange}
              options={areaOptions}
              showSearch
              disabled={!district}
              placeholder="Search and select area"
              filterOption={false}
              onSearch={handleAreaSearch}
              loading={isLoadingAreas}
              notFoundContent={isLoadingAreas ? "Loading..." : "No areas found"}
            />
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
