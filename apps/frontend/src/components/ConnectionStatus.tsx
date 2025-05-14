// apps/frontend/src/components/ConnectionStatus.tsx
import React from 'react';

interface ConnectionStatusProps {
    isConnected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
    return (
        <div className="flex items-center">
            <div
                className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}
            />
            <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
            </span>
        </div>
    );

};

export default ConnectionStatus;