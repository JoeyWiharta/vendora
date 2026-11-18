export const instant = false;

import { History } from "lucide-react";
import SellerMainWrapper from "../_shared/_components/LayoutMainWrapper";

const SellerHistoryListPage = () => {
    return (
        <SellerMainWrapper
            title="History List"
            description="View the history of your sales."
        >
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-20 text-center">
                <History className="size-10 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Coming Soon</h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                    The history list feature isn&apos;t available yet. Check back later.
                </p>
            </div>
        </SellerMainWrapper>
    );
};

export default SellerHistoryListPage;