import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import * as addressController from "../controllers/address.controller";

const router = Router();

router.use(requireAuth);

router.get('/', addressController.listAddresses);

export default router;