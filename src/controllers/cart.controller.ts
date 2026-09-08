import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.types";
import * as cartService from "../services/cart.service";
import { sendResponse } from "../utils/apiResponse";

const getCart = async (req: AuthenticatedRequest, res: Response) => {
    const cart = await cartService.getCart(req.user!.id);
    sendResponse(res, 200, cart);
};

export { getCart };
