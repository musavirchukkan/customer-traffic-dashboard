// apps/backend/src/models/store.ts
import { StoreState, CustomerTrafficEvent, HourlyTrafficData } from "shared";

/**
 * In-memory storage for store states and historical data
 * In a production environment, this would be replaced by a database
 */
class StoreDataStore {
  // Current state of all stores
  private storeStates: Map<number, StoreState> = new Map();

  // Historical data by store and hour
  private historicalData: Map<number, Map<string, HourlyTrafficData>> =
    new Map();

  // Latest traffic event
  private latestEvent: CustomerTrafficEvent | null = null;

  /**
   * Process a new customer traffic event and update the store state
   */
  processEvent(event: CustomerTrafficEvent): StoreState {
    const { store_id, customers_in, customers_out, time_stamp } = event;

    // Save the latest event
    this.latestEvent = event;

    // Get current state or initialize new store
    const currentState = this.storeStates.get(store_id) || {
      store_id,
      current_customers: 0,
      last_updated: new Date().toISOString(),
    };

    // Update current customers count
    const newCustomerCount =
      currentState.current_customers + customers_in - customers_out;

    // Ensure we don't have negative customers
    const updatedCustomerCount = Math.max(0, newCustomerCount);

    // Create updated state
    const updatedState: StoreState = {
      store_id,
      current_customers: updatedCustomerCount,
      last_updated: time_stamp,
    };

    // Save updated state
    this.storeStates.set(store_id, updatedState);

    // Update historical data
    this.updateHistoricalData(event);

    return updatedState;
  }

  /**
   * Update the hourly historical data based on a traffic event
   */
  private updateHistoricalData(event: CustomerTrafficEvent): void {
    const { store_id, customers_in, customers_out, time_stamp } = event;

    // Extract the hour from the timestamp (YYYY-MM-DDTHH:00:00Z format)
    const eventDate = new Date(time_stamp);
    const hourKey =
      new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate(),
        eventDate.getHours()
      )
        .toISOString()
        .split(":")[0] + ":00:00Z";

    // Get store's historical data or initialize it
    if (!this.historicalData.has(store_id)) {
      this.historicalData.set(store_id, new Map());
    }

    const storeHistory = this.historicalData.get(store_id)!;

    // Get or initialize hourly data
    const hourData = storeHistory.get(hourKey) || {
      store_id,
      hour: hourKey,
      customers_in_total: 0,
      customers_out_total: 0,
      net_change: 0,
    };

    // Update hourly totals
    const updatedHourData: HourlyTrafficData = {
      ...hourData,
      customers_in_total: hourData.customers_in_total + customers_in,
      customers_out_total: hourData.customers_out_total + customers_out,
      net_change:
        hourData.customers_in_total +
        customers_in -
        (hourData.customers_out_total + customers_out),
    };

    // Save updated hour data
    storeHistory.set(hourKey, updatedHourData);
  }

  /**
   * Get all current store states
   */
  getAllStoreStates(): StoreState[] {
    return Array.from(this.storeStates.values());
  }

  /**
   * Get historical data for all stores for the last 24 hours
   */
  getHistoricalData(storeId?: number): HourlyTrafficData[] {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const result: HourlyTrafficData[] = [];

    // If storeId is provided, filter for that store only
    if (storeId !== undefined) {
      const storeHistory = this.historicalData.get(storeId);
      if (storeHistory) {
        for (const [hourKey, hourData] of storeHistory.entries()) {
          const hourDate = new Date(hourKey);
          if (hourDate >= twentyFourHoursAgo && hourDate <= now) {
            result.push(hourData);
          }
        }
      }
    } else {
      // Get data for all stores
      for (const [, storeHistory] of this.historicalData.entries()) {
        for (const [hourKey, hourData] of storeHistory.entries()) {
          const hourDate = new Date(hourKey);
          if (hourDate >= twentyFourHoursAgo && hourDate <= now) {
            result.push(hourData);
          }
        }
      }
    }

    // Sort by hour (newest first)
    return result.sort(
      (a, b) => new Date(b.hour).getTime() - new Date(a.hour).getTime()
    );
  }

  /**
   * Get the latest traffic event
   */
  getLatestEvent(): CustomerTrafficEvent | null {
    return this.latestEvent;
  }
}

// Export a singleton instance
export const storeDataStore = new StoreDataStore();
