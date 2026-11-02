import type { UserRole } from "../_types/authTypes";

export const authPath = (role: UserRole) => role === "seller" ? "/seller/product-list" : "/customer/dashboard";