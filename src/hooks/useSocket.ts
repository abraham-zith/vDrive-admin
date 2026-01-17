import { useContext } from "react";
import { SocketContext } from "../contexts/SocketContext";
import { Socket } from "socket.io-client";

export const useSocket = (): {
  socket: Socket | null;
  isConnected: boolean;
} => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
