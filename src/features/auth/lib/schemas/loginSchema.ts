import { z } from 'zod/v4'

export const loginSchema = z.object({
    email: z.email({ error: 'Incorrect email address' }),
    password: z.string(),
    rememberMe: z.boolean(),
})

export type LoginInputs = z.infer<typeof loginSchema>