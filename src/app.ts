import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import authRoutes from "./routes/auth.route";
import productRoutes from "./routes/product.route";
import categoryRoutes from "./routes/category.route";
import cartRoutes from "./routes/cart.route";
import addressRoutes from "./routes/address.route";
import orderRoutes from "./routes/order.route";
import webhookRoutes from "./routes/webhook.route";
import adminRoutes from "./routes/admin.route";
import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import { requestLogger } from "./middlewares/requestLogger.middleware";
import { generalLimiter } from "./middlewares/rateLimiter.middleware";


export const app = express();

// middlewares
app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }), webhookRoutes) // Stripe needs the RAW request body to verify the webhook signature
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(requestLogger);
app.use(generalLimiter);

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

app.use(notFoundHandler);
app.use(errorHandler)

