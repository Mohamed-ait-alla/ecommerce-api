import jwt from "jsonwebtoken";
import ms, { type StringValue } from "ms";
import { env } from "../validators/env.validator";
import { prisma } from "../config/db";
import type { Response } from "express";
import type { Role } from "../generated/prisma/enums";
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

export const verifyAccessToken = (token: string): AccessTokenPayload => {
	return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

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

export const rotateTokens = async (res: Response, oldRefreshToken: string) => {
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

    const { accessToken, refreshToken } = await issueTokenPair(
        user.id,
        user.role,
    );

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/api/v1/auth/refresh",
    });

    return { accessToken };
};

export const revokeRefreshToken = async (res: Response, token: string) => {
    await prisma.refreshToken.updateMany({
        where: { token },
        data: { revoked: true },
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/v1/auth/refresh",
    });
};
