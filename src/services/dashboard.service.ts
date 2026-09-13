import { prisma } from "../config/db";
import type { OrderStatus } from "../generated/prisma/enums";

// paid cases
const PAID_STATUS: OrderStatus[] = ['PAID', 'SHIPPED', 'DELIVERED'];

export const getDashboardStats = async () => {
    const [
        revenueResult,
        ordersByStatus,
        totalUsers,
        totalProducts,
        lowStockCount,
        recentOrders,
    ] = await Promise.all([
        prisma.order.aggregate({
            where: { status: { in: PAID_STATUS } },
            _sum: { total: true },
        }),
        prisma.order.groupBy({
            by: ['status'],
            _count: { _all: true },
        }),
        prisma.user.count({ where: { role: 'USER' } }),
        prisma.product.count({ where: { isActive: true } }),
        prisma.product.count({ where: { isActive: true, stock: { lte: 10 } } }),
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                total: true,
                status: true,
                createdAt: true,
                user: {
                    select: { firstName: true, lastName: true, email: true },
                },
            },
        }),
    ]);

    return {
        totalRevenue: Number(revenueResult._sum.total ?? 0),
        totalOrders: ordersByStatus.reduce((sum, group) => sum + group._count._all, 0),
        ordersBySatus: ordersByStatus.map((group) => ({
            status: group.status,
            count: group._count._all,
        })),
        totalUsers,
        totalProducts,
        lowStockCount,
		recentOrders
    };
};
