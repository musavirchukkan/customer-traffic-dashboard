import { Kafka, Consumer } from "kafkajs";
import { CustomerTrafficEvent, WebSocketEvents } from "shared";
import { config } from "../config/env";
import { storeDataStore } from "../models/store";
import { socketService } from "./socketService";

class KafkaConsumerService {
  private kafka: Kafka;
  private consumer: Consumer;
  private isConnected: boolean = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
    });

    this.consumer = this.kafka.consumer({
      groupId: config.kafka.groupId,
    });
  }

  /**
   * Connect to Kafka and start consuming messages
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      await this.consumer.connect();
      await this.consumer.subscribe({
        topic: config.kafka.topic,
        fromBeginning: false,
      });

      console.log(
        `Connected to Kafka and subscribed to topic: ${config.kafka.topic}`
      );
      this.isConnected = true;

      // Start consuming messages
      await this.startConsumer();
    } catch (error) {
      console.error("Failed to connect to Kafka", error);
      throw error;
    }
  }

  /**
   * Start consuming messages from Kafka
   */
  private async startConsumer(): Promise<void> {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (!message.value) return;

          // Parse the message value
          const event: CustomerTrafficEvent = JSON.parse(
            message.value.toString()
          );

          // Validate the event
          if (!this.validateEvent(event)) {
            console.warn("Invalid event received:", event);
            return;
          }

          console.log(
            `Received event from store ${event.store_id}: in=${event.customers_in}, out=${event.customers_out}`
          );

          // Process the event and update the store state
          const updatedState = storeDataStore.processEvent(event);

          // Emit the event and updated state via WebSocket
          socketService.emit(WebSocketEvents.NEW_TRAFFIC_EVENT, event);
          socketService.emit(WebSocketEvents.STORE_STATE_UPDATE, updatedState);
        } catch (error) {
          console.error("Error processing Kafka message", error);
        }
      },
    });
  }

  /**
   * Validate the customer traffic event
   */
  private validateEvent(event: any): event is CustomerTrafficEvent {
    return (
      typeof event === "object" &&
      typeof event.store_id === "number" &&
      typeof event.customers_in === "number" &&
      typeof event.customers_out === "number" &&
      typeof event.time_stamp === "string"
    );
  }

  /**
   * Disconnect from Kafka
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.consumer.disconnect();
      this.isConnected = false;
      console.log("Disconnected from Kafka");
    } catch (error) {
      console.error("Failed to disconnect from Kafka", error);
    }
  }
}

// Export a singleton instance
export const kafkaConsumerService = new KafkaConsumerService();
