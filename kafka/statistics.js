const { Kafka } = require("kafkajs");
const express = require("express");
const cors = require("cors");

const kafka = new Kafka({
    clientId: "animeshelf-statistics",
brokers: [process.env.KAFKA_BROKER || "localhost:9092"]});

const consumer = kafka.consumer({
    groupId: "animeshelf-statistics-group"
});

const app = express();

app.use(cors());

const PORT = 4000;

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

async function startStatisticsConsumer() {
    await consumer.connect();

    await consumer.subscribe({
        topic: "anime-events",
        fromBeginning: true
    });

    console.log("Statistics consumer connected");
    console.log("Waiting for anime events...");

    await consumer.run({
        eachMessage: async ({ message }) => {
            const event = JSON.parse(message.value.toString());

            if (event.type === "ANIME_ADDED") {
    totalAdded++;

    if (event.anime.status === "Watching") {
        watching++;
    }

    if (event.anime.status === "Completed") {
        completed++;
    }
}

if (event.type === "ANIME_DELETED") {
    totalAdded--;

    if (event.anime.status === "Watching") {
        watching--;
    }

    if (event.anime.status === "Completed") {
        completed--;
    }
}

console.log("");
console.log("Anime Statistics");
console.log("----------------");
console.log(`Total added: ${totalAdded}`);
console.log(`Watching: ${watching}`);
console.log(`Completed: ${completed}`);
console.log("");
        }
    });
}

app.listen(PORT, () => {
    console.log(`Statistics service running at http://localhost:${PORT}`);
});

startStatisticsConsumer().catch(error => {
    console.error("Statistics consumer error:", error);
});