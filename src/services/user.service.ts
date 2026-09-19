import type { ListUsersQuery } from "../validators/admin.validator.js";
import { prisma } from "../config/db.js";
import { AppError } from "../utils/AppError.js";

const userSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    role: true,
    isActive: true,
    createdAt: true,
} as const;

export const listUsers = async (query: ListUsersQuery) => {
    const { page, limit, isActive } = query;

    // building where condition
    const where = {
        role: 'USER' as const,
        ...(isActive !== undefined && { isActive }),
    };

    // fetching users with pagination & filtering
    const [items, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: userSelect,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.user.count({ where }),
    ]);

    return {
        items,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    // check for user role
    if (user.role === 'ADMIN') {
        throw new AppError('Cannot change the status of an admin account', 403);
    }

	// update user status & return results
    return await prisma.user.update({
        where: { id: userId },
        data: { isActive },
        select: userSelect,
    });
};
