import type { ListUsersQuery } from "../validators/admin.validator";
import { prisma } from "../config/db";

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
