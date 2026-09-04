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

const verifyRefreshToken = (token: string): RefreshTokenPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
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

export const rotateTokens = async (oldRefreshToken: string) => {
    const payload = verifyRefreshToken(oldRefreshToken);

    const stored = await prisma.refreshToken.findUnique({
        where: { id: payload.tokenId },
    });

    // verify the stored token
    if (!stored || stored.revoked || stored.token !== oldRefreshToken) {
        throw new Error("Invalid refresh token");
    }

    if (stored.expiredAt < new Date()) {
        throw new Error("Refresh token expired");
    }

    // update the stored token's status & issue new ones
    await prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revoked: true },
    });

    const user = await prisma.user.findUniqueOrThrow({
        where: { id: payload.sub },
    });

	return issueTokenPair(user.id, user.role);
};
