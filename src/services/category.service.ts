import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";

export const listCategories = async () => {
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
    });
	if (categories.length < 1) {
		throw new AppError('No category found at the moment', 404);
	}

    return categories;
};
