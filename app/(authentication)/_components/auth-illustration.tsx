import Image from "next/image";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import VendoraLogo from "@/app/assets/logo/vendora-logo.svg";
import Copyright from "@/components/common/copyright";

const renderLottieConfig = { devicePixelRatio: 1.2 };

const AuthIllustration = () => {
    return (
        <aside className="hidden lg:flex">
            <div className="flex flex-1 flex-col justify-between gap-8 p-10 xl:p-14">
                <div className="space-y-10">
                    <div className="flex items-center gap-3">
                        <Image
                            src={VendoraLogo}
                            alt="Vendora logo"
                            width={50}
                            height={50}
                            priority
                            draggable={false}
                        />
                        <span className="text-4xl font-bold tracking-tight">Vendora</span>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                            Shop smarter,
                            <br />
                            live <span className="text-primary">better.</span>
                        </h2>
                        <p className="max-w-md text-lg text-muted-foreground">
                            Discover great products, best deals, and a smoother shopping
                            experience with Vendora.
                        </p>
                    </div>
                </div>

                <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
                    <div className="w-full">
                        <DotLottieReact
                            src="/animation/auth-animation.lottie"
                            loop
                            autoplay
                            renderConfig={renderLottieConfig}
                        />
                    </div>
                </div>

                <Copyright />
            </div>
        </aside>
    );
}
export default AuthIllustration