import { prisma } from "../config/db";
import { Prisma } from "../generated/prisma/client";
import { AppError } from "../utils/AppError";
import { slugify } from "../utils/slugify";
import type { UpdateCategoryInput } from "../validators/category.validator";

const generateUniqueSlug = async (name: string): Promise<string> => {
    const base = slugify(name);
    let slug = base;
    let counter = 1;

    while (await prisma.category.findUnique({ where: { slug } })) {
        slug = `${base}-${counter}`;
        counter++;
    }

    return slug;
};

export const listCategories = async () => {
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
    });
    if (categories.length < 1) {
        throw new AppError("No category found at the moment", 404);
    }

    return categories;
};

export const createCategory = async (input: Prisma.CategoryCreateInput) => {
    const slug = await generateUniqueSlug(input.name);

    return await prisma.category.create({ data: { ...input, slug } });
};

export const updateCategory = async (categoryId: string, input: Prisma.CategoryUpdateInput) => {
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
    });
    if (!category) {
        throw new AppError("Category not found", 404);
    }

    // update slug if name property will be update
    if (input.name) {
        const newSlug = await generateUniqueSlug(input.name as string);
        input.slug = newSlug;
    }

    return await prisma.category.update({
        where: { id: categoryId },
        data: { ...input },
    });
};

export const deleteCategory = async (categoryId: string) => {
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { products: { take: 1 } },
    });
    if (!category) {
        throw new AppError("Category not found", 404);
    }

	// check if a category still has products
    if (category.products.length > 0) {
        throw new AppError(
            "Cannot delete a category that still has products. Reassign them first.",
            409,
        );
    }

    await prisma.category.delete({ where: { id: categoryId } });
};
