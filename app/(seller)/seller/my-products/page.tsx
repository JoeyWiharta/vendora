
export const instant = false;

import SellerMainWrapper from "../_components/_layout/SellerMainWrapper";
import ProductListView from "../_components/_common/ProductListView";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

const MyProductsPage = () => {
    return (
        <SellerMainWrapper
            title="My Products"
            description="Manage the products you sell."
            action={
                <Button
                    size="lg"
                    render={
                        <Link href="/seller/my-products/add" />
                    }
                    nativeButton={false}>
                    <Plus className="size-4" />
                    Add Product
                </Button>
            }
        >
            <ProductListView />
        </SellerMainWrapper>
    );
};

export default MyProductsPage;