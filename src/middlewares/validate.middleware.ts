import type { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject } from "zod";
import { AppError } from "../utils/AppError";

export const validate =
    (schema: ZodObject) =>
    (req: Request, _res: Response, next: NextFunction) => {
        try {
            schema.parse({ body: req.body });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const messages = error.issues
                    .map((issue) => issue.message)
                    .join(', ');
                throw new AppError(messages, 400);
            }
            next(error);
        }
	};
