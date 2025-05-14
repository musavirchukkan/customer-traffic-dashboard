// tools/mock-kafka-producer.js
const { Kafka } = require('kafkajs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Kafka configuration
const kafka = new Kafka({
    clientId: 'mock-store-traffic-producer',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const producer = kafka.producer();
const topic = process.env.KAFKA_TOPIC || 'store-customer-traffic';

// Define store IDs for simulation
const storeIds = [10, 11, 12, 13, 14];

/**
 * Generate a random integer between min and max (inclusive)
 */
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate a random customer traffic event
 */
const generateTrafficEvent = () => {
    const storeId = storeIds[getRandomInt(0, storeIds.length - 1)];

    // Randomly decide if it's customers entering or exiting
    const isEntering = Math.random() > 0.5;

    // Generate 0-3 customers in or out (more likely to be 1-2)
    const customersCount = getRandomInt(0, 3);

    return {
        store_id: storeId,
        customers_in: isEntering ? customersCount : 0,
        customers_out: !isEntering ? customersCount : 0,
        time_stamp: new Date().toISOString(),
    };
};

/**
 * Send a message to Kafka
 */
const sendMessage = async (message) => {
    await producer.send({
        topic,
        messages: [
            {
                value: JSON.stringify(message),
            },
        ],
    });

    console.log('Message sent:', message);
};

/**
 * Start the producer and send random messages
 */
const runProducer = async () => {
    await producer.connect();
    console.log('Producer connected to Kafka');

    // Send a message every 2-5 seconds
    setInterval(async () => {
        try {
            const event = generateTrafficEvent();
            await sendMessage(event);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }, getRandomInt(2000, 5000));
};

// Start the producer
runProducer().catch(console.error);

// Handle graceful shutdown
const shutdown = async () => {
    console.log('Shutting down producer...');
    await producer.disconnect();
    console.log('Producer disconnected');
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);