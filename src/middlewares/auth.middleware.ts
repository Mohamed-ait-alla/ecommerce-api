import { verifyAccessToken } from "../services/token.service";
import { AppError } from "../utils/AppError";
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/auth.types";

export const requireAuth = (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('Not authorized, No token provided', 401));
    }

    const token = authHeader.split(' ')[1] as string;

    try {
        const payload = verifyAccessToken(token);
        req.user = { id: payload.sub, role: payload.role };
        next();
    } catch {
        next(new AppError('Invalid or expired token', 401));
    }
};
