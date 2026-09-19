import { prisma } from "../config/db.js";
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../utils/AppError.js";
import type {
    CreateAddressInput,
    UpdateAddressInput,
} from "../validators/address.validator.js";

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

export const createAddress = async (userId: string, input: CreateAddressInput) => {
    const existingCount = await prisma.address.count({ where: { userId } });
    const shouldBeDefault = input.isDefault || existingCount === 0;

    return await prisma.$transaction(async (tx) => {
        if (shouldBeDefault) {
            await tx.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }

        return await tx.address.create({
            data: { ...input, userId, isDefault: shouldBeDefault },
        });
    });
};

export const updateAddress = async (userId: string, addressId: string, input: UpdateAddressInput) => {
    const address = await prisma.address.findFirst({
        where: { id: addressId, userId },
    });
    if (!address) {
        throw new AppError("Address not found", 404);
    }

    return await prisma.$transaction(async (tx) => {
        if (input.isDefault) {
            await tx.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }

        return await tx.address.update({
            where: { id: addressId },
            data: input as Prisma.AddressUpdateInput,
        });
    });
};

export const deleteAddress = async (userId: string, addressId: string) => {
    const address = await prisma.address.findFirst({
        where: { id: addressId, userId },
    });
    if (!address) {
        throw new AppError("Address not found", 404);
    }

    // delete address, in case of the deleted address was the default one, set
    // the most recently created one as the default one.
    await prisma.$transaction(async (tx) => {
        await prisma.address.delete({ where: { id: addressId } });

        if (address.isDefault) {
            const nextDefault = await prisma.address.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });

            if (nextDefault) {
                await prisma.address.update({
                    where: { id: nextDefault.id },
                    data: { isDefault: true },
                });
            }
        }
    });
};
