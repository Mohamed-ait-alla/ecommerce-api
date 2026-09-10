import { prisma } from "../config/db";

export const listAddresses = async (userId: string) => {
    return await prisma.address.findMany({
        where: { userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
};
