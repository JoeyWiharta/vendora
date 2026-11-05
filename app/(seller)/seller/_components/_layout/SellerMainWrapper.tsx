import { type ReactNode } from "react";

interface SellerMainWrapperProps {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
}


const SellerMainWrapper = (props: SellerMainWrapperProps) => {
    return (
        <div className="flex flex-1 flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{props.title}</h1>
                    {props.description &&
                        <p className="text-sm text-muted-foreground">{props.description}</p>
                    }
                </div>
                {props.action}
            </div>
            {props.children}
        </div>
    )
}
export default SellerMainWrapper