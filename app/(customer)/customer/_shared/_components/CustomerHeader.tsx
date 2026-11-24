"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@wrksz/themes/client";
import { LogOut, Moon } from "lucide-react";
import VendoraLogo from "@/assets/logo/vendora-logo.svg";
import { useLogout } from "@/app/(authentication)/_shared/_hooks/useLogout";
import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CUSTOMER_HOME_PATH, CUSTOMER_MENU } from "../_constants/CustomerNavMenu";
import { Separator } from "@/components/ui/separator";

const CustomerHeader = () => {
    const pathname = usePathname();
    const { resolvedTheme, setTheme } = useTheme();
    const email = useAuthStore((s) => s.user?.email) ?? "";
    const role = useAuthStore((s) => s.user?.role) ?? "customer";
    const { mutate: logout, isPending } = useLogout();
    const isDark = resolvedTheme === "dark";
    const initial = email.charAt(0).toUpperCase();
    const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

    return (
        <>
            {/* Navigation for Desktop */}
            <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="mx-auto flex h-14 w-full max-w-384 items-center justify-between gap-4 px-4 md:h-16 md:px-6">
                    <Link href={CUSTOMER_HOME_PATH} className="flex shrink-0 items-center gap-2">
                        <Image
                            src={VendoraLogo}
                            alt="Vendora logo"
                            priority
                            draggable={false}
                            className="aspect-square size-7 select-none md:size-8"
                        />
                        <span className="text-lg font-semibold tracking-wide md:text-xl">Vendora</span>
                    </Link>

                    <div className="flex items-center gap-2 md:gap-3">
                        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
                            {CUSTOMER_MENU.map(({ label, href, icon: Icon }) => {
                                const active = isActive(href);
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        aria-current={active ? "page" : undefined}
                                        className={cn(
                                            "flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors",
                                            active
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                        )}
                                    >
                                        <Icon className="size-4.5" />
                                        <span>{label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                        <Separator orientation="vertical" className="hidden md:block h-6 self-center!" />
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                aria-label="Open account menu"
                                className="rounded-full outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <Avatar className="size-8 md:size-9">
                                    <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                                        {initial}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                sideOffset={8}
                                className="w-[min(18rem,calc(100vw-2rem))] rounded-xl p-1.5"
                            >
                                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2.5">
                                    <Avatar className="size-9 rounded-lg">
                                        <AvatarFallback className="rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                                            {initial}
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
                                    className="gap-2.5 py-2.5 md:py-2"
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
                                    className="gap-2.5 py-2.5 md:py-2"
                                >
                                    <LogOut  />
                                    {isPending ? "Logging out..." : "Log out"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Navigation for Mobile */}
            <nav
                aria-label="Mobile navigation"
                className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-backdrop-filter:bg-background/75 md:hidden"
            >
                <ul className="mx-auto flex h-16 max-w-md items-stretch justify-around px-2">
                    {CUSTOMER_MENU.map(({ label, href, icon: Icon }) => {
                        const active = isActive(href);
                        return (
                            <li key={href} className="flex-1">
                                <Link
                                    href={href}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                                        active ? "text-primary" : "text-muted-foreground active:text-foreground",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                                            active && "bg-primary/10",
                                        )}
                                    >
                                        <Icon className="size-5" />
                                    </span>
                                    <span className="max-w-full truncate px-1">{label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </>
    );
};

export default CustomerHeader;