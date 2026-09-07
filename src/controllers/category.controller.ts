import type { Request, Response } from "express";
import * as categoryService from "../services/category.service";
import { sendResponse } from "../utils/apiResponse";

const listCategories = async (_req: Request, res: Response) => {
	const categories = await categoryService.listCategories();
	sendResponse(res, 200, categories);
};

export { listCategories };
