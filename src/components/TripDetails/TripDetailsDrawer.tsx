import React from "react";
import { Drawer, Popconfirm, Tooltip, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { type TripDetailsType } from "../../store/slices/tripSlice";
import type { PopconfirmProps } from "antd";
import {
  UserAddOutlined,
  DollarOutlined,
  CloseCircleOutlined,
  BellOutlined,
} from "@ant-design/icons";

import type { ActionType } from "./TripDetailsTable";
import TripDetailsMasonry from "./TripDetailsMasonry";

interface Props {
  open: boolean;
  trip: TripDetailsType | null;
  onClose: () => void;

  activeAction: ActionType;

  onAssignDriverClick: () => void;
  onAdjustFareClick: () => void;
  onCancelTripClick: () => void;
  onTriggerDriversClick: () => void;

  getAssignDriverPopconfirmProps: (
    trip: TripDetailsType | null,
  ) => PopconfirmProps;

  isTripCompleted: (trip: TripDetailsType | null) => boolean;
  isDriverAssigned: (trip: TripDetailsType | null) => boolean;
  AdjustFareContent: React.ReactNode;
}

const TriggerDriversContent = (
  <div className="text-sm">
    <p className="font-medium">Notify nearby drivers for this trip?</p>
    <p className="text-gray-500 mt-1">
      This will send a request to available drivers.
    </p>
  </div>
);

const CancelTripContent = (
  <div className="text-sm">
    <p className="font-medium text-red-600">
      Are you sure you want to cancel this trip?
    </p>
    <p className="text-gray-500 mt-1">This action cannot be undone.</p>
  </div>
);

const TripDetailsDrawer: React.FC<Props> = ({
  open,
  trip,
  onClose,
  onAssignDriverClick,
  onAdjustFareClick,
  onCancelTripClick,
  onTriggerDriversClick,

  getAssignDriverPopconfirmProps,
  isTripCompleted,
  isDriverAssigned,
  AdjustFareContent,
}) => {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <div className="text-sm font-medium">Trip Details</div>
            <p className="font-medium" style={{ color: "#000080" }}>
              {trip?.trip_id}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
            <Popconfirm
              {...getAssignDriverPopconfirmProps(trip)}
              onConfirm={onAssignDriverClick}
            >
              <Tooltip
                title={isTripCompleted(trip) ? "Trip already completed" : ""}
              >
                <Button disabled={isTripCompleted(trip)}>
                  <UserAddOutlined />
                  {isDriverAssigned(trip) ? "Reassign Driver" : "Assign Driver"}
                </Button>
              </Tooltip>
            </Popconfirm>

            <Popconfirm
              title="Adjust Fare"
              description={AdjustFareContent}
              icon={<DollarOutlined />}
              okText="Update"
              cancelText="Cancel"
              onConfirm={onAdjustFareClick}
            >
              <Tooltip
                title={isTripCompleted(trip) ? "Trip already completed" : ""}
              >
                <Button disabled={isTripCompleted(trip)}>
                  <DollarOutlined />
                  Adjust Fare
                </Button>
              </Tooltip>
            </Popconfirm>

            <Popconfirm
              title="Cancel Trip"
              description={CancelTripContent}
              icon={<CloseCircleOutlined style={{ color: "red" }} />}
              okText="Yes, Cancel"
              cancelText="No"
              okButtonProps={{ danger: true }}
              onConfirm={onCancelTripClick}
            >
              <Tooltip
                title={isTripCompleted(trip) ? "Trip already completed" : ""}
              >
                <Button disabled={isTripCompleted(trip)} danger>
                  <CloseCircleOutlined />
                  Cancel Trip
                </Button>
              </Tooltip>
            </Popconfirm>

            <Popconfirm
              title="Trigger Drivers"
              description={TriggerDriversContent}
              icon={<BellOutlined />}
              okText="Trigger"
              cancelText="Cancel"
              onConfirm={onTriggerDriversClick}
            >
              <Tooltip
                title={isTripCompleted(trip) ? "Trip already completed" : ""}
              >
                <Button disabled={isTripCompleted(trip)}>
                  <BellOutlined />
                  Trigger Drivers
                </Button>
              </Tooltip>
            </Popconfirm>
          </div>
        </div>
      }
      placement="right"
      width="100%"
      //width={window.innerWidth < 768 ? "100%" : 620}

      closeIcon={<CloseOutlined />}
    >
      {!trip ? <p>No trip selected</p> : <TripDetailsMasonry trip={trip} />}
    </Drawer>
  );
};

export default TripDetailsDrawer;
