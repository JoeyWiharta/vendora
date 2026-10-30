import SellerGuard from "./_components/SellerGuard";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
    return <SellerGuard>{children}</SellerGuard>;
}