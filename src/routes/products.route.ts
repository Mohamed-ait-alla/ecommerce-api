import { Router } from "express";
import * as productController from "../controllers/products.controller";
import { validate } from "../middlewares/validate.middleware";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import {
    listProductsQuerySchema,
    productIdParamSchema,
    addProductSchema,
    updateProductSchema,
    adjustStockSchema,
} from "../validators/product.validator";

const router = Router();

// public
router.get('/', validate(listProductsQuerySchema), productController.listProducts);
router.get('/:id', validate(productIdParamSchema), productController.getProductById);

// admin only
router.post(
    '/',
    requireAuth,
    requireRole('ADMIN'),
    validate(addProductSchema),
    productController.addProduct,
);

router.put(
    '/:id',
    requireAuth,
    requireRole('ADMIN'),
    validate(updateProductSchema),
    productController.updateProduct,
);

router.delete(
    '/:id',
    requireAuth,
    requireRole('ADMIN'),
    validate(productIdParamSchema),
    productController.deleteProduct,
);

router.patch(
    '/:id/inventory',
    requireAuth,
    requireRole('ADMIN'),
    validate(adjustStockSchema),
    productController.adjustStock,
);

export default router;
