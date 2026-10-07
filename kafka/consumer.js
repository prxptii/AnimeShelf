const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: "animeshelf-consumer",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    retry: {
        initialRetryTime: 300,
        retries: 8
    }
});

const consumer = kafka.consumer({
    groupId: "animeshelf-group"
});

async function startConsumer(retries = 10, delayMs = 3000) {
    let connected = false;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await consumer.connect();
            connected = true;
            console.log("Kafka consumer connected successfully");
            break;
        } catch (error) {
            console.error(`Kafka consumer connection attempt ${attempt}/${retries} failed: ${error.message}`);
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }

    if (!connected) {
        throw new Error("Kafka consumer failed to connect after maximum retries.");
    }

    await consumer.subscribe({
        topic: "anime-events",
        fromBeginning: true
    });

    console.log("Waiting for anime events...");

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                if (!message || !message.value) return;
                const event = JSON.parse(message.value.toString());
                console.log("Received Kafka event:");
                console.log(event);
            } catch (error) {
                console.error("Error processing Kafka message:", error.message);
            }
        }
    });
}

async function stopConsumer() {
    try {
        await consumer.disconnect();
        console.log("Kafka consumer disconnected cleanly");
    } catch (error) {
        console.error("Error disconnecting consumer:", error.message);
    }
}

if (require.main === module) {
    const errorLogger = (error) => {
        console.error("Consumer runtime error:", error);
    };

    startConsumer().catch(errorLogger);

    process.on("SIGINT", async () => {
        console.log("SIGINT received. Shutting down consumer...");
        await stopConsumer();
        process.exit(0);
    });

    process.on("SIGTERM", async () => {
        console.log("SIGTERM received. Shutting down consumer...");
        await stopConsumer();
        process.exit(0);
    });
}

module.exports = {
    startConsumer,
    stopConsumer
};