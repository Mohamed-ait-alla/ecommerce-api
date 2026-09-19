import { verifyAccessToken } from "../services/token.service.js";
import { AppError } from "../utils/AppError.js";
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/auth.types.js";
import type { Role } from "../generated/prisma/enums.js";

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

export const requireRole =
    (...allowedRoles: Role[]) =>
    (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError("Authentication required", 401));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new AppError(
                    "You do not have permission to perform this action",
                    403,
                ),
            );
        }
		next();
    };
