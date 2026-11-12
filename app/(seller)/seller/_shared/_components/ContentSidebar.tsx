"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { cn } from "cn";
import { SELLER_MENU } from "../_constants/sellerMenu";

const ContentSidebar = () => {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
    const pathname = usePathname();

    return (
        <SidebarContent>
            <SidebarGroup className="py-0">
                <SidebarGroupLabel className={cn("font-medium uppercase tracking-wider text-sidebar-foreground opacity-50", "group-data-[collapsible=icon]:mt-0! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:opacity-50!")}>
                    {isCollapsed ? "Menu" : "Main Menu"}
                </SidebarGroupLabel>

                <SidebarGroupContent>
                    <SidebarMenu className={cn(isCollapsed && "items-center")}>
                        {SELLER_MENU.map((data) => {
                            const isActive = pathname.startsWith(data.href);
                            return (
                                <SidebarMenuItem key={data.href}>
                                    {isActive && (
                                        <span
                                            className={cn(
                                                "pointer-events-none absolute top-1/2 h-3/4 w-1 -translate-y-1/2 rounded-r-md bg-primary shadow-[2px_0_10px_0_var(--primary)]",
                                                isCollapsed ? "-left-3" : "-left-2",)}
                                        />)}

                                    <SidebarMenuButton
                                        render={<Link href={data.href} />}
                                        isActive={isActive}
                                        tooltip={data.label}
                                        onClick={(e) => { if (isActive) e.preventDefault(); }}
                                        className={cn(
                                            "h-9 text-sidebar-foreground",
                                            isActive &&
                                            "bg-primary text-primary-foreground transition-none hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground data-active:bg-primary data-active:text-primary-foreground",
                                        )}
                                    >
                                        <data.icon className={cn("opacity-50 transition-opacity group-hover/menu-button:opacity-100", isActive && "opacity-100")} />
                                        <span className={cn("font-medium opacity-50 transition-opacity group-hover/menu-button:opacity-100", isActive && "opacity-100",)}>
                                            {data.label}
                                        </span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
    );
};

export default ContentSidebar;