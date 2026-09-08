import type { Request, Response } from "express";
import * as categoryService from "../services/category.service";
import { sendResponse } from "../utils/apiResponse";

const listCategories = async (_req: Request, res: Response) => {
    const categories = await categoryService.listCategories();
    sendResponse(res, 200, categories);
};

const createCategory = async (req: Request, res: Response) => {
    const category = await categoryService.createCategory(req.body);
    sendResponse(res, 201, category, 'Category created successfully');
};

const updateCategory = async (req: Request, res: Response) => {
    const updatedCategory = await categoryService.updateCategory(
        req.params.id as string,
        req.body,
    );
    sendResponse(res, 200, updatedCategory, 'Category updated successfully');
};

export { listCategories, createCategory, updateCategory };
