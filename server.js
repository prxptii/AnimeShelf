const express = require("express");
const path = require("path");

const {
    connectProducer,
    sendAnimeEvent
} = require("./kafka/producer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

let animeList = [];
// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

// GET all anime
app.get("/api/anime", (req, res) => {
    res.json(animeList);
});

// ADD anime
app.post("/api/anime", async (req, res) => {
    const { name, status, rating } = req.body;

    if (!name) {
        return res.status(400).json({
            error: "Anime name is required"
        });
    }

    const newAnime = {
        id: Date.now(),
        name,
        status,
        rating
    };

    animeList.push(newAnime);

    try {
        await sendAnimeEvent({
            type: "ANIME_ADDED",
            anime: newAnime
        });
    } catch (error) {
        console.error("Failed to send Kafka event:", error);
    }

    res.status(201).json(newAnime);
});

// DELETE anime
app.delete("/api/anime/:id", async (req, res) => {
    const id = Number(req.params.id);

    const anime = animeList.find(anime => anime.id === id);

    if (!anime) {
        return res.status(404).json({
            error: "Anime not found"
        });
    }

    animeList = animeList.filter(anime => anime.id !== id);

    try {
        await sendAnimeEvent({
            type: "ANIME_DELETED",
            anime: anime
        });
    } catch (error) {
        console.error("Failed to send Kafka delete event:", error);
    }

    res.json({
        message: "Anime deleted successfully"
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`AnimeShelf is running at http://localhost:${PORT}`);
    });

    connectProducer(10, 3000).catch(error => {
        console.error("Failed to connect to Kafka producer:", error.message);
    });
}

module.exports = app;