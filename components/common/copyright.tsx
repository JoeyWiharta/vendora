"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => { };

const Copyright = () => {
    const year = useSyncExternalStore(subscribe, () => new Date().getFullYear(), () => null);
    return (
        <p className="text-sm text-muted-foreground">
            © {year} Vendora. All rights reserved.
        </p>
    );
};

export default Copyright;