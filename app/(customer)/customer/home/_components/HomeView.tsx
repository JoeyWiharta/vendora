"use client";

import { LayoutGrid, Sparkles } from "lucide-react";
import { useHomeProducts } from "../_hooks/useHomeProducts";
import HomeBenefits from "./HomeBenefits";
import { HomeEmpty, HomeError } from "./HomeFeedback";
import HomeHero from "./HomeHero";
import HomeSection from "./HomeSection";
import { ProductGrid, ProductGridSkeleton } from "./ProductGrid";

const HomeView = () => {
    const { shuffled, recommended, isLoading, isError, error, refetch, isFetching } = useHomeProducts();

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-10 md:gap-14">
            <HomeHero />
            <HomeBenefits />

            {isError ? (
                <HomeError message={error.message} onRetry={() => refetch()} retrying={isFetching} />
            ) : isLoading ? (
                <HomeSection
                    id="recommended"
                    icon={Sparkles}
                    title="Recommended for you"
                    subtitle="Picking something for you..."
                >
                    <ProductGridSkeleton />
                </HomeSection>
            ) : !shuffled.length ? (
                <HomeEmpty />
            ) : (
                <>
                    <HomeSection
                        id="recommended"
                        icon={Sparkles}
                        title="Recommended for you"
                        subtitle={`${recommended.length} random picks, just for you`}
                    >
                        <ProductGrid products={recommended} prioritizeFirst />
                    </HomeSection>

                    <HomeSection
                        id="all-products"
                        icon={LayoutGrid}
                        title="All products"
                        subtitle={`${shuffled.length} products available`}
                    >
                        <ProductGrid products={shuffled} prioritizeFirst/>
                    </HomeSection>
                </>
            )}
        </div>
    );
};

export default HomeView;