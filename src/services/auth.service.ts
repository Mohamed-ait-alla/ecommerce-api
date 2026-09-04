import bcrypt from "bcryptjs";
import { env } from "../validators/env.validator";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import { issueTokenPair, rotateTokens } from "./token.service";
import type { RegisterInput, loginInput } from "../validators/auth.validator";

const registerUser = async (input: RegisterInput) => {
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

    return { ...tokens, userId: user.id };
};

const loginUser = async (input: loginInput) => {
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

    return { ...tokens, userId: user.id };
};

const refreshUserTokens = async (refreshToken: string) => {
	try {
		return await rotateTokens(refreshToken);
	} catch (error) {
		throw new AppError('Invalid or expired refresh token', 401);
	}
}

export { registerUser, loginUser, refreshUserTokens };
