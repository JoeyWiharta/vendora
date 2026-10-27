import type { z } from "zod";
import type { registerSchema } from "../_schemas/registerSchema";
import type { UserRole } from "./authTypes";

export type RegisterFormValues = z.infer<typeof registerSchema>;

export interface RegisterPayload {
    email: string;
    password: string;
    role: UserRole;
}