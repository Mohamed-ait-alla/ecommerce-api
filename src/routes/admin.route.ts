import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    listOrdersQuerySchema,
    updateOrderStatusSchema,
} from "../validators/order.validator.js";
import {
    listUsersQuerySchema,
    lowStockQuerySchema,
    updateUserStatusSchema,
} from "../validators/admin.validator.js";
import * as orderController from "../controllers/order.controller.js";
import * as dashboardController from "../controllers/dashboard.controller.js";
import * as productController from "../controllers/product.controller.js";
import * as userController from "../controllers/user.controller.js";

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

// users
router.get('/users', validate(listUsersQuerySchema), userController.listUsers);
router.patch(
    '/users/:id/status',
    validate(updateUserStatusSchema),
    userController.updateUserStatus,
);

export default router;
