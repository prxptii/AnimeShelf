const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: "animeshelf-api",
brokers: [process.env.KAFKA_BROKER || "localhost:9092"]});

const producer = kafka.producer();

async function connectProducer() {
    await producer.connect();
    console.log("Kafka producer connected");
}

async function sendAnimeEvent(event) {
    await producer.send({
        topic: "anime-events",
        messages: [
            {
                value: JSON.stringify(event)
            }
        ]
    });
}

async function disconnectProducer() {
    await producer.disconnect();
}

module.exports = {
    connectProducer,
    sendAnimeEvent,
    disconnectProducer
};