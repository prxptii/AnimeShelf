async function loadAnime() {
    const response = await fetch("/api/anime");
    const animeList = await response.json();

    displayAnime(animeList);
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
}

loadAnime();