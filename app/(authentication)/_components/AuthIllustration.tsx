import Image from "next/image";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import VendoraLogo from "@/app/assets/logo/vendora-logo.svg";
import CurrentYear from "@/components/common/CurrentYear";

const AuthIllustration = () => {
    return (
        <aside className="hidden md:flex">
            <div className="flex flex-1 flex-col justify-between gap-8 p-6 lg:p-10 xl:p-14 2xl:p-16">
                <div className="space-y-6 lg:space-y-8">
                    <div className="flex items-center gap-2 lg:gap-3">
                        <Image
                            src={VendoraLogo}
                            alt="Vendora logo"
                            width={40}
                            height={40}
                            priority
                            draggable={false}
                            className="size-8 lg:size-10"
                        />
                        <span className="text-2xl font-bold tracking-tight lg:text-3xl">Vendora</span>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-3xl font-semibold leading-tight tracking-tight lg:text-4xl xl:text-5xl">
                            Shop smarter, <br />live <span className="text-primary">better.</span>
                        </h2>
                        <p className="max-w-md text-sm text-muted-foreground lg:text-base xl:text-lg">
                            Discover great products, best deals, and a smoother shopping experience with Vendora.
                        </p>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg 2xl:max-w-xl">
                        <DotLottieReact
                            src="/animation/auth-animation.lottie"
                            loop
                            autoplay
                            className="animate-in fade-in duration-1000"
                        />
                    </div>
                </div>

                <p className="text-xs text-muted-foreground lg:text-sm">
                    © <CurrentYear /> Vendora. All rights reserved.
                </p>
            </div>
        </aside>
    );
};

export default AuthIllustration;