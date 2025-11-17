import { useEffect } from "react";
import { Button } from "antd";
import { IoMdRefresh } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "../redux/store";
import type { AppDispatch, RootState } from "../store";

import { fetchTrips } from "../store/slices/tripSlice";
import TripDetailsTable from "../components/TripDetails/TripDetailsTable";
import TitleBar from "../components/TitleBarCommon/TitleBar";

const TripDetails = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { trips, loading } = useSelector((state: RootState) => state.trips);

  const handleRefresh = () => {
    dispatch(fetchTrips());
  };

  useEffect(() => {
    dispatch(fetchTrips());
  }, [dispatch]);

  return (
    <TitleBar
      title="Trip Management"
      description="Manage trips, view detailed records and perform admin actions."
      extraContent={
        <Button
          icon={<IoMdRefresh />}
          loading={loading}
          type="primary"
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      }
    >
      <div className="w-full h-full flex flex-col gap-4">
        <div className="flex-grow overflow-auto">
          <TripDetailsTable data={trips} />
        </div>
      </div>
    </TitleBar>
  );
};

export default TripDetails;