import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import swaggerUi from "swagger-ui-express";

import { openApiDocument } from "./docs/openapi";
import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import { requestLogger } from "./middlewares/requestLogger.middleware";
import { generalLimiter } from "./middlewares/rateLimiter.middleware";

import authRoutes from "./routes/auth.route";
import productRoutes from "./routes/product.route";
import categoryRoutes from "./routes/category.route";
import cartRoutes from "./routes/cart.route";
import addressRoutes from "./routes/address.route";
import orderRoutes from "./routes/order.route";
import webhookRoutes from "./routes/webhook.route";
import adminRoutes from "./routes/admin.route";

export const app = express();

// Security & performance
app.use(helmet());
app.use(cors());
app.use(compression());

// Request logging
app.use(requestLogger);

// Stripe webhooks
app.use(
    '/api/v1/webhooks',
    express.raw({ type: 'application/json' }),
    webhookRoutes,
);

// Body parsing
app.use(express.json());
app.use(cookieParser());

// Rate limiting (general)
app.use(generalLimiter);

// Health check
app.use('/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'server health check: OK' });
});

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 + centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);
