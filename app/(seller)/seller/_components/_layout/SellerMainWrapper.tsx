import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface BreadcrumbProps {
    label: string;
    href?: string;
}

interface SellerMainWrapperProps {
    breadcrumbs: BreadcrumbProps[];
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
}


const SellerMainWrapper = (props: SellerMainWrapperProps) => {
    return (
        <div className="flex flex-1 flex-col gap-6 px-4 pb-6 md:px-6">
            <div className="flex flex-col gap-3">
                <Breadcrumb>
                    <BreadcrumbList>
                        {props.breadcrumbs.map((data, i) => {
                            const isLast = i === props.breadcrumbs.length - 1;
                            return (
                                <Fragment key={data.label}>
                                    <BreadcrumbItem>
                                        {isLast || !data.href ? (
                                            <BreadcrumbPage>{data.label}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink render={<Link href={data.href} />}>
                                                {data.label}
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && <BreadcrumbSeparator />}
                                </Fragment>
                            )
                        })}
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{props.title}</h1>
                        {props.description && <p className="text-sm text-muted-foreground">{props.description}</p>}
                    </div>
                    {props.action}
                </div>
            </div>
            {props.children}

        </div>
    )
}
export default SellerMainWrapper