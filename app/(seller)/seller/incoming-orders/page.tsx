export const instant = false;

import { ClipboardList } from "lucide-react";
import SellerMainWrapper from "../_shared/_components/LayoutMainWrapper";

const SellerOrderListPage = () => {
    return (
        <SellerMainWrapper
            title="Order List"
            description="Manage the orders from your customers."
        >
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-20 text-center">
                <ClipboardList className="size-10 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Coming Soon</h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                    The order list feature isn&apos;t available yet. Check back later.
                </p>
            </div>
        </SellerMainWrapper>
    );
};

export default SellerOrderListPage;