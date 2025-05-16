import express from "express";
import http from "http";
import cors from "cors";
import { config } from "./config/env";
import apiRoutes from "./api/routes";
import { kafkaConsumerService } from "./services/kafkaConsumer";
import { mockDataService } from "./services/mockDataService";
import { socketService } from "./services/socketService";

// Create Express app
const app = express();

// Enhanced CORS configuration to allow all origins in development
app.use(
  cors({
    origin: "*", // Allow all origins for development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Routes
app.use("/api", apiRoutes);

// Default route
app.get("/", (req, res) => {
  res.json({
    message: "Customer Traffic Dashboard API",
    mode: config.features.useMockData
      ? "Mock Data (No Kafka)"
      : "Kafka Consumer",
  });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with enhanced CORS
socketService.initialize(server);

// Start the server
const PORT = parseInt(config.port, 10);
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  if (config.features.useMockData) {
    // Use mock data generator (no Kafka required)
    try {
      mockDataService.start();
      console.log("Mock data generator started successfully");
    } catch (error) {
      console.error("Failed to start mock data generator", error);
    }
  } else {
    // Use real Kafka consumer
    try {
      await kafkaConsumerService.connect();
      console.log("Kafka consumer started successfully");
    } catch (error) {
      console.error("Failed to start Kafka consumer", error);
      console.log("Falling back to mock data generator...");
      // Fallback to mock data if Kafka connection fails
      try {
        mockDataService.start();
        console.log("Mock data generator started successfully as fallback");
      } catch (mockError) {
        console.error("Failed to start mock data generator", mockError);
      }
    }
  }
});

// Handle graceful shutdown
const shutdown = async () => {
  console.log("Shutting down server...");

  // Stop data services
  if (config.features.useMockData) {
    mockDataService.stop();
  } else {
    await kafkaConsumerService.disconnect();
  }

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
