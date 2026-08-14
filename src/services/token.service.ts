import jwt from "jsonwebtoken";
import ms, { type StringValue } from "ms";
import { env } from "../validators/env.validator";
import type { Role } from "../generated/prisma/enums";
import { prisma } from "../config/db";
import type {
    AccessTokenPayload,
    RefreshTokenPayload,
} from "../types/auth.types";

const generateAccessToken = (payload: AccessTokenPayload): string => {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (payload: RefreshTokenPayload): string => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const issueTokenPair = async (userId: string, role: Role) => {
    // create a token row placeholder to get the tokenId
    const dbToken = await prisma.refreshToken.create({
        data: {
            token: "",
            userId: userId,
            expiredAt: new Date(
                Date.now() + ms(env.JWT_REFRESH_EXPIRES_IN as StringValue),
            ),
        },
    });

    const accessToken = generateAccessToken({ sub: userId, role });
    const refreshToken = generateRefreshToken({
        sub: userId,
        tokenId: dbToken.id,
    });

    // set the refresh token into db
    await prisma.refreshToken.update({
        where: { id: dbToken.id },
        data: { token: refreshToken },
    });

    return { accessToken, refreshToken };
};
