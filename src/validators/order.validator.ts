import { z } from "zod";

export const checkoutSchema = z.object({
    body: z.object({ addressId: z.uuid("Invalid address id") }),
});
