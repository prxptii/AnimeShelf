const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// Temporary anime data
let animeList = [
    {
        id: 1,
        name: "Frieren",
        status: "Watching",
        rating: 9
    },
    {
        id: 2,
        name: "Death Note",
        status: "Completed",
        rating: 10
    }
];

// GET all anime
app.get("/api/anime", (req, res) => {
    res.json(animeList);
});

// ADD anime
app.post("/api/anime", (req, res) => {
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

    res.status(201).json(newAnime);
});

// DELETE anime
app.delete("/api/anime/:id", (req, res) => {
    const id = Number(req.params.id);

    animeList = animeList.filter(anime => anime.id !== id);

    res.json({
        message: "Anime deleted successfully"
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`AnimeShelf is running at http://localhost:${PORT}`);
    });
}

module.exports = app;