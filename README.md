# AnimeShelf

AnimeShelf is a simple anime management web application built using **Node.js** and **Express**.

The project uses **Apache Kafka** to demonstrate event-driven architecture and distributed systems concepts.

## Features

- Add anime to your shelf
- Delete anime from your shelf
- Set anime status
- Add anime ratings
- View anime statistics
- Publish anime events using Kafka
- Process events using separate Kafka consumers

## Technologies Used

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- Apache Kafka
- KafkaJS
- Docker
- Docker Compose
- Jest
- Supertest
- GitHub Actions
- Render

## Kafka

AnimeShelf uses **Apache Kafka** for event-based communication.

When an anime is added or deleted, the Express API publishes an event to the `anime-events` Kafka topic.

The project has two Kafka consumers:

### Logger Consumer

The Logger Consumer receives anime events and logs them to the console.

### Statistics Consumer

The Statistics Consumer receives anime events and maintains statistics such as:

- Total anime added
- Anime currently being watched
- Completed anime

The main events used by the application are:

- `ANIME_ADDED`
- `ANIME_DELETED`

## Project Structure

    AnimeShelf/
    ├── kafka/
    │   ├── producer.js
    │   ├── consumer.js
    │   └── statistics.js
    ├── public/
    │   ├── index.html
    │   ├── script.js
    │   └── style.css
    ├── tests/
    │   └── anime.test.js
    ├── server.js
    ├── Dockerfile
    ├── docker-compose.yml
    ├── package.json
    ├── package-lock.json
    └── README.md

## Running Locally

### 1. Install Dependencies

    npm install

### 2. Run Tests

    npm test

### 3. Run with Docker Compose

The project includes a production-ready Docker Compose configuration for running the application, Kafka KRaft broker, Logger Consumer, and Statistics Consumer together.

    docker compose up --build

All services feature automated connection retries, backoff handling, and health checks to ensure seamless startup.

## Testing

The project uses **Jest** and **Supertest** for automated testing.

The current tests cover:

- Health endpoint
- Getting the anime list
- Adding an anime
- Rejecting an invalid anime request
- Deleting an anime
- Kafka Producer connection retries and event publishing
- Kafka Consumer startup, message handling, and graceful signal shutdowns
- Statistics calculation and non-negative bounds safeguards

## CI/CD

**GitHub Actions** is used for continuous integration.

The workflow automatically:

1. Checks out the repository
2. Sets up Node.js
3. Installs dependencies
4. Runs the complete test suite

The project has also been connected to **Render** for cloud deployment.

## Current Status

The AnimeShelf application, event-driven Kafka architecture (Producer, Logger Consumer, Statistics Consumer), Docker Compose orchestration, and test suites are fully implemented and verified.

## Purpose

This project was created to gain practical experience with:

- Distributed systems
- Event-driven architecture
- Apache Kafka
- Message-based communication
- Docker
- Automated testing
- CI/CD
- Cloud deployment
