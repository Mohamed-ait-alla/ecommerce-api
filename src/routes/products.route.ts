import { Router } from "express";
import * as productController from "../controllers/products.controller";
import { validate } from "../middlewares/validate.middleware";
import { listProductsQuerySchema } from "../validators/product.validator";

const router = Router();

// public routes
router.get(
    "/",
    validate(listProductsQuerySchema),
    productController.listProducts,
);

// admin routes

export default router;
