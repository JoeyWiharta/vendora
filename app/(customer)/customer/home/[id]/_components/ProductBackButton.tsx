import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CUSTOMER_HOME_PATH } from "../../../_shared/_constants/CustomerNavMenu";

const ProductBackButton = () => (
    <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={
            <Link href={CUSTOMER_HOME_PATH}
            />
        }>
        <ArrowLeft />
        Back to home
    </Button>
);

export default ProductBackButton;