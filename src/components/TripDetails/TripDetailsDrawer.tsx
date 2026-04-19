import React from "react";
import { Drawer, Popconfirm, Tooltip, Button, Typography } from "antd";
import { 
  CloseOutlined,
  UserAddOutlined,
  DollarOutlined,
  CloseCircleOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { IoCarOutline } from "react-icons/io5";
import { type TripDetailsType } from "../../store/slices/tripSlice";
import type { PopconfirmProps } from "antd";

const { Title, Text } = Typography;

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
      closable={false}
      placement="right"
      width="100%"
      styles={{
        header: { display: 'none' },
        body: { padding: 0, background: "#f8fafc" },
      }}
    >
       {/* ─── Immersive Header ─────────────────────────────────────────── */}
       <div className="relative overflow-hidden pt-12 pb-8 px-8 bg-white border-b border-gray-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -translate-y-24 translate-x-24" />
        
        <div className="flex justify-between items-center relative z-10">
           <div className="flex items-center gap-5">
              <div className="relative">
                 <div className="relative w-14 h-14 bg-indigo-50 border-2 border-white flex items-center justify-center rounded-2xl text-indigo-600 text-xl">
                    <IoCarOutline />
                 </div>
              </div>
              <div>
                 <Title level={4} className="!m-0 !mb-0.5 font-extrabold text-gray-800 tracking-tight">
                    {trip?.trip_code}
                 </Title>
                 <Text className="text-gray-400 font-bold text-[9px] uppercase tracking-widest block">
                    Transactional Audit
                 </Text>
              </div>
           </div>

           <div className="flex items-center gap-3">
              {/* Action Toolbar */}
              <div className="flex items-center gap-2 mr-4 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                  <Popconfirm {...getAssignDriverPopconfirmProps(trip)} onConfirm={onAssignDriverClick}>
                      <Tooltip title={isTripCompleted(trip) ? "Trip already completed" : ""}>
                          <Button 
                              size="small"
                              disabled={isTripCompleted(trip)}
                              className={`rounded-xl h-9 px-4 font-bold flex items-center gap-2 border-none shadow-sm transition-all text-[11px]
                                  ${isDriverAssigned(trip) ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                          >
                              <UserAddOutlined className="text-sm" />
                              {isDriverAssigned(trip) ? "Reassign" : "Assign"}
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
                      <Tooltip title={isTripCompleted(trip) ? "Trip already completed" : ""}>
                          <Button 
                              size="small"
                              disabled={isTripCompleted(trip)}
                              className="rounded-xl h-9 px-4 font-bold flex items-center gap-2 border-none bg-white text-gray-600 hover:text-emerald-600 shadow-sm text-[11px]"
                          >
                              <DollarOutlined className="text-sm" />
                              Adjust
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
                      <Tooltip title={isTripCompleted(trip) ? "Trip already completed" : ""}>
                          <Button 
                              size="small"
                              disabled={isTripCompleted(trip)}
                              className="rounded-xl h-9 px-4 font-bold flex items-center gap-2 border-none bg-white text-gray-600 hover:text-amber-600 shadow-sm text-[11px]"
                          >
                              <BellOutlined className="text-sm" />
                              Notify
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
                      <Tooltip title={isTripCompleted(trip) ? "Trip already completed" : ""}>
                          <Button 
                              size="small"
                              disabled={isTripCompleted(trip)} 
                              danger
                              className="rounded-xl h-9 px-4 font-bold flex items-center gap-2 bg-rose-50 border-rose-100 text-[11px]"
                          >
                              <CloseCircleOutlined className="text-sm" />
                              Terminate
                          </Button>
                      </Tooltip>
                  </Popconfirm>
              </div>

              <Button 
                  type="text" 
                  icon={<CloseOutlined className="text-gray-400" />} 
                  onClick={onClose} 
                  className="hover:bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center"
              />
           </div>
        </div>
      </div>

      <div className="p-8">
        {!trip ? (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400">
                <IoCarOutline className="text-6xl opacity-20" />
                <p className="font-medium">No trip record selected</p>
            </div>
        ) : (
            <TripDetailsMasonry trip={trip} />
        )}
      </div>
    </Drawer>
  );
};

export default TripDetailsDrawer;
