import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { listOrdersQuerySchema } from "../validators/order.validator";
import * as orderController from "../controllers/order.controller";

const router = Router();

// only admin can access these endpoints
router.use(requireAuth, requireRole('ADMIN'));

router.get(
    '/orders',
    validate(listOrdersQuerySchema),
    orderController.listAllOrders,
);

export default router;
