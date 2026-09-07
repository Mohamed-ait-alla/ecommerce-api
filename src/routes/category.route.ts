import { Router } from "express";
import * as categoryController from "../controllers/category.controller";

const router = Router();

// public
router.get('/', categoryController.listCategories);

// admin only

export default router;