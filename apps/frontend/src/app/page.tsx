'use client';

import React, { useEffect, useState } from 'react';

// Types to match the backend
interface StoreState {
  store_id: number;
  current_customers: number;
  last_updated: string;
}

interface CustomerTrafficEvent {
  store_id: number;
  customers_in: number;
  customers_out: number;
  time_stamp: string;
}

interface HourlyTrafficData {
  store_id: number;
  hour: string;
  customers_in_total: number;
  customers_out_total: number;
  net_change: number;
}

export default function Home() {
  const [storeStates, setStoreStates] = useState<StoreState[]>([]);
  const [historicalData, setHistoricalData] = useState<HourlyTrafficData[]>([]);
  const [latestEvent, setLatestEvent] = useState<CustomerTrafficEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [historicalLoading, setHistoricalLoading] = useState<boolean>(true);
  const [filterStoreId, setFilterStoreId] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get API URL and refresh intervals from environment variables
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const LIVE_DATA_REFRESH_INTERVAL = parseInt(process.env.NEXT_PUBLIC_AUTO_REFRESH_LIVE_DATA || '3000', 10);
  const HISTORICAL_DATA_REFRESH_INTERVAL = parseInt(process.env.NEXT_PUBLIC_AUTO_REFRESH_HISTORICAL_DATA || '60000', 10);

  // Fetch live data
  const fetchLiveData = async () => {
    try {
      setError(null);
      console.log('Fetching live data from:', `${API_URL}/stores`);
      const response = await fetch(`${API_URL}/stores`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Log the received data
      console.log('Received live data:', data);

      // Update store states
      setStoreStates(data.data || []);

      // Check if there's a new event by comparing with the last known state
      if (data.data?.length > 0) {
        const latestStore = data.data.reduce((latest: StoreState, current: StoreState) => {
          return new Date(current.last_updated) > new Date(latest.last_updated) ? current : latest;
        }, data.data[0]);

        // Create a pseudo event if it's newer than our latest known event
        if (!latestEvent || new Date(latestStore.last_updated) > new Date(latestEvent.time_stamp)) {
          // Try to infer the event based on store state changes
          const oldStore = storeStates.find(s => s.store_id === latestStore.store_id);
          if (oldStore) {
            const diff = latestStore.current_customers - oldStore.current_customers;
            if (diff !== 0) {
              setLatestEvent({
                store_id: latestStore.store_id,
                customers_in: diff > 0 ? diff : 0,
                customers_out: diff < 0 ? -diff : 0,
                time_stamp: latestStore.last_updated
              });
            }
          }
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching store data:', error);
      setError(`Failed to fetch live data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  // Fetch historical data
  const fetchHistoricalData = async () => {
    try {
      setHistoricalLoading(true);
      setError(null);
      const url = filterStoreId
        ? `${API_URL}/history?store_id=${filterStoreId}`
        : `${API_URL}/history`;

      console.log('Fetching historical data from:', url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Log the received data
      console.log('Received historical data:', data);

      setHistoricalData(data.data || []);
      setHistoricalLoading(false);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setError(`Failed to fetch historical data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setHistoricalLoading(false);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await Promise.all([fetchLiveData(), fetchHistoricalData()]);
    } catch (error) {
      console.error('Error during refresh:', error);
      setError(`Refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRefreshing(false);
    }
  };

  // Set up data fetching at regular intervals
  useEffect(() => {
    // Initial data load
    fetchLiveData();
    fetchHistoricalData();

    // Set up polling intervals
    const liveDataInterval = setInterval(fetchLiveData, LIVE_DATA_REFRESH_INTERVAL); // Update live data as per env config
    const historyInterval = setInterval(fetchHistoricalData, HISTORICAL_DATA_REFRESH_INTERVAL); // Update history as per env config

    // Clean up intervals on component unmount
    return () => {
      clearInterval(liveDataInterval);
      clearInterval(historyInterval);
    };
  }, []);

  // Refetch historical data when filter changes
  useEffect(() => {
    fetchHistoricalData();
  }, [filterStoreId]);

  // Get unique store IDs for the filter dropdown
  const uniqueStoreIds = Array.from(
    new Set([...storeStates.map(item => item.store_id), ...historicalData.map(item => item.store_id)])
  ).sort((a, b) => a - b);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: refreshing ? '#93c5fd' : '#3b82f6',
            color: 'white',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: refreshing ? 'default' : 'pointer',
            fontWeight: '500',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#fee2e2',
          borderLeft: '4px solid #dc2626',
          color: '#b91c1c',
          borderRadius: '0.25rem'
        }}>
          <p><strong>Error:</strong> {error}</p>
          <p>Please check that the backend server is running at {API_URL}</p>
        </div>
      )}

      {/* Live Traffic Table */}
      <div style={{ marginBottom: '2rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Live Traffic Data</h2>
          {latestEvent && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              Latest Event: Store {latestEvent.store_id} -
              {latestEvent.customers_in > 0 && <span style={{ color: '#16a34a' }}> +{latestEvent.customers_in} in</span>}
              {latestEvent.customers_out > 0 && <span style={{ color: '#dc2626' }}> -{latestEvent.customers_out} out</span>}
              <span style={{ marginLeft: '0.5rem' }}>
                at {new Date(latestEvent.time_stamp).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '1rem', textAlign: 'center' }}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f3f4f6' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'medium', color: '#6b7280', textTransform: 'uppercase' }}>Store ID</th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'medium', color: '#6b7280', textTransform: 'uppercase' }}>Current Customers</th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'medium', color: '#6b7280', textTransform: 'uppercase' }}>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {storeStates.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: '1rem', textAlign: 'center' }}>
                      No stores available
                    </td>
                  </tr>
                ) : (
                  storeStates.map((store) => (
                    <tr key={store.store_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>{store.store_id}</td>
                      <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {store.current_customers}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6b7280' }}>
                        {new Date(store.last_updated).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historical Traffic Table */}
      <div style={{ marginTop: '1.5rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Historical Traffic Data (Last 24 Hours)</h2>

          <div style={{ marginTop: '0.75rem' }}>
            <label htmlFor="storeFilter" style={{ marginRight: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
              Filter by Store:
            </label>
            <select
              id="storeFilter"
              value={filterStoreId}
              onChange={(e) => setFilterStoreId(e.target.value)}
              style={{
                marginTop: '0.25rem',
                display: 'block',
                width: '100%',
                maxWidth: '16rem',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none'
              }}
            >
              <option value="">All Stores</option>
              {uniqueStoreIds.map((storeId) => (
                <option key={storeId} value={storeId}>
                  Store {storeId}
                </option>
              ))}
            </select>
          </div>
        </div>

        {historicalLoading ? (
          <div style={{ padding: '1rem', textAlign: 'center' }}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f3f4f6' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'medium', color: '#6b7280', textTransform: 'uppercase' }}>Store ID</th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'medium', color: '#6b7280', textTransform: 'uppercase' }}>Hour</th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'medium', color: '#6b7280', textTransform: 'uppercase' }}>Customers In</th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'medium', color: '#6b7280', textTransform: 'uppercase' }}>Customers Out</th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'medium', color: '#6b7280', textTransform: 'uppercase' }}>Net Change</th>
                </tr>
              </thead>
              <tbody>
                {historicalData.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>
                      No historical data available
                    </td>
                  </tr>
                ) : (
                  historicalData.map((item, index) => (
                    <tr key={`${item.store_id}-${item.hour}-${index}`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>{item.store_id}</td>
                      <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                        {new Date(item.hour).toLocaleString(undefined, {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          hour12: false
                        })}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', color: '#16a34a' }}>
                        +{item.customers_in_total}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', color: '#dc2626' }}>
                        -{item.customers_out_total}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          backgroundColor: item.net_change > 0 ? '#dcfce7' : item.net_change < 0 ? '#fee2e2' : '#f3f4f6',
                          color: item.net_change > 0 ? '#166534' : item.net_change < 0 ? '#b91c1c' : '#4b5563',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {item.net_change > 0 ? '+' : ''}{item.net_change}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update information */}
      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
        Data refreshes automatically: Live data every {LIVE_DATA_REFRESH_INTERVAL / 1000} seconds, historical data every {HISTORICAL_DATA_REFRESH_INTERVAL / 60000} minute(s).
        <div>API URL: {API_URL}</div>
      </div>
    </div>
  );
}