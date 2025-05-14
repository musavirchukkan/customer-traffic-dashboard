import express from "express";
import http from "http";
import cors from "cors";
import { config } from "./config/env";
import apiRoutes from "./api/routes";
import { kafkaConsumerService } from "./services/kafkaConsumer";
import { socketService } from "./services/socketService";
import { mockDataService } from "./services/mockDataService";

// Create Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api", apiRoutes);

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Customer Traffic Dashboard API" });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
socketService.initialize(server);

// Start the server
const PORT = parseInt(config.port, 10);
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Connect to Kafka and start consuming messages
  // try {
  //   await kafkaConsumerService.connect();
  //   console.log("Kafka consumer started successfully");
  // } catch (error) {
  //   console.error("Failed to start Kafka consumer", error);
  // }

  // Start mock data service instead of connecting to Kafka
  try {
    // Start generating mock data
    mockDataService.start();
    console.log("Mock data generator started successfully");
  } catch (error) {
    console.error("Failed to start mock data generator", error);
  }
});

// Handle graceful shutdown
const shutdown = async () => {
  console.log("Shutting down server...");

  // Disconnect from Kafka
  // await kafkaConsumerService.disconnect();

  // Stop mock data generation
  mockDataService.stop();

  // Close HTTP server
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });

  // Force exit after timeout
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
