import type { z } from "zod";
import type { createAddToCartSchema } from "../_schema/addToCartSchema";

export type AddToCartFormValues = z.infer<ReturnType<typeof createAddToCartSchema>>;