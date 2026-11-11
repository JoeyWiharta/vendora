import type { UserRole } from "../_types/authTypes";
import { SELLER_HOME_PATH } from "@/app/(seller)/seller/_constants/SellerSidebarMenu";
import { CUSTOMER_HOME_PATH } from "@/app/(customer)/customer/_constants/CustomerNavMenu";

export const authPath = (role: UserRole) => role === "seller" ? SELLER_HOME_PATH : CUSTOMER_HOME_PATH;