import { Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRODUCT_CATEGORIES } from "@/constants/ProductCategory";

interface ProductToolbarProps {
    allValue: string;
    searchFilter: string;
    categoryFilter: string;
    selectedDeleteCount: number;
    handleSearch: (value: string) => void;
    handleCategory: (value: string | null) => void;
    handleDelete: () => void;
}

const ProductToolbar = (props: ProductToolbarProps) => (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <InputGroup className="sm:max-w-xs">
            <InputGroupAddon><Search /></InputGroupAddon>
            <InputGroupInput
                placeholder="Search product name..."
                value={props.searchFilter}
                onChange={(e) => props.handleSearch(e.target.value)}
            />
        </InputGroup>

        <Select value={props.categoryFilter} onValueChange={props.handleCategory}>
            <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} sideOffset={4} className="p-1">
                <SelectItem value={props.allValue}>All categories</SelectItem>
                {PRODUCT_CATEGORIES.map((data) => (
                    <SelectItem key={data} value={data}>
                        {data}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>

        {props.selectedDeleteCount > 0 && (
            <Button variant="destructive" className="sm:ml-auto" onClick={props.handleDelete}>
                <Trash2 />
                Delete ({props.selectedDeleteCount})
            </Button>
        )}
    </div>
);

export default ProductToolbar;