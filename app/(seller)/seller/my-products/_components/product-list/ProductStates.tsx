import Link from "next/link";
import type { ReactNode } from "react";
import { Package, Plus, RefreshCw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const StateShell = (props: { children: ReactNode }) => (
    <div className="flex min-h-64 flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
        {props.children}
    </div>
);

interface ProductLoadingProps {
    rows: number;
}

export const ProductLoading = (props: ProductLoadingProps) => (
    <div className="rounded-xl border bg-card p-2">
        {Array.from({ length: props.rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="size-12 shrink-0 rounded-lg" />
                <div className="grid flex-1 gap-1.5">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="hidden h-4 w-20 sm:block" />
            </div>
        ))}
    </div>
);

interface ProductErrorProps {
    message: string;
    isFetching: boolean;
    handleRetry: () => void;
}

export const ProductError = (props: ProductErrorProps) => (
    <StateShell>
        <p className="font-medium text-destructive">Failed to load products</p>
        <p className="max-w-sm text-sm text-muted-foreground">{props.message}</p>
        <Button variant="outline" size="sm" onClick={props.handleRetry} disabled={props.isFetching}>
            <RefreshCw className={cn(props.isFetching && "animate-spin")} />
            Retry
        </Button>
    </StateShell>
);

interface ProductEmptyProps {
    addHref: string;
}

export const ProductEmpty = (props: ProductEmptyProps) => (
    <StateShell>
        <Package className="size-10 text-muted-foreground" />
        <div>
            <p className="font-medium">No products yet</p>
            <p className="text-sm text-muted-foreground">Products you add will show up here.</p>
        </div>
        <Button size="sm" nativeButton={false} render={<Link href={props.addHref} />}>
            <Plus />
            Add Product
        </Button>
    </StateShell>
);

interface ProductNoMatchProps {
    handleReset: () => void;
}

export const ProductNoMatch = (props: ProductNoMatchProps) => (
    <StateShell>
        <SearchX className="size-10 text-muted-foreground" />
        <div>
            <p className="font-medium">No products found</p>
            <p className="text-sm text-muted-foreground">No products match your search or filter.</p>
        </div>
        <Button variant="outline" size="sm" onClick={props.handleReset}>
            Clear filters
        </Button>
    </StateShell>
);