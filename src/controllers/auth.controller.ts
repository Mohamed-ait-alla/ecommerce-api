import type { Request, Response } from "express";
import { sendResponse } from "../utils/apiResponse.js";
import * as authService from "../services/auth.service.js";
import type { AuthenticatedRequest } from "../types/auth.types.js";

const register = async (req: Request, res: Response) => {
    const result = await authService.registerUser(res, req.body);
    sendResponse(res, 201, result, "Account created successfully");
};

const login = async (req: Request, res: Response) => {
    const result = await authService.loginUser(res, req.body);
    sendResponse(res, 200, result, "Logged in successfully");
};

const refreshToken = async (req: Request, res: Response) => {
	const refreshToken = req.cookies.refreshToken;
	const tokens = await authService.refreshUserTokens(res, refreshToken);
	sendResponse(res, 200, tokens, 'Tokens refreshed successfully');
};

const logout = async (req: Request, res: Response) => {
	const refreshToken = req.cookies.refreshToken;
	await authService.logoutUser(res, refreshToken);
	sendResponse(res, 200, undefined, 'Logged out successfully');
};

const me = async (req: AuthenticatedRequest, res: Response) => {
	const user = await authService.getCurrentUser(req.user!.id);
	sendResponse(res, 200, user, undefined);
};

export { register, login, refreshToken, logout, me };
