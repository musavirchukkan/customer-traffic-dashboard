# Customer Traffic Dashboard

This project implements a dashboard for monitoring customer traffic in stores. It displays real-time and historical data of customers entering and exiting store locations.

## Features

- **Live Traffic Table**: Shows real-time data of customers in each store
- **Historical Traffic Table**: Displays customer traffic per hour for the last 24 hours
- **Auto-refresh**: Data updates automatically (live data every 3 seconds, historical data every minute)
- **Filter by Store**: Filter historical data by specific store
- **Flexible Implementation**: Supports both mock data generation and real Kafka integration

## Tech Stack

### Frontend

- React
- TypeScript
- Next.js

### Backend

- Node.js
- Express.js
- TypeScript
- Optional Kafka integration

## Getting Started

### Prerequisites

- Node.js v16+ (Tested with Node.js v22.14.0)
- npm v7+ (Tested with npm v11.3.0)
- Docker and Docker Compose (only required if using real Kafka)

### Option 1: Run with Mock Data (No Kafka Required)

This is the default configuration and is the easiest to get started with:

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

### Option 2: Run with Real Kafka

This option requires Docker and Docker Compose to run Kafka and Zookeeper:

1. Clone the repository and install dependencies as in Option 1.

2. Run the Kafka setup script:

   ```bash
   chmod +x setup-kafka.sh
   ./setup-kafka.sh
   ```

   This script will:

   - Create a docker-compose file for Kafka and Zookeeper
   - Start the containers
   - Update the backend environment to use real Kafka

3. Start the development servers:

   ```bash
   npm run dev
   ```

4. In a separate terminal, run the mock Kafka producer to generate test data:

   ```bash
   cd tools
   npm install
   node mock-kafka-producer.js
   ```

5. Open the frontend at http://localhost:3000

## Environment Configuration

### Backend (.env)

```
# Server configuration
PORT=5001

# Kafka configuration
KAFKA_CLIENT_ID=customer-traffic-consumer
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC=store-customer-traffic
KAFKA_GROUP_ID=customer-traffic-group

# CORS configuration
CORS_ORIGIN=http://localhost:3000

# Feature flags
USE_MOCK_DATA=true  # Set to false to use real Kafka
```

### Frontend (.env)

```
# API configuration
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001

# UI configuration
NEXT_PUBLIC_AUTO_REFRESH_LIVE_DATA=3000  # milliseconds
NEXT_PUBLIC_AUTO_REFRESH_HISTORICAL_DATA=60000  # milliseconds
```

## Project Structure

```
customer-traffic-dashboard/
├── apps/
│   ├── frontend/               # Next.js application
│   └── backend/                # Express.js API server and Kafka/mock service
├── packages/
│   └── shared/                 # Shared code between apps
├── tools/                      # Utility scripts
│   └── mock-kafka-producer.js  # Generates test data for Kafka
└── README.md                   # Project documentation
```

## API Endpoints

- `GET /api/stores` - Get all store states
- `GET /api/stores/:id` - Get a specific store state
- `GET /api/history` - Get historical data for all stores
- `GET /api/history?store_id=10` - Get historical data for a specific store
- `GET /api/latest-event` - Get the latest customer traffic event

## Mock Data vs. Real Kafka

The application supports two data sourcing modes:

1. **Mock Data (Default)**:

   - No external dependencies required
   - Generates random customer traffic events internally
   - Great for development and demonstration

2. **Real Kafka**:
   - Requires Kafka running (setup provided via Docker)
   - Uses the `mock-kafka-producer.js` to generate test events
   - Simulates a real production environment with data streaming

You can switch between these modes by changing the `USE_MOCK_DATA` environment variable in the backend `.env` file.

## Implementation Notes

- The application automatically falls back to mock data if Kafka connection fails
- All hardcoded values are moved to environment variables for flexibility
- The interface updates in real-time regardless of which data source is used
