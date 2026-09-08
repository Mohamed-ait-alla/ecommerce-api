import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import * as cartController from "../controllers/cart.controller";

const router = Router();

// only authenticated users
router.use(requireAuth);

router.get('/', cartController.getCart);

export default router;
