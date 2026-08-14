import { Role } from "../generated/prisma/client";

export interface AccessTokenPayload {
    sub: string; // user id
    role: Role;
}

export interface RefreshTokenPayload {
    sub: string;
    tokenId: string;
}
