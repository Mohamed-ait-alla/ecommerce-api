import { prisma } from "../config/db";
import { Prisma } from "../generated/prisma/client";
import { AppError } from "../utils/AppError";
import { slugify } from "../utils/slugify";

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
