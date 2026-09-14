import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
    listOrdersQuerySchema,
    updateOrderStatusSchema,
} from "../validators/order.validator";
import { lowStockQuerySchema } from "../validators/admin.validator";
import * as orderController from "../controllers/order.controller";
import * as dashboardController from "../controllers/dashboard.controller";
import * as productController from "../controllers/product.controller";

const router = Router();

// only admin can access these endpoints
router.use(requireAuth, requireRole('ADMIN'));

// dashboard
router.use('/dashboard', dashboardController.getDashboard);

// orders
router.get(
    '/orders',
    validate(listOrdersQuerySchema),
    orderController.listAllOrders,
);
router.patch(
    '/orders/:id/status',
    validate(updateOrderStatusSchema),
    orderController.updateOrderStatus,
);

// inventory
router.get(
    '/products/low-stock',
    validate(lowStockQuerySchema),
    productController.getLowStockProducts,
);

export default router;
