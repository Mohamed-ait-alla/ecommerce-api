import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.types";
import type { ListOrdersQuery } from "../validators/order.validator";
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

const listMyOrders = async (req: AuthenticatedRequest, res: Response) => {
    const orders = await orderService.listUserOrders(
        req.user!.id,
        req.query as unknown as ListOrdersQuery,
    );
    sendResponse(res, 200, orders);
};

const getMyOrder = async (req: AuthenticatedRequest, res: Response) => {
    const order = await orderService.getUserOrderById(
        req.user!.id,
        req.params.id as string,
    );
    sendResponse(res, 200, order);
};

// admin controllers
const listAllOrders = async (req: AuthenticatedRequest, res: Response) => {
    const orders = await orderService.listAllOrders(
        req.query as unknown as ListOrdersQuery,
    );
    sendResponse(res, 200, orders);
};

export { checkout, listMyOrders, getMyOrder, listAllOrders };
