const request = require("supertest");
const app = require("../server");

describe("AnimeShelf API", () => {

    test("GET /api/health should return ok status", async () => {
    const response = await request(app)
        .get("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
    });
    
    test("GET /api/anime should return anime list", async () => {
        const response = await request(app)
            .get("/api/anime");

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });


    test("POST /api/anime should add a new anime", async () => {
        const response = await request(app)
            .post("/api/anime")
            .send({
                name: "One Piece",
                status: "Watching",
                rating: 10
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.name).toBe("One Piece");
    });


    test("POST /api/anime should reject missing name", async () => {
        const response = await request(app)
            .post("/api/anime")
            .send({
                status: "Watching",
                rating: 8
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Anime name is required");
    });


    test("DELETE /api/anime/:id should delete an anime", async () => {

        const added = await request(app)
            .post("/api/anime")
            .send({
                name: "Test Anime",
                status: "Watching",
                rating: 7
            });

        const id = added.body.id;

        const response = await request(app)
            .delete(`/api/anime/${id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe(
            "Anime deleted successfully"
        );
    });

});