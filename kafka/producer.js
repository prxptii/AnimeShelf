const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: "animeshelf-api",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    retry: {
        initialRetryTime: 300,
        retries: 8
    }
});

const producer = kafka.producer();
let isConnected = false;

async function connectProducer(retries = 5, delayMs = 2000) {
    if (isConnected) return true;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await producer.connect();
            isConnected = true;
            console.log("Kafka producer connected successfully");
            return true;
        } catch (error) {
            console.error(`Kafka producer connection attempt ${attempt}/${retries} failed: ${error.message}`);
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }
    console.error("Kafka producer could not connect after multiple attempts.");
    return false;
}

async function sendAnimeEvent(event) {
    try {
        if (!isConnected) {
            const connected = await connectProducer(2, 1000);
            if (!connected) {
                console.warn("Skipping event send: Kafka producer is not connected.");
                return false;
            }
        }

        await producer.send({
            topic: "anime-events",
            messages: [
                {
                    value: JSON.stringify(event)
                }
            ]
        });
        return true;
    } catch (error) {
        console.error("Failed to send Kafka event:", error.message);
        return false;
    }
}

async function disconnectProducer() {
    try {
        if (isConnected) {
            await producer.disconnect();
            isConnected = false;
            console.log("Kafka producer disconnected");
        }
    } catch (error) {
        console.error("Error disconnecting Kafka producer:", error.message);
    }
}

module.exports = {
    connectProducer,
    sendAnimeEvent,
    disconnectProducer
};