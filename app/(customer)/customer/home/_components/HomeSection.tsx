import type { LucideIcon } from "lucide-react";

type HomeSectionProps = {
    id?: string;
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
};

const HomeSection = ({ id, icon: Icon, title, subtitle, action, children }: HomeSectionProps) => {
    return (
        <section id={id} className="grid scroll-mt-24 gap-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
                        <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 leading-tight">
                        <h2 className="truncate text-lg font-bold tracking-tight md:text-xl">{title}</h2>
                        {subtitle && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground md:text-sm">{subtitle}</p>
                        )}
                    </div>
                </div>
                {action}
            </div>
            {children}
        </section>
    );
};

export default HomeSection;