"use cache"

const Copyright = async () => {
    return (
        <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Vendora. All rights reserved.
        </p>
    );
}
export default Copyright