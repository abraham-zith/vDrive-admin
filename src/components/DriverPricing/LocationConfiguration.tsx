import {
  AutoComplete,
  Button,
  Card,
  Divider,
  Input,
  InputNumber,
  Modal,
  Space,
  message,
} from "antd";
import { MdOutlineLocationOn } from "react-icons/md";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { debounce, startCase } from "lodash";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  createArea,
  fetchAreas,
  fetchCities,
  fetchCountries,
  fetchState,
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
    cities,
    isLoadingCities,
    areas,
    isLoadingAreas,
  } = useAppSelector((state) => state.location);

  const [areaSearchValue, setAreaSearchValue] = useState("");
  const [createAreaName, setCreateAreaName] = useState(""); // Snapshot for modal
  const [createZipcode, setCreateZipcode] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingArea, setIsCreatingArea] = useState(false);

  // States for AutoComplete input values (display names)
  // We need these because AutoComplete value is text, but we store IDs in props
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");

  const debouncedCountrySearch = useCallback(
    debounce((searchValue: string) => {
      dispatch(fetchCountries({ limit: 20, search: searchValue }));
    }, 500),
    [dispatch],
  );

  const debouncedStateSearch = useCallback(
    debounce((searchValue: string) => {
      dispatch(
        fetchState({ countryId: country, search: searchValue, limit: 20 }),
      );
    }, 500),
    [dispatch, country],
  );

  const debouncedCitySearch = useCallback(
    debounce((searchValue: string) => {
      dispatch(
        fetchCities({
          countryId: country,
          stateId: state,
          search: searchValue,
          limit: 100,
        }),
      );
    }, 500),
    [dispatch, country, state],
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
        }),
      );
    }, 500),
    [dispatch, country, state, district],
  );

  const handleCountrySearch = (value: string) => {
    setCountrySearch(value);
    setCountry(""); // Clear ID on type
    debouncedCountrySearch(value);
  };
  const handleStateSearch = (value: string) => {
    setStateSearch(value);
    setState(""); // Clear ID on type
    debouncedStateSearch(value);
  };
  const handleCitySearch = (value: string) => {
    setDistrictSearch(value);
    setDistrict(""); // Clear ID on type
    debouncedCitySearch(value);
  };
  const handleAreaSearch = (value: string) => {
    setAreaSearchValue(value);
    setArea(""); // Clear ID on type
    debouncedAreaSearch(value);
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPincode(e.target.value);
  };

  const handleAreaSelect = (value: string, option: any) => {
    setArea(option.key); // option.key stores the ID
    setAreaSearchValue(option.label); // Keep the selected name visible
    const selectedArea = areas.find((a) => a.id === option.key);
    if (selectedArea && selectedArea.zipcode) {
      setPincode(selectedArea.zipcode);
    }
  };

  const openCreateDialog = () => {
    setCreateAreaName(startCase(areaSearchValue)); // Snapshot current input capitalized
    setCreateZipcode("");
    setIsCreateModalOpen(true);
  };

  const submitCreateArea = async () => {
    if (!createAreaName || !createZipcode) return;

    setIsCreatingArea(true);
    try {
      const resultAction = await dispatch(
        createArea({
          place: createAreaName,
          country_id: country,
          state_id: state,
          city_id: district,
          zipcode: createZipcode,
        }),
      );

      if (createArea.fulfilled.match(resultAction)) {
        const newArea = resultAction.payload;

        // Close modal
        setIsCreateModalOpen(false);
        setCreateZipcode("");

        // Auto-select the newly created area
        setArea(newArea.id);
        setAreaSearchValue(newArea.place);

        // If the newly created area has a zipcode (which it should), prefill it in the main form too
        setPincode(newArea.zipcode);

        message.success("Area created successfully");
      } else {
        message.error("Failed to create area");
      }
    } catch (error) {
      console.error("Failed to create area", error);
      message.error("Failed to create area");
    } finally {
      setIsCreatingArea(false);
    }
  };

  const handleCreateZipcodeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    // Allow numbers and hyphen only
    if (/^[0-9-]*$/.test(value)) {
      setCreateZipcode(value);
    }
  };

  const countryOptions = useMemo(
    () =>
      countries.map((c) => ({
        label: `${c.country_flag} ${c.country_name}`,
        value: `${c.country_flag} ${c.country_name}`, // AutoComplete value is text
        key: c.id, // Store ID in key
      })),
    [countries],
  );
  const stateOptions = useMemo(
    () =>
      states.map((s) => ({
        label: s.state_name,
        value: s.state_name,
        key: s.id,
      })),
    [states],
  );
  const cityOptions = useMemo(
    () =>
      cities.map((c) => ({
        label: c.city_name,
        value: c.city_name,
        key: c.id,
      })),
    [cities],
  );
  const areaOptions = useMemo(
    () => areas.map((a) => ({ label: a.place, value: a.place, key: a.id })),
    [areas],
  );

  useEffect(() => {
    dispatch(fetchCountries({ limit: 20, search: "india" }));
  }, [dispatch]);

  useEffect(() => {
    if (country) {
      dispatch(fetchState({ countryId: country, search: "tamil nadu" }));
      // Sync display value
      const selected = countries.find((c) => c.id === country);
      if (selected)
        setCountrySearch(`${selected.country_flag} ${selected.country_name}`);
    }
  }, [country, dispatch, countries]);

  useEffect(() => {
    if (state && country) {
      const selectedState = states.find((s) => s.id === state);
      if (selectedState) setStateSearch(selectedState.state_name);

      const isTamilNadu =
        selectedState?.state_name.toLowerCase() === "tamil nadu";

      dispatch(
        fetchCities({
          countryId: country,
          stateId: state,
          search: isTamilNadu ? "chennai" : "",
          limit: 100,
        }),
      );
    }
  }, [state, country, dispatch, states]);

  useEffect(() => {
    if (district && state && country) {
      const selectedCity = cities.find((c) => c.id === district);
      if (selectedCity) setDistrictSearch(selectedCity.city_name);

      dispatch(
        fetchAreas({
          countryId: country,
          stateId: state,
          cityId: district,
          limit: 20,
        }),
      );
    }
  }, [district, state, country, dispatch, cities]);

  // Sync Area display
  useEffect(() => {
    if (area && areas.length > 0) {
      const selected = areas.find((a) => a.id === area);
      if (selected) setAreaSearchValue(selected.place);
    }
  }, [area, areas]);

  // Initial Auto-select Logic
  useEffect(() => {
    if (countries.length > 0 && !country) {
      const india = countries.find(
        (c) =>
          c.country_code === "IN" || c.country_name.toLowerCase() === "india",
      );
      if (india) {
        setCountry(india.id);
        setState("");
        setDistrict("");
        setArea("");
      }
    }
  }, [countries, country, setCountry, setState, setDistrict, setArea]);

  useEffect(() => {
    if (states.length > 0 && !state && country) {
      const tn = states.find(
        (s) => s.state_name.toLowerCase() === "tamil nadu",
      );
      if (tn) {
        setState(tn.id);
        setDistrict("");
        setArea("");
      }
    }
  }, [states, state, country, setState, setDistrict, setArea]);

  useEffect(() => {
    if (cities.length > 0 && !district && state) {
      const chennai = cities.find((c) =>
        c.city_name.toLowerCase().includes("chennai"),
      );
      if (chennai) setDistrict(chennai.id);
    }
  }, [cities, district, state, setDistrict]);

  useEffect(() => {
    return () => {
      debouncedCountrySearch.cancel();
      debouncedStateSearch.cancel();
      debouncedCitySearch.cancel();
      debouncedAreaSearch.cancel();
    };
  }, [
    debouncedCountrySearch,
    debouncedStateSearch,
    debouncedCitySearch,
    debouncedAreaSearch,
  ]);

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
        <div className="w-full grid grid-cols-2 gap-4">
          <div className="w-full flex flex-col">
            <span className="text-sm font-medium mb-1">Country</span>
            <AutoComplete
              value={countrySearch}
              onSearch={handleCountrySearch}
              onSelect={(value, option) => {
                setCountry(option.key);
                setCountrySearch(value);
                setState("");
                setDistrict("");
                setArea("");
              }}
              onBlur={() => {
                if (!country) setCountrySearch("");
              }}
              options={countryOptions}
              placeholder="Search and select country"
              notFoundContent={
                isLoadingCountries ? "Loading..." : "No countries found"
              }
            />
          </div>
          <div className="w-full flex flex-col">
            <span className="text-sm font-medium mb-1">State</span>
            <AutoComplete
              value={stateSearch}
              onSearch={handleStateSearch}
              onSelect={(value, option) => {
                setState(option.key);
                setStateSearch(value);
                setDistrict("");
                setArea("");
              }}
              onBlur={() => {
                if (!state) setStateSearch("");
              }}
              options={stateOptions}
              placeholder="Search and select state"
              notFoundContent={
                isLoadingStates ? "Loading..." : "No states found"
              }
            />
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-4">
          <div className="w-full flex flex-col">
            <span className="text-sm font-medium mb-1">District</span>
            <AutoComplete
              value={districtSearch}
              onSearch={handleCitySearch}
              onSelect={(value, option) => {
                setDistrict(option.key);
                setDistrictSearch(value);
                setArea("");
              }}
              onBlur={() => {
                if (!district) setDistrictSearch("");
              }}
              options={cityOptions}
              placeholder="Search and select district"
              notFoundContent={
                isLoadingCities ? "Loading..." : "No cities found"
              }
            />
          </div>
          <div className="w-full flex flex-col">
            <span className="text-sm font-medium mb-1">Area</span>
            <AutoComplete
              value={areaSearchValue}
              allowClear
              onSearch={handleAreaSearch}
              onSelect={handleAreaSelect}
              onBlur={() => {
                if (!area) setAreaSearchValue("");
              }}
              options={areaOptions}
              placeholder="Search or create area"
              notFoundContent={isLoadingAreas ? "Loading..." : "No areas found"}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  {areaSearchValue &&
                    !isLoadingAreas &&
                    areaOptions.length === 0 && (
                      <>
                        <Divider style={{ margin: "8px 0" }} />
                        <Space style={{ padding: "0 8px 4px" }}>
                          <Button
                            type="text"
                            icon={<PlusOutlined />}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={openCreateDialog}
                            block
                          >
                            Create "{areaSearchValue}"
                          </Button>
                        </Space>
                      </>
                    )}
                </>
              )}
            />
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-4">
          <div className="w-full flex flex-col">
            <span className="text-sm font-medium mb-1">Pincode</span>
            <Input value={pincode} onChange={handlePincodeChange} />
          </div>
          <div className="w-full flex flex-col">
            <span className="text-sm font-medium mb-1">Global Price</span>
            <InputNumber
              value={globalPrice}
              onChange={(e) => setGlobalPrice(e || 0)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <Modal
        title="Create New Area"
        open={isCreateModalOpen}
        onCancel={() => !isCreatingArea && setIsCreateModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            disabled={isCreatingArea}
            onClick={() => setIsCreateModalOpen(false)}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isCreatingArea}
            disabled={!createAreaName || !createZipcode}
            onClick={submitCreateArea}
          >
            Create
          </Button>,
        ]}
        maskClosable={false}
        keyboard={!isCreatingArea}
        closable={!isCreatingArea}
      >
        <Space direction="vertical" className="w-full gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-sm">Area Name</span>
            <Input
              value={createAreaName}
              onChange={(e) => setCreateAreaName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-sm">Pincode</span>
            <Input
              placeholder="Enter Pincode"
              value={createZipcode}
              onChange={handleCreateZipcodeChange}
              maxLength={10}
            />
            <span className="text-xs text-gray-500">
              Only numbers and hyphens are allowed.
            </span>
          </div>
        </Space>
      </Modal>
    </Card>
  );
};

export default LocationConfiguration;
