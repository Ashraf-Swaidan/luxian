import { z } from "zod"

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    "Must include upper, lower, number, and special (@$!%*?&)",
  )

export const loginSchema = z.object({
  email: z.email("Provide a valid email"),
  password: passwordSchema,
})

export const registerSchema = z.object({
  email: z.email("Provide a valid email"),
  password: passwordSchema,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
