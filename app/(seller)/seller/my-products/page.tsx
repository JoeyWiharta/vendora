export const instant = false;

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import SellerMainWrapper from "../_shared/_components/LayoutMainWrapper";
import ProductView from "./_components/product-list/ProductView";

const SellerProductPage = () => {
    return (
        <SellerMainWrapper
            title="My Products"
            description="Manage the products you sell."
            action={
                <Button size="lg" nativeButton={false} render={<Link href="/seller/my-products/add" />}>
                    <Plus className="size-4" />
                    Add Product
                </Button>
            }
        >
            <ProductView />
        </SellerMainWrapper>
    );
};

export default SellerProductPage;