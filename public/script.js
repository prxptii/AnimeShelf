async function loadAnime() {
    const response = await fetch("/api/anime");
    const animeList = await response.json();

    displayAnime(animeList);
}

async function loadStats() {
    try {
        const response = await fetch("http://localhost:4000/stats");
        const stats = await response.json();

        document.getElementById("totalAdded").textContent = stats.totalAdded;
        document.getElementById("watchingCount").textContent = stats.watching;
        document.getElementById("completedCount").textContent = stats.completed;
    } catch (error) {
        console.error("Failed to load statistics:", error);
    }
}

async function addAnime() {
    const name = document.getElementById("animeName").value;
    const status = document.getElementById("animeStatus").value;
    const rating = document.getElementById("animeRating").value;

    if (!name) {
        alert("Please enter an anime name!");
        return;
    }

    const response = await fetch("/api/anime", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            status: status,
            rating: rating
        })
    });

    if (response.ok) {
        document.getElementById("animeName").value = "";
        document.getElementById("animeRating").value = "";

        loadAnime();

        // Give Kafka and the statistics consumer
        // a moment to process the event.
        setTimeout(() => {
            loadStats();
        }, 1000);
    }
}

function displayAnime(animeList) {
    const container = document.getElementById("animeList");

    container.innerHTML = "";

    animeList.forEach(anime => {
        const card = document.createElement("div");

        card.className = "anime-card";

        card.innerHTML = `
            <h3>🌸 ${anime.name}</h3>
            <p>Status: ${anime.status}</p>
            <p>⭐ Rating: ${anime.rating || "Not rated"}/10</p>

            <button
                class="delete-btn"
                onclick="deleteAnime(${anime.id})"
            >
                Delete
            </button>
        `;

        container.appendChild(card);
    });
}

async function deleteAnime(id) {
    await fetch(`/api/anime/${id}`, {
        method: "DELETE"
    });

    loadAnime();
    loadStats();
}

// Load data when the page opens
loadAnime();
loadStats();

// Keep statistics updated every 2 seconds
setInterval(loadStats, 2000);