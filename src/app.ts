import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import productRoutes from "./routes/product.route";
import categoryRoutes from "./routes/category.route";
import cartRoutes from "./routes/cart.route";
import addressRoutes from "./routes/address.route";
import orderRoutes from "./routes/order.route";
import webhookRoutes from "./routes/webhook.route";
import adminRoutes from "./routes/admin.route";
import { env } from "./validators/env.validator.js";
import { errorHandler } from "./middlewares/error.middleware";
import { connectDB, disconnectDB } from "./config/db";

const app = express();

// middlewares
app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }), webhookRoutes) // Stripe needs the RAW request body to verify the webhook signature
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors());

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/health', (req, res) => {
	res.send("server health check: OK");
});

app.use(errorHandler)

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
