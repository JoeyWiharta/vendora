import type { UserRole } from "../_types/authTypes";
import { SELLER_HOME_PATH } from "@/app/(seller)/seller/_constants/SellerSidebarMenu";

export const authPath = (role: UserRole) => role === "seller" ? SELLER_HOME_PATH : "/customer/dashboard";