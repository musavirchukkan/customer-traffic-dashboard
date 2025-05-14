import { useEffect, useState } from "react";
import { HourlyTrafficData } from "shared";
import { getHistoricalData } from "@/lib/api";

interface UseHistoricalDataReturn {
  historicalData: HourlyTrafficData[];
  loading: boolean;
  error: Error | null;
  refetch: (storeId?: number) => Promise<void>;
}

export const useHistoricalData = (
  initialStoreId?: number
): UseHistoricalDataReturn => {
  const [historicalData, setHistoricalData] = useState<HourlyTrafficData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (storeId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistoricalData(storeId);
      setHistoricalData(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
      console.error("Error fetching historical data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(initialStoreId);

    // Set up auto-refresh interval (every 5 minutes)
    const intervalId = setInterval(() => {
      fetchData(initialStoreId);
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [initialStoreId]);

  return {
    historicalData,
    loading,
    error,
    refetch: fetchData,
  };
};
