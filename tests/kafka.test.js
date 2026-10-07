const { connectProducer, sendAnimeEvent, disconnectProducer } = require("../kafka/producer");
const { startConsumer, stopConsumer } = require("../kafka/consumer");
const { startStatisticsConsumer, stopStatisticsConsumer, getStats } = require("../kafka/statistics");

jest.mock("kafkajs", () => {
    const mockProducer = {
        connect: jest.fn().mockResolvedValue(),
        send: jest.fn().mockResolvedValue(),
        disconnect: jest.fn().mockResolvedValue()
    };

    let registeredEachMessage = null;

    const mockConsumer = {
        connect: jest.fn().mockResolvedValue(),
        subscribe: jest.fn().mockResolvedValue(),
        run: jest.fn().mockImplementation(async ({ eachMessage }) => {
            registeredEachMessage = eachMessage;
        }),
        disconnect: jest.fn().mockResolvedValue(),
        __triggerMessage: async (msg) => {
            if (registeredEachMessage) {
                await registeredEachMessage(msg);
            }
        }
    };

    return {
        Kafka: jest.fn().mockImplementation(() => ({
            producer: () => mockProducer,
            consumer: () => mockConsumer,
            __mockProducer: mockProducer,
            __mockConsumer: mockConsumer
        }))
    };
});

describe("Kafka Producer, Consumer, and Statistics Error Handling", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Producer should connect and send events successfully", async () => {
        const connected = await connectProducer(1, 10);
        expect(connected).toBe(true);

        const sent = await sendAnimeEvent({ type: "ANIME_ADDED", anime: { name: "Naruto" } });
        expect(sent).toBe(true);

        await disconnectProducer();
    });

    test("Producer should handle connection retries and failures gracefully", async () => {
        const { Kafka } = require("kafkajs");
        const kafkaInstance = new Kafka();
        kafkaInstance.__mockProducer.connect.mockRejectedValueOnce(new Error("Broker unavailable"));

        const connected = await connectProducer(2, 10);
        expect(connected).toBe(true);
    });

    test("Consumer should start, receive events without crashing on malformed JSON", async () => {
        const { Kafka } = require("kafkajs");
        const kafkaInstance = new Kafka();

        await startConsumer(1, 10);

        // Trigger valid message
        await kafkaInstance.__mockConsumer.__triggerMessage({
            message: { value: Buffer.from(JSON.stringify({ type: "TEST_EVENT" })) }
        });

        // Trigger malformed JSON message (should not throw)
        await expect(kafkaInstance.__mockConsumer.__triggerMessage({
            message: { value: Buffer.from("invalid-json{") }
        })).resolves.not.toThrow();

        // Trigger empty message (should not throw)
        await expect(kafkaInstance.__mockConsumer.__triggerMessage({
            message: null
        })).resolves.not.toThrow();

        await stopConsumer();
    });

    test("Statistics consumer should update counters and prevent negative counts", async () => {
        const { Kafka } = require("kafkajs");
        const kafkaInstance = new Kafka();

        await startStatisticsConsumer(1, 10);

        // Trigger ANIME_ADDED event
        await kafkaInstance.__mockConsumer.__triggerMessage({
            message: {
                value: Buffer.from(JSON.stringify({
                    type: "ANIME_ADDED",
                    anime: { name: "Attack on Titan", status: "Watching" }
                }))
            }
        });

        let stats = getStats();
        expect(stats.totalAdded).toBe(1);
        expect(stats.watching).toBe(1);

        // Trigger ANIME_DELETED event
        await kafkaInstance.__mockConsumer.__triggerMessage({
            message: {
                value: Buffer.from(JSON.stringify({
                    type: "ANIME_DELETED",
                    anime: { name: "Attack on Titan", status: "Watching" }
                }))
            }
        });

        stats = getStats();
        expect(stats.totalAdded).toBe(0);
        expect(stats.watching).toBe(0);

        // Deleting when count is 0 should remain at 0 (no negative numbers)
        await kafkaInstance.__mockConsumer.__triggerMessage({
            message: {
                value: Buffer.from(JSON.stringify({
                    type: "ANIME_DELETED",
                    anime: { name: "Unknown", status: "Watching" }
                }))
            }
        });

        stats = getStats();
        expect(stats.totalAdded).toBe(0);
        expect(stats.watching).toBe(0);

        await stopStatisticsConsumer();
    });
});
