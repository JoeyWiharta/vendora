// app/(seller)/_components/sidebar/SellerSidebarFooter.tsx
"use client";

import Link from "next/link";
import { useTheme } from "@wrksz/themes/client";
import { ChevronsUpDown, LogOut, Moon, Sun, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarFooter,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { useLogout } from "@/app/(authentication)/_hooks/useLogout";
import { useAuthStore } from "@/store/authStore";
import { cn } from "cn";

const SellerSidebarFooter = () => {
    const { state, isMobile } = useSidebar();
    const isCollapsed = state === "collapsed";

    const { resolvedTheme, setTheme } = useTheme();
    const email = useAuthStore((s) => s.user?.email) ?? "";
    const { mutate: logout, isPending } = useLogout();

    const name = email.split("@")[0] || "Seller";

    const userInfo = (
        <>
            <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                    {name.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs text-sidebar-foreground/60">{email}</span>
            </div>
        </>
    );

    return (
        <SidebarFooter className={cn(isCollapsed && "items-center")}>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
                            {userInfo}
                            <ChevronsUpDown className="ml-auto size-4 opacity-50" />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            side={isMobile ? "bottom" : "right"}
                            align="end"
                            sideOffset={8}
                            className="min-w-56"
                        >
                            <div className="flex items-center gap-2 px-2 py-1.5">{userInfo}</div>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem render={<Link href="/seller/profile" />}>
                                <UserCircle /> Profile
                            </DropdownMenuItem>

                            <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm">
                                <span className="flex items-center gap-2">
                                    <Sun className="size-4 dark:hidden" />
                                    <Moon className="hidden size-4 dark:block" />
                                    Dark mode
                                </span>
                                <Switch
                                    checked={resolvedTheme === "dark"}
                                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                                    aria-label="Toggle dark mode"
                                />
                            </div>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                variant="destructive"
                                disabled={isPending}
                                onClick={() => logout()}
                            >
                                <LogOut /> {isPending ? "Logging out..." : "Log out"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    );
};

export default SellerSidebarFooter;