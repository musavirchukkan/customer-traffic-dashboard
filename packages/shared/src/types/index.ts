/**
 * Represents a raw Kafka message for customer traffic
 */
export interface CustomerTrafficEvent {
  store_id: number;
  customers_in: number;
  customers_out: number;
  time_stamp: string; // ISO format date string
}

/**
 * Represents the current state of a store
 */
export interface StoreState {
  store_id: number;
  current_customers: number;
  last_updated: string; // ISO format date string
}

/**
 * Represents hourly aggregated data for historical view
 */
export interface HourlyTrafficData {
  store_id: number;
  hour: string; // Format: YYYY-MM-DDTHH:00:00Z
  customers_in_total: number;
  customers_out_total: number;
  net_change: number; // customers_in_total - customers_out_total
}

/**
 * WebSocket event types for real-time communication
 */
export enum WebSocketEvents {
  NEW_TRAFFIC_EVENT = "new_traffic_event",
  INITIAL_STORE_STATES = "initial_store_states",
  STORE_STATE_UPDATE = "store_state_update",
}

/**
 * API Response for getting historical data
 */
export interface HistoricalDataResponse {
  data: HourlyTrafficData[];
  total: number;
}
