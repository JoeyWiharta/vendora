"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/app/(authentication)/_hooks/useLogout";

export function LogoutButton() {
    const { mutate: doLogout, isPending } = useLogout();

    return (
        <Button variant="outline" onClick={() => doLogout()} disabled={isPending}>
            <LogOut />
            {isPending ? "Logging out..." : "Log out"}
        </Button>
    );
}

