"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@wrksz/themes/client";
import { LogOut, Moon } from "lucide-react";
import VendoraLogo from "@/assets/logo/vendora-logo.svg";
import { useLogout } from "@/app/(authentication)/_shared/_hooks/useLogout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";
import { cn } from "@/lib/utils";
import { CUSTOMER_HEADER_ACTIONS } from "../../_constants/CustomerNavMenu";

const CustomerHeader = () => {
    const pathname = usePathname();
    const { resolvedTheme, setTheme } = useTheme();
    const email = useAuthStore((s) => s.user?.email) ?? "";
    const role = useAuthStore((s) => s.user?.role) ?? "customer";
    const isDark = resolvedTheme === "dark";
    const { mutate: logout, isPending } = useLogout();

    return (
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="mx-auto flex h-16 w-full max-w-384 items-center justify-between px-4 md:px-6">
                <Link href="/customer/dashboard" className="flex items-center gap-2">
                    <Image
                        src={VendoraLogo}
                        alt="Vendora logo"
                        priority
                        draggable={false}
                        className="size-8 aspect-square select-none"
                    />
                    <span className="text-xl font-semibold tracking-wide">Vendora</span>
                </Link>

                <div className="flex items-center gap-2 sm:gap-3">
                    {CUSTOMER_HEADER_ACTIONS.map(({ label, href, icon: Icon }) => {
                        const active = pathname.startsWith(href);
                        return (
                            <Tooltip key={href}>
                                <TooltipTrigger
                                    render={
                                        <Link
                                            href={href}
                                            aria-label={label}
                                            className={cn(
                                                "relative flex size-8 items-center justify-center rounded-full transition",
                                                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                            )}
                                        />
                                    }
                                >
                                    <Icon className="size-5" />
                                </TooltipTrigger>
                                <TooltipContent side="bottom">{label}</TooltipContent>
                            </Tooltip>
                        );
                    })}

                    <DropdownMenu>
                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <DropdownMenuTrigger
                                        aria-label="Open account menu"
                                        className="ml-1 rounded-full outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                }
                            >
                                <Avatar className="size-8">
                                    <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                                        {email.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Profile</TooltipContent>
                        </Tooltip>

                        <DropdownMenuContent align="end" sideOffset={8} className="min-w-70 rounded-xl p-1.5">
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
                </div>
            </div>
        </header>
    );
};

export default CustomerHeader;