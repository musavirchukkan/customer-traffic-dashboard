// apps/backend/src/config/env.ts
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  port: process.env.PORT || "5001",
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || "customer-traffic-consumer",
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
    topic: process.env.KAFKA_TOPIC || "store-customer-traffic",
    groupId: process.env.KAFKA_GROUP_ID || "customer-traffic-group",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },
  features: {
    useMockData: process.env.USE_MOCK_DATA === "true",
  },
};
