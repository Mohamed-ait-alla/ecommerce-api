import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
    checkoutSchema,
    listOrdersQuerySchema,
} from "../validators/order.validator";
import * as orderController from "../controllers/order.controller";

const router = Router();

router.use(requireAuth);

router.post('/checkout', validate(checkoutSchema), orderController.checkout);
router.get('/', validate(listOrdersQuerySchema), orderController.listMyOrders);

export default router;
