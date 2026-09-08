import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { addCartItemSchema } from "../validators/cart.validator";
import * as cartController from "../controllers/cart.controller";

const router = Router();

// only authenticated users
router.use(requireAuth);

router.get('/', cartController.getCart);
router.post('/items', validate(addCartItemSchema), cartController.addItem);

export default router;
