import { z } from "zod";

const registerSchema = z.object({
    body: z.object({
        firstName: z.string().trim().min(1, 'First name is required').max(50),
        lastName: z.string().trim().min(1, 'Last name is required').max(50),
        email: z.email('Invalid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(
                /[A-Z]/,
                'Password must contain at least one uppercase letter',
            )
            .regex(/[0-9]/, 'Password must contain at least one number'),
    }),
});

const loginSchema = z.object({
	body: z.object({
		email: z.email('Invalid email address'),
		password: z.string().min(1, 'Password is required'),
	})
})

export { registerSchema, loginSchema };
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type loginInput = z.infer<typeof loginSchema>['body'];

