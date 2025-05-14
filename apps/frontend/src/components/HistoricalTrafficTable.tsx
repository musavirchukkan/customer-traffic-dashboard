import React, { useState } from 'react';
import { HourlyTrafficData } from 'shared';
import { format, parseISO } from 'date-fns';

interface HistoricalTrafficTableProps {
    historicalData: HourlyTrafficData[];
    loading: boolean;
}

const HistoricalTrafficTable: React.FC<HistoricalTrafficTableProps> = ({
    historicalData,
    loading
}) => {
    const [filterStoreId, setFilterStoreId] = useState<string>('');

    // Get unique store IDs for the filter dropdown
    const uniqueStoreIds = Array.from(
        new Set(historicalData.map(item => item.store_id))
    ).sort((a, b) => a - b);

    // Filter data based on selected store
    const filteredData = filterStoreId
        ? historicalData.filter(item => item.store_id === parseInt(filterStoreId, 10))
        : historicalData;

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-4 mt-6">
                <h2 className="text-xl font-semibold mb-4">Historical Traffic Data (Last 24 Hours)</h2>
                <div className="text-center py-4">Loading...</div>
            </div>
        );
    }

    if (historicalData.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-4 mt-6">
                <h2 className="text-xl font-semibold mb-4">Historical Traffic Data (Last 24 Hours)</h2>
                <div className="text-center py-4">No historical data available</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Historical Traffic Data (Last 24 Hours)</h2>

                <div className="mt-3">
                    <label htmlFor="storeFilter" className="mr-2 text-sm font-medium text-gray-700">
                        Filter by Store:
                    </label>
                    <select
                        id="storeFilter"
                        value={filterStoreId}
                        onChange={(e) => setFilterStoreId(e.target.value)}
                        className="mt-1 block w-full md:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hour</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customers In</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customers Out</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Change</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map((item, index) => (
                            <tr key={`${item.store_id}-${item.hour}-${index}`} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">{item.store_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {format(parseISO(item.hour), 'yyyy-MM-dd HH:00')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-green-600">
                                    +{item.customers_in_total}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-red-600">
                                    -{item.customers_out_total}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${item.net_change > 0 ? 'bg-green-100 text-green-800' :
                                                item.net_change < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
                                    >
                                        {item.net_change > 0 ? '+' : ''}{item.net_change}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoricalTrafficTable;