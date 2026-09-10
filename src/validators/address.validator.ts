import { z } from "zod";

export const addressIdParamSchema = z.object({
    params: z.object({ id: z.uuid() }),
});
