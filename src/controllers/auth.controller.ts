import type { Request, Response } from "express";
import { sendResponse } from "../utils/apiResponse";
import * as authService from "../services/auth.service";

const register = async (req: Request, res: Response) => {
    const result = await authService.registerUser(req.body);
    sendResponse(res, 201, result, "Account created successfully");
};

const login = async (req: Request, res: Response) => {
    const result = await authService.loginUser(req.body);
    sendResponse(res, 200, result, "Logged in successfully");
};

const refreshToken = async (req: Request, res: Response) => {};

const logout = async (req: Request, res: Response) => {};

const me = async (req: Request, res: Response) => {};

export { register, login, refreshToken, logout, me };
