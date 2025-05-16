#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}Setting up Kafka for Customer Traffic Dashboard...${NC}"

# Create a docker-compose file for Kafka if it doesn't exist
if [ ! -f "kafka-docker-compose.yml" ]; then
    echo -e "${YELLOW}Creating kafka-docker-compose.yml...${NC}"
    cat > kafka-docker-compose.yml << 'EOF'
version: '3.8'

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.0.1
    container_name: zookeeper
    ports:
      - "2181:2181"
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:7.0.1
    container_name: kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
EOF
fi

# Start Kafka and Zookeeper
echo -e "${GREEN}Starting Kafka and Zookeeper...${NC}"
docker-compose -f kafka-docker-compose.yml up -d

# Check if containers are running
if [ "$(docker ps -q -f name=kafka)" ] && [ "$(docker ps -q -f name=zookeeper)" ]; then
    echo -e "${GREEN}Kafka and Zookeeper are running!${NC}"
    
    # Wait for Kafka to be ready
    echo -e "${YELLOW}Waiting for Kafka to be ready...${NC}"
    sleep 10
    
    # Set the backend to use real Kafka
    if [ -f "apps/backend/.env" ]; then
        echo -e "${YELLOW}Updating backend .env file to use real Kafka...${NC}"
        sed -i 's/USE_MOCK_DATA=true/USE_MOCK_DATA=false/' apps/backend/.env
    else
        echo -e "${RED}Backend .env file not found. Make sure to set USE_MOCK_DATA=false manually.${NC}"
    fi
    
    echo -e "${GREEN}Setup complete! Run your application with:${NC}"
    echo -e "${YELLOW}npm run dev${NC}"
    echo ""
    echo -e "${GREEN}To generate test data, run the mock Kafka producer:${NC}"
    echo -e "${YELLOW}cd tools && node mock-kafka-producer.js${NC}"
else
    echo -e "${RED}Failed to start Kafka and Zookeeper. Please check Docker logs.${NC}"
    exit 1
fi