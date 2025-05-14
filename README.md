# Customer Traffic Dashboard

This project implements a dashboard for monitoring customer traffic in stores. It displays real-time and historical data of customers entering and exiting store locations.

## Features

- **Live Traffic Table**: Shows real-time data of customers in each store
- **Historical Traffic Table**: Displays customer traffic per hour for the last 24 hours
- **Auto-refresh**: Data updates automatically (live data every 3 seconds, historical data every minute)
- **Filter by Store**: Filter historical data by specific store

## Tech Stack

### Frontend

- React
- TypeScript
- Next.js

### Backend

- Node.js
- Express.js
- TypeScript
- Mock Kafka consumer (simulates Kafka messages for local development)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Setup and Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/customer-traffic-dashboard.git
   cd customer-traffic-dashboard
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the shared package:

   ```bash
   npm run build --workspace=shared
   ```

4. Start the development servers:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001/api/stores

## Project Structure

```
customer-traffic-dashboard/
├── apps/
│   ├── frontend/               # Next.js application
│   └── backend/                # Express.js API server and mock Kafka consumer
├── packages/
│   └── shared/                 # Shared code between apps
└── README.md                   # Project documentation
```

## API Endpoints

- `GET /api/stores` - Get all store states
- `GET /api/stores/:id` - Get a specific store state
- `GET /api/history` - Get historical data for all stores
- `GET /api/history?store_id=10` - Get historical data for a specific store
- `GET /api/latest-event` - Get the latest customer traffic event

## Data Format

### Store State

```json
{
  "store_id": 10,
  "current_customers": 5,
  "last_updated": "2023-08-15T10:15:12Z"
}
```

### Customer Traffic Event

```json
{
  "store_id": 10,
  "customers_in": 2,
  "customers_out": 0,
  "time_stamp": "2023-08-15T10:15:12Z"
}
```

### Historical Data

```json
{
  "store_id": 10,
  "hour": "2023-08-15T10:00:00Z",
  "customers_in_total": 5,
  "customers_out_total": 3,
  "net_change": 2
}
```

## Mock Data Generator

For local development, the application uses a mock data generator that simulates Kafka messages. This generates random customer traffic events every few seconds to demonstrate the real-time functionality.

## Implementation Notes

- In a production environment, the application would connect to a real Kafka cluster to consume customer traffic events
- The current implementation stores data in memory; a production version would use a database for persistence
- The frontend uses polling to get updates; in production, WebSockets would provide better real-time performance

## Future Improvements

- Add authentication and authorization
- Implement data persistence with a database
- Add data visualization with charts
- Improve error handling and retries for Kafka connection
- Add unit and integration tests
