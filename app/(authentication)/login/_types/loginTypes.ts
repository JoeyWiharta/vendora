import type { z } from "zod";
import type { loginSchema } from "../_schemas/loginSchema";

export type LoginFormValues = z.infer<typeof loginSchema>;

export interface LoginPayload {
    email: string;
    password: string;
    rememberMe: boolean;
}