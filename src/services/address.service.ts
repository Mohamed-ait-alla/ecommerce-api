import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";

export const listAddresses = async (userId: string) => {
    return await prisma.address.findMany({
        where: { userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
};

export const getAddressById = async (userId: string, addressId: string) => {
    const address = await prisma.address.findFirst({
        where: { id: addressId, userId },
    });

    if (!address) {
        throw new AppError("Address not found", 404);
    }

    return address;
};
