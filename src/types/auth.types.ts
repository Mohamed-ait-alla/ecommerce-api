import type { Request } from "express";
import { Role } from "../generated/prisma/client.js";

export interface AccessTokenPayload {
    sub: string; // user id
    role: Role;
}

export interface RefreshTokenPayload {
    sub: string;
    tokenId: string;
}

export interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		role: Role;
	}
}