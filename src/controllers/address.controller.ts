import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.types";
import { sendResponse } from "../utils/apiResponse";
import * as addressService from "../services/address.service";

const listAddresses = async (req: AuthenticatedRequest, res: Response) => {
    const addresses = await addressService.listAddresses(req.user!.id);
    sendResponse(res, 200, addresses);
};

const getAddress = async (req: AuthenticatedRequest, res: Response) => {
    const address = await addressService.getAddressById(
        req.user!.id,
        req.params.id as string,
    );
    sendResponse(res, 200, address);
};

const createAddress = async (req: AuthenticatedRequest, res: Response) => {
    const address = await addressService.createAddress(req.user!.id, req.body);
    sendResponse(res, 201, address, 'Address created successfully');
};

export { listAddresses, getAddress, createAddress };
