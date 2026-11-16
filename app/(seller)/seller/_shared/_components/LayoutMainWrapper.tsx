import { type ReactNode } from "react";

interface LayoutMainWrapperProps {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
}

const LayoutMainWrapper = ({ title, description, action, children }: LayoutMainWrapperProps) => {
    return (
        <div className="flex flex-1 flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
                {action}
            </div>
            <div className="flex flex-1 flex-col">{children}</div>
        </div>
    );
};

export default LayoutMainWrapper;