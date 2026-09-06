import { Router } from "express";
import * as productController from "../controllers/products.controller";
import { validate } from "../middlewares/validate.middleware";
import { listProductsQuerySchema, productIdParamSchema } from "../validators/product.validator";

const router = Router();

// public routes
router.get('/', validate(listProductsQuerySchema), productController.listProducts);
router.get('/:id', validate(productIdParamSchema), productController.getProductById);

// admin routes

export default router;
