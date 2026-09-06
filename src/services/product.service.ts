import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import type { Prisma } from "../generated/prisma/client";
import type { ListProductsQuery } from "../validators/product.validator";

export const listProducts = async (query: ListProductsQuery) => {
    const { page, limit, search, category, minPrice, maxPrice, sort } = query;

    // building where statement
    const where: Prisma.ProductWhereInput = {
        isActive: true,
        ...(search && { name: { contains: search, mode: "insensitive" } }),
        ...(category && { category: { slug: category } }),
        ...((minPrice !== undefined || maxPrice !== undefined) && {
            price: {
                ...(minPrice !== undefined && { gte: minPrice }),
                ...(maxPrice !== undefined && { lte: maxPrice }),
            },
        }),
    };

    const [field, direction] = sort.startsWith("-")
        ? [sort.slice(1), "desc"]
        : [sort, "asc"];

    const [items, total] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy: { [field]: direction },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
        }),
        prisma.product.count({ where }),
    ]);

    if (items.length < 1) {
        throw new AppError("No items found at the moment", 404);
    }

    return {
        items,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};

export const getProduct = async (productId: string) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { category: { select: { id: true, name: true, slug: true } } },
    });

    if (!product || !product.isActive) {
        throw new AppError("Product not found", 404);
    }

    return product;
};
