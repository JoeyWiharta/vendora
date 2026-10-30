import Image from "next/image";
import VendoraLogo from "@/assets/logo/vendora-logo.svg";
import ThemeToggle from "./ThemeToggle";

const PageLoader = () => {
    return (
        <main
            role="status"
            aria-live="polite"
            className="relative flex min-h-screen flex-col items-center justify-center gap-8 bg-background"
        >
            <div className="absolute right-4 top-4">
                <ThemeToggle />
            </div>

            <div className="relative flex size-20 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <span className="absolute inset-2 rounded-full bg-primary/10" />
                <Image
                    src={VendoraLogo}
                    alt="Vendora"
                    width={44}
                    height={44}
                    priority
                    className="relative animate-pulse"
                />
            </div>

            <div className="flex gap-1.5" aria-hidden="true">
                <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                <span className="size-2 animate-bounce rounded-full bg-primary" />
            </div>

            <span className="sr-only">Loading...</span>
        </main>
    );
};

export default PageLoader;