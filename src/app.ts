import express from "express";
import { env } from "./validators/env.validator.js";
import { connectDB, disconnectDB } from "./config/db";

const app = express();

app.use("/health", (req, res) => {
    res.send("server health check");
});

connectDB();

const server = app.listen(env.PORT, () => {
    console.log(`server running on port ${env.PORT}...`);
});

// Handle unhandled promise rejections (e.g., database connection errors)
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    server.close(async () => {
        await disconnectDB();
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception:", err);
    await disconnectDB();
    process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
});
