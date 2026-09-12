import { z } from "zod";
import { OrderStatus } from "../generated/prisma/enums";

export const checkoutSchema = z.object({
    body: z.object({ addressId: z.uuid("Invalid address id") }),
});

export const listOrdersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(15).default(5),
    status: z.enum(OrderStatus).optional(),
  }),
});

export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>['query'];