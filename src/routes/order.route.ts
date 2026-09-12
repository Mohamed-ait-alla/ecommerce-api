import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { checkoutSchema } from "../validators/order.validator";
import * as orderController from "../controllers/order.controller";

const router = Router();

router.use(requireAuth);

router.post('/checkout', validate(checkoutSchema), orderController.checkout);

export default router;
