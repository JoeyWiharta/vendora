"use client";

import Link from "next/link";
import { useTheme } from "@wrksz/themes/client";
import { ChevronsUpDown, LogOut, Moon, Sun, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLogout } from "@/app/(authentication)/_hooks/useLogout";
import { useAuthStore } from "@/store/authStore";

const SellerSidebarFooter = () => {
    const { isMobile } = useSidebar();
    const { resolvedTheme, setTheme } = useTheme();
    const email = useAuthStore((s) => s.user?.email) ?? "";
    const role = useAuthStore((s) => s.user?.role) ?? "";
    const isDark = resolvedTheme === "dark";

    const { mutate: logout, isPending } = useLogout();

    return (
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <SidebarMenuButton
                                    size="lg"
                                    className="rounded-xl border border-sidebar-border bg-background/60 shadow-xs transition-all duration-200 hover:border-primary/40! hover:bg-primary/10! hover:shadow-md data-popup-open:border-primary/40! data-popup-open:bg-primary/10! group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none"
                                />
                            }
                        >
                            <Avatar className="size-8 rounded-lg">
                                <AvatarFallback className="rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                                    {email.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                                <Tooltip>
                                    <TooltipTrigger render={<span className="truncate font-semibold" />}>
                                        {email}
                                    </TooltipTrigger>
                                    <TooltipContent side="top" align="start">
                                        {email}
                                    </TooltipContent>
                                </Tooltip>
                                <span className="truncate text-xs capitalize text-muted-foreground">{role}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground transition-colors group-hover/menu-button:text-foreground group-data-popup-open/menu-button:text-foreground" />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            side={isMobile ? "bottom" : "right"}
                            align="end"
                            sideOffset={12}
                            className="min-w-60 rounded-xl p-1.5"
                        >
                            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2.5">
                                <Avatar className="size-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                                        {email.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid min-w-0 flex-1 leading-tight">
                                    <Tooltip>
                                        <TooltipTrigger render={<span className="truncate text-sm font-semibold" />}>
                                            {email}
                                        </TooltipTrigger>
                                        <TooltipContent side="top" align="start">
                                            {email}
                                        </TooltipContent>
                                    </Tooltip>
                                    <span className="truncate text-xs capitalize text-muted-foreground">{role}</span>
                                </div>
                            </div>

                            <DropdownMenuSeparator className="my-1.5" />

                            <DropdownMenuItem render={<Link href="/seller/profile" />} className="gap-2.5 py-2">
                                <UserCircle className="text-muted-foreground" />
                                Profile
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                closeOnClick={false}
                                onClick={() => setTheme(isDark ? "light" : "dark")}
                                className="gap-2.5 py-2"
                            >
                                <Moon className="text-muted-foreground" />
                                <span className="flex-1">Dark mode</span>
                                <Switch
                                    checked={isDark}
                                    tabIndex={-1}
                                    className="pointer-events-none"
                                    aria-label="Toggle dark mode"
                                />
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1.5" />

                            <DropdownMenuItem
                                variant="destructive"
                                disabled={isPending}
                                onClick={() => logout()}
                                className="gap-2.5 py-2"
                            >
                                <LogOut />
                                {isPending ? "Logging out..." : "Log out"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    );
};

export default SellerSidebarFooter;