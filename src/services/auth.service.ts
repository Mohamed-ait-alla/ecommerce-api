import bcrypt from "bcryptjs";
import { env } from "../validators/env.validator";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import {
    issueTokenPair,
    revokeRefreshToken,
    rotateTokens,
} from "./token.service";
import type { Response } from "express";
import type { RegisterInput, loginInput } from "../validators/auth.validator";

const registerUser = async (res: Response, input: RegisterInput) => {
    const existing = await prisma.user.findUnique({
        where: { email: input.email },
    });

    if (existing) {
        throw new AppError("An account with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(
        input.password,
        env.BCRYPT_SALT_ROUNDS,
    );

    // create new user
    const user = await prisma.user.create({
        data: {
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            password: hashedPassword,
        },
    });

    // attach an empty cart to every new user
    await prisma.cart.create({
        data: {
            userId: user.id,
        },
    });

    const tokens = await issueTokenPair(user.id, user.role);

    const { accessToken, refreshToken } = tokens;

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/api/v1/auth/refresh",
    });

    return { accessToken, userId: user.id };
};

const loginUser = async (res: Response, input: loginInput) => {
    const user = await prisma.user.findUnique({
        where: { email: input.email },
    });

    if (!user || !user.isActive) {
        throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
    }

    const tokens = await issueTokenPair(user.id, user.role);

    const { accessToken, refreshToken } = tokens;

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/api/v1/auth/refresh",
    });

    return { accessToken, userId: user.id };
};

const refreshUserTokens = async (res: Response, refreshToken: string) => {
    try {
        return await rotateTokens(res, refreshToken);
    } catch (error) {
        throw new AppError("Invalid or expired refresh token", 401);
    }
};

const logoutUser = async (res: Response, refreshToken: string) => {
    await revokeRefreshToken(res, refreshToken);
};

const getCurrentUser = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user;
};

export {
    registerUser,
    loginUser,
    refreshUserTokens,
    logoutUser,
    getCurrentUser,
};
