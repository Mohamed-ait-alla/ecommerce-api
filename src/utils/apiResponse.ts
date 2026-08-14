import { type Response } from "express";

interface ApiResponseShape<T> {
    success: boolean;
    message?: string;
    data?: T;
}

export const sendResponse = <T>(
    res: Response,
    statusCode: number,
    data?: T,
    message?: string,
): void => {
    const body: ApiResponseShape<T> = {
        success: statusCode < 400,
        ...(message && { message }),
        ...(data != undefined && { data }),
    };

    res.status(statusCode).json(body);
};
