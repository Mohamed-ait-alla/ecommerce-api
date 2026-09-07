import type { Request, Response } from "express";
import * as productService from "../services/product.service";
import { sendResponse } from "../utils/apiResponse";
import type { ListProductsQuery } from "../validators/product.validator";

const listProducts = async (req: Request, res: Response) => {
	const products = await productService.listProducts(req.query as unknown as ListProductsQuery);
	sendResponse(res, 200, products);
};

const getProductById = async (req: Request, res: Response) => {
	console.log("the id parameter is: ", req.params.id);
	const product = await productService.getProduct(req.params.id as string);
	sendResponse(res, 200, product);
};

const addProduct = async (req: Request, res: Response) => {
	const product = await productService.createProduct(req.body);
	sendResponse(res, 201, product, 'Product created successfully');
};

const updateProduct = async (req: Request, res: Response) => {};

const deleteProduct = async (req: Request, res: Response) => {};

export {
    listProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
};
