import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.types";
import { sendResponse } from "../utils/apiResponse";
import * as dashboardService from "../services/dashboard.service";

const getDashboard = async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await dashboardService.getDashboardStats();
    sendResponse(res, 200, stats);
};

export { getDashboard };
