import { Router } from "express";
import * as categoryController from "../controllers/category.controller";
import { validate } from "../middlewares/validate.middleware";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { createCategorySchema } from "../validators/category.validator";

const router = Router();

// public
router.get('/', categoryController.listCategories);

// admin only
router.post(
    "/",
    requireAuth,
    requireRole("ADMIN"),
    validate(createCategorySchema),
    categoryController.createCategory,
);

export default router;
