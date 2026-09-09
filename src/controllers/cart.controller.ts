import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.types";
import { sendResponse } from "../utils/apiResponse";
import * as cartService from "../services/cart.service";

const getCart = async (req: AuthenticatedRequest, res: Response) => {
    const cart = await cartService.getCart(req.user!.id);
    sendResponse(res, 200, cart);
};

const addItem = async (req: AuthenticatedRequest, res: Response) => {
    const cart = await cartService.addItemToCart(req.user!.id, req.body);
    sendResponse(res, 201, cart, 'Item added to cart');
};

const updateItem = async (req: AuthenticatedRequest, res: Response) => {
    const cart = await cartService.updateCartItem(
        req.user!.id,
        req.params.productId as string,
        req.body,
    );
    sendResponse(res, 200, cart, 'Cart item updated');
};

export { getCart, addItem, updateItem };
