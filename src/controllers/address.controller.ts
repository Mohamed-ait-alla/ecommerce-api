import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.types";
import { sendResponse } from "../utils/apiResponse";
import * as addressService from "../services/address.service";

const listAddresses = async (req: AuthenticatedRequest, res: Response) => {
	const addresses = await addressService.listAddresses(req.user!.id);
	sendResponse(res, 200, addresses);
};

export { listAddresses };
