import type { Request, Response } from "express";
import type { ListUsersQuery } from "../validators/admin.validator";
import { sendResponse } from "../utils/apiResponse";
import * as userService from "../services/user.service";

const listUsers = async (req: Request, res: Response) => {
    const users = await userService.listUsers(
        req.query as unknown as ListUsersQuery,
    );
    sendResponse(res, 200, users);
};

const updateUserStatus = async (req: Request, res: Response) => {
    const updatedUser = await userService.updateUserStatus(
        req.params.id as string,
        req.body.isActive,
    );
    sendResponse(res, 200, updatedUser, 'User status updated');
};

export { listUsers, updateUserStatus };
