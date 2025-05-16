import { Server } from "socket.io";
import http from "http";
import { WebSocketEvents } from "shared";
import { config } from "../config/env";
import { storeDataStore } from "../models/store";

class SocketService {
  private io: Server | null = null;

  /**
   * Initialize Socket.IO server
   */
  initialize(server: http.Server): void {
    this.io = new Server(server, {
      cors: {
        origin: "*", // Allow all origins for development
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
      },
    });

    this.setupEventHandlers();
    console.log("Socket.IO initialized");
  }

  /**
   * Set up Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Send initial store states to the client
      const storeStates = storeDataStore.getAllStoreStates();
      socket.emit("message", {
        type: WebSocketEvents.INITIAL_STORE_STATES,
        payload: storeStates,
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Emit an event to all connected clients
   */
  emit<T>(event: string, data: T): void {
    if (!this.io) {
      console.warn("Socket.IO not initialized yet");
      return;
    }

    // Wrap the data in a message object with a type
    this.io.emit("message", {
      type: event,
      payload: data,
    });
  }
}

// Export a singleton instance
export const socketService = new SocketService();
