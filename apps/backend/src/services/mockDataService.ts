import { CustomerTrafficEvent, WebSocketEvents } from "shared";
import { storeDataStore } from "../models/store";
import { socketService } from "./socketService";

class MockDataService {
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private storeIds: number[] = [10, 11, 12, 13, 14];

  /**
   * Start generating mock data
   */
  start(): void {
    if (this.isRunning) return;

    console.log("Starting mock data generation");
    this.isRunning = true;

    // Generate an event every 2-5 seconds
    this.intervalId = setInterval(() => {
      const event = this.generateRandomEvent();
      this.processEvent(event);
    }, this.getRandomInt(2000, 5000));
  }

  /**
   * Stop generating mock data
   */
  stop(): void {
    if (!this.isRunning || !this.intervalId) return;

    console.log("Stopping mock data generation");
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;
  }

  /**
   * Process a mock event
   */
  private processEvent(event: CustomerTrafficEvent): void {
    console.log(
      `Generated mock event: store=${event.store_id}, in=${event.customers_in}, out=${event.customers_out}`
    );

    // Process the event and update the store state
    const updatedState = storeDataStore.processEvent(event);

    // Emit the event and updated state via WebSocket
    socketService.emit(WebSocketEvents.NEW_TRAFFIC_EVENT, event);
    socketService.emit(WebSocketEvents.STORE_STATE_UPDATE, updatedState);
  }

  /**
   * Generate a random customer traffic event
   */
  private generateRandomEvent(): CustomerTrafficEvent {
    const storeId =
      this.storeIds[this.getRandomInt(0, this.storeIds.length - 1)];

    // Randomly decide if it's customers entering or exiting
    const isEntering = Math.random() > 0.5;

    // Generate 0-3 customers in or out (more likely to be 1-2)
    const customersCount = this.getRandomInt(0, 3);

    return {
      store_id: storeId,
      customers_in: isEntering ? customersCount : 0,
      customers_out: !isEntering ? customersCount : 0,
      time_stamp: new Date().toISOString(),
    };
  }

  /**
   * Generate a random integer between min and max (inclusive)
   */
  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// Export a singleton instance
export const mockDataService = new MockDataService();
