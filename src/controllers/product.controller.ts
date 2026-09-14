import type { Request, Response } from "express";
import type { ListProductsQuery } from "../validators/product.validator";
import type { LowStockQuery } from "../validators/admin.validator";
import { sendResponse } from "../utils/apiResponse";
import * as productService from "../services/product.service";

const listProducts = async (req: Request, res: Response) => {
    const products = await productService.listProducts(
        req.query as unknown as ListProductsQuery,
    );
    sendResponse(res, 200, products);
};

const getProductById = async (req: Request, res: Response) => {
    const product = await productService.getProduct(req.params.id as string);
    sendResponse(res, 200, product);
};

const addProduct = async (req: Request, res: Response) => {
    const product = await productService.createProduct(req.body);
    sendResponse(res, 201, product, 'Product created successfully');
};

const updateProduct = async (req: Request, res: Response) => {
    const updatedProduct = await productService.updateProduct(
        req.params.id as string,
        req.body,
    );
    sendResponse(res, 200, updatedProduct, 'Product updated successfully');
};

const deleteProduct = async (req: Request, res: Response) => {
    await productService.deleteProduct(req.params.id as string);
    sendResponse(res, 200, undefined, 'Product deleted successfully');
};

const adjustStock = async (req: Request, res: Response) => {
    const product = await productService.adjustStock(
        req.params.id as string,
        req.body.quantity,
    );
    sendResponse(res, 200, product, 'Stock adjusted successfully');
};

const getLowStockProducts = async (req: Request, res: Response) => {
    const { threshold } = req.query as unknown as LowStockQuery;
    const products = await productService.getLowStockProducs(threshold);
    sendResponse(res, 200, products);
};

export {
    listProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    getLowStockProducts,
};
