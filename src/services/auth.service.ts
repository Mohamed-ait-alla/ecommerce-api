import bcrypt from "bcryptjs";
import { env } from "../validators/env.validator";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import { issueTokenPair } from "./token.service";
import { type RegisterInput } from "../validators/auth.validator";

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

export { registerUser };
