import type { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject } from "zod";
import { AppError } from "../utils/AppError";

const updateQuery = (req: Request, value: any) => {
    Object.defineProperty(req, "query", {
        ...Object.getOwnPropertyDescriptor(req, "query"),
        writable: false,
        value,
    });
};

export const validate =
    (schema: ZodObject) =>
    (req: Request, _res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse({ body: req.body, query: req.query });

            if (parsed.body !== undefined) req.body = parsed.body;
            if (parsed.query !== undefined) updateQuery(req, parsed.query);

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const messages = error.issues
                    .map((issue) => issue.message)
                    .join(", ");
                throw new AppError(messages, 400);
            }
            next(error);
        }
    };
