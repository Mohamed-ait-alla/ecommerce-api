import { prisma } from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { slugify } from "../utils/slugify.js";
import type { Prisma } from "../generated/prisma/client.js";
import type {
    ListProductsQuery,
    AddProductsInput,
    UpdateProductInput,
} from "../validators/product.validator.js";

const generateUniqueSlug = async (name: string): Promise<string> => {
    const base = slugify(name);
    let slug = base;
    let counter = 1;

    while (await prisma.product.findUnique({ where: { slug } })) {
        slug = `${base}-${counter}`;
        counter++;
    }

    return slug;
};

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

export const createProduct = async (input: AddProductsInput) => {
    const category = await prisma.category.findUnique({
        where: { id: input.categoryId },
    });
    if (!category) {
        throw new AppError("Category not found", 404);
    }

    const existingSku = await prisma.product.findUnique({
        where: { sku: input.sku },
    });
    if (existingSku) {
        throw new AppError("A product with this SKU already exists", 409);
    }

    const slug = await generateUniqueSlug(input.name);

    return await prisma.product.create({ data: { ...input, slug } });
};

export const updateProduct = async (productId: string, input: UpdateProductInput) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    if (input.categoryId) {
        const category = await prisma.category.findUnique({
            where: { id: input.categoryId },
        });

        if (!category) {
            throw new AppError("Category not found", 404);
        }
    }

    if (Object.keys(input).length === 0) {
        return product;
    }

    return await prisma.product.update({
        where: { id: productId },
        data: { ...(input as Prisma.ProductUpdateInput) },
    });
};

export const deleteProduct = async (productId: string) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });
    if (!product) {
        throw new AppError("Product not found", 404);
    }

    // soft delete product
    await prisma.product.update({
        where: { id: productId },
        data: { isActive: false },
    });
};

export const adjustStock = async (productId: string, quantity: number) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });
    if (!product) {
        throw new AppError("Product not found", 404);
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
        throw new AppError("Insufficient stock for this adjustment", 400);
    }

    return await prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
    });
};

export const getLowStockProducs = async (threshold: number) => {
    return await prisma.product.findMany({
        where: { isActive: true, stock: { lte: threshold } },
        orderBy: { stock: 'asc' },
        include: { category: { select: { id: true, name: true, slug: true } } },
    });
};
