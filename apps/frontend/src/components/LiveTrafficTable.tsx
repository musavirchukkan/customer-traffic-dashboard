// apps/frontend/src/components/LiveTrafficTable.tsx
import React from "react";
import { StoreState, CustomerTrafficEvent } from "shared";
import { format } from "date-fns";

interface LiveTrafficTableProps {
  storeStates: StoreState[];
  latestEvent: CustomerTrafficEvent | null;
}

const LiveTrafficTable: React.FC<LiveTrafficTableProps> = ({
  storeStates,
  latestEvent,
}) => {
  if (storeStates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Live Traffic Data</h2>
        <div className="text-center py-4">No stores available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Live Traffic Data</h2>
        {latestEvent && (
          <div className="mt-2 text-sm text-gray-500">
            Latest Event: Store {latestEvent.store_id} -
            {latestEvent.customers_in > 0 && (
              <span className="text-green-500">
                {" "}
                +{latestEvent.customers_in} in
              </span>
            )}
            {latestEvent.customers_out > 0 && (
              <span className="text-red-500">
                {" "}
                -{latestEvent.customers_out} out
              </span>
            )}
            <span className="ml-2">
              at {format(new Date(latestEvent.time_stamp), "HH:mm:ss")}
            </span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Store ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Customers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {storeStates.map((store) => (
              <tr key={store.store_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {store.store_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {store.current_customers}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(store.last_updated), "yyyy-MM-dd HH:mm:ss")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiveTrafficTable;
