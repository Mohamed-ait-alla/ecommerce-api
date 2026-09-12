import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.types";
import { sendResponse } from "../utils/apiResponse";
import * as orderService from "../services/order.service";

const checkout = async (req: AuthenticatedRequest, res: Response) => {
    const order = await orderService.checkout(req.user!.id, req.body.addressId);
    sendResponse(
        res,
        201,
        order,
        'Order created — complete payment using the returned client secret',
    );
};

export { checkout };
