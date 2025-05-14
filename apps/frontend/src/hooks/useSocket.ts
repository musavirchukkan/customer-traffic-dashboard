import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { CustomerTrafficEvent, StoreState, WebSocketEvents } from "shared";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

interface UseSocketReturn {
  storeStates: StoreState[];
  latestEvent: CustomerTrafficEvent | null;
  isConnected: boolean;
}

export const useSocket = (): UseSocketReturn => {
  const [storeStates, setStoreStates] = useState<StoreState[]>([]);
  const [latestEvent, setLatestEvent] = useState<CustomerTrafficEvent | null>(
    null
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });
    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    // Custom events
    socket.on(WebSocketEvents.INITIAL_STORE_STATES, (data: StoreState[]) => {
      console.log("Received initial store states", data);
      setStoreStates(data);
    });

    socket.on(WebSocketEvents.STORE_STATE_UPDATE, (data: StoreState) => {
      console.log("Received store state update", data);
      setStoreStates((prev) => {
        // Update the store state in the array
        const index = prev.findIndex(
          (store) => store.store_id === data.store_id
        );
        if (index >= 0) {
          const newArray = [...prev];
          newArray[index] = data;
          return newArray;
        } else {
          // Add new store if not found
          return [...prev, data];
        }
      });
    });

    socket.on(
      WebSocketEvents.NEW_TRAFFIC_EVENT,
      (data: CustomerTrafficEvent) => {
        console.log("Received new traffic event", data);
        setLatestEvent(data);
      }
    );

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return { storeStates, latestEvent, isConnected };
};
