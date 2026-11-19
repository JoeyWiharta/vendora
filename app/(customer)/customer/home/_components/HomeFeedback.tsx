import { AlertCircle, Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

type HomeErrorProps = {
    message: string;
    onRetry: () => void;
    retrying: boolean;
};

export const HomeError = ({ message, onRetry, retrying }: HomeErrorProps) => (
    <Empty className="min-h-64 flex-1 rounded-2xl border border-dashed bg-card">
        <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
                <AlertCircle />
            </EmptyMedia>
            <EmptyTitle>Failed to load products</EmptyTitle>
            <EmptyDescription>{message}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
            <Button variant="outline" size="sm" onClick={onRetry} disabled={retrying}>
                <RefreshCw className={cn(retrying && "animate-spin")} />
                {retrying ? "Retrying..." : "Retry"}
            </Button>
        </EmptyContent>
    </Empty>
);

export const HomeEmpty = () => (
    <Empty className="min-h-64 flex-1 rounded-2xl border border-dashed bg-card">
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <Package />
            </EmptyMedia>
            <EmptyTitle>No products available yet</EmptyTitle>
            <EmptyDescription>Check back soon, new products are added regularly.</EmptyDescription>
        </EmptyHeader>
    </Empty>
);