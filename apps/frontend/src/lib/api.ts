import axios from "axios";
import { StoreState, HourlyTrafficData, HistoricalDataResponse } from "shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

/**
 * Get all store states
 */
export const getAllStores = async (): Promise<StoreState[]> => {
  const response = await api.get<{ data: StoreState[]; total: number }>(
    "/stores"
  );
  return response.data.data;
};

/**
 * Get a specific store state
 */
export const getStore = async (storeId: number): Promise<StoreState> => {
  const response = await api.get<{ data: StoreState }>(`/stores/${storeId}`);
  return response.data.data;
};

/**
 * Get historical data for all stores or a specific store
 */
export const getHistoricalData = async (
  storeId?: number
): Promise<HourlyTrafficData[]> => {
  const url = storeId ? `/history?store_id=${storeId}` : "/history";
  const response = await api.get<HistoricalDataResponse>(url);
  return response.data.data;
};

export default api;
