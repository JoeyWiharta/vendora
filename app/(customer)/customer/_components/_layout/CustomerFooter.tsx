import CurrentYear from "@/components/common/CurrentYear";

const CustomerFooter = () => {
    return (
        <footer className="mx-auto w-full max-w-384 shrink-0 px-4 py-4 text-left text-xs text-muted-foreground md:px-6">
            © <CurrentYear /> Vendora. All rights reserved.
        </footer>
    );
};

export default CustomerFooter;