import CurrentYear from "@/components/common/CurrentYear";

const LayoutFooter = () => {
    return (
        <footer className="text-left text-xs text-muted-foreground py-4 px-4 md:px-6">
            © <CurrentYear /> Vendora. All rights reserved.
        </footer>
    );
};

export default LayoutFooter;