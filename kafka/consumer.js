const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: "animeshelf-consumer",
brokers: [process.env.KAFKA_BROKER || "localhost:9092"]});

const consumer = kafka.consumer({
    groupId: "animeshelf-group"
});

async function startConsumer() {
    await consumer.connect();

    await consumer.subscribe({
        topic: "anime-events",
        fromBeginning: true
    });

    console.log("Kafka consumer connected");
    console.log("Waiting for anime events...");

    await consumer.run({
        eachMessage: async ({ message }) => {
            const event = JSON.parse(message.value.toString());

            console.log("Received Kafka event:");
            console.log(event);
        }
    });
}

startConsumer().catch(error => {
    console.error("Consumer error:", error);
});