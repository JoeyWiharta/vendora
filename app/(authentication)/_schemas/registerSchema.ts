import { z } from "zod";

export const registerSchema = z
    .object({
        role: z.enum(["customer", "seller"], { error: "Select account type" }),
        email: z.string().min(1, "Email is required").pipe(z.email("Invalid email format")),
        password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(1, "Confirm password is required"),
    })
    .refine((values) => values.password === values.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });