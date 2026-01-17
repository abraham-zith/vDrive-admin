import { createContext } from "react";
import { Socket } from "socket.io-client";

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  socketId: string | null;
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  socketId: null,
});
