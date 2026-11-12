"use client";

import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

const LayoutHeader = () => {
    return (
        <header className="sticky top-0 z-20 flex h-14 px-4 shrink-0 items-center bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
            <SidebarTrigger className="-ml-1 size-8 rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary" />
            <Button
                variant="ghost"
                size="icon"
                className="ml-auto size-8 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
                aria-label="Notifications"
                onClick={() => toast.info("Notifications coming soon")}
            >
                <Bell className="size-4" />
            </Button>
        </header>
    );
};

export default LayoutHeader;