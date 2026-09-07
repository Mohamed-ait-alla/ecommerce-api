import { Router } from "express";
import * as productController from "../controllers/products.controller";
import { validate } from "../middlewares/validate.middleware";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import {
    listProductsQuerySchema,
    productIdParamSchema,
    addProductSchema,
} from "../validators/product.validator";

const router = Router();

// public
router.get('/', validate(listProductsQuerySchema), productController.listProducts);
router.get('/:id', validate(productIdParamSchema), productController.getProductById);

// admin only
router.post(
    '/',
    requireAuth,
    requireRole("ADMIN"),
    validate(addProductSchema),
    productController.addProduct,
);

export default router;
