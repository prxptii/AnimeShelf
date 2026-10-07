const { Kafka } = require("kafkajs");
const express = require("express");
const cors = require("cors");

const kafka = new Kafka({
    clientId: "animeshelf-statistics",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    retry: {
        initialRetryTime: 300,
        retries: 8
    }
});

const consumer = kafka.consumer({
    groupId: "animeshelf-statistics-group"
});

const app = express();
app.use(cors());

const PORT = process.env.STATISTICS_PORT || 4000;

let totalAdded = 0;
let watching = 0;
let completed = 0;

app.get("/stats", (req, res) => {
    res.json({
        totalAdded,
        watching,
        completed
    });
});

async function startStatisticsConsumer(retries = 10, delayMs = 3000) {
    let connected = false;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await consumer.connect();
            connected = true;
            console.log("Statistics consumer connected successfully");
            break;
        } catch (error) {
            console.error(`Statistics consumer connection attempt ${attempt}/${retries} failed: ${error.message}`);
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }

    if (!connected) {
        throw new Error("Statistics consumer failed to connect after maximum retries.");
    }

    await consumer.subscribe({
        topic: "anime-events",
        fromBeginning: true
    });

    console.log("Waiting for anime events...");

    await consumer.run({
        eachMessage: async ({ message }) => {
            try {
                if (!message || !message.value) return;

                const event = JSON.parse(message.value.toString());
                if (!event || typeof event !== "object") return;

                const status = event.anime && event.anime.status;

                if (event.type === "ANIME_ADDED") {
                    totalAdded++;
                    if (status === "Watching") watching++;
                    if (status === "Completed") completed++;
                }

                if (event.type === "ANIME_DELETED") {
                    totalAdded = Math.max(0, totalAdded - 1);
                    if (status === "Watching") watching = Math.max(0, watching - 1);
                    if (status === "Completed") completed = Math.max(0, completed - 1);
                }

                console.log("");
                console.log("Anime Statistics");
                console.log("----------------");
                console.log(`Total added: ${totalAdded}`);
                console.log(`Watching: ${watching}`);
                console.log(`Completed: ${completed}`);
                console.log("");
            } catch (error) {
                console.error("Error processing statistics event:", error.message);
            }
        }
    });
}

async function stopStatisticsConsumer() {
    try {
        await consumer.disconnect();
        console.log("Statistics consumer disconnected cleanly");
    } catch (error) {
        console.error("Error disconnecting statistics consumer:", error.message);
    }
}

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Statistics service running at http://localhost:${PORT}`);
    });

    startStatisticsConsumer().catch(error => {
        console.error("Statistics consumer runtime error:", error);
    });

    process.on("SIGINT", async () => {
        console.log("SIGINT received. Shutting down statistics service...");
        await stopStatisticsConsumer();
        process.exit(0);
    });

    process.on("SIGTERM", async () => {
        console.log("SIGTERM received. Shutting down statistics service...");
        await stopStatisticsConsumer();
        process.exit(0);
    });
}

module.exports = {
    app,
    startStatisticsConsumer,
    stopStatisticsConsumer,
    getStats: () => ({ totalAdded, watching, completed })
};