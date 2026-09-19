import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.types.js";
import { sendResponse } from "../utils/apiResponse.js";
import * as dashboardService from "../services/dashboard.service.js";

const getDashboard = async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await dashboardService.getDashboardStats();
    sendResponse(res, 200, stats);
};

export { getDashboard };
