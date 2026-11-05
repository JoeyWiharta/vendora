
"use client"

import Link from "next/link"
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PRODUCT_CATEGORIES } from "@/constants/ProductCategory"
import { MAX_IMAGE_MB, addProductSchema } from "../../_schema/productAddSchema"
import { useAddProduct } from "../../_hooks/useAddProducts"

const AddProductForm = () => {
    const { mutate: addProduct, isPending } = useAddProduct()

    const [productName, setProductName] = useState("")
    const [productCategory, setProductCategory] = useState<(typeof PRODUCT_CATEGORIES)[number]>(PRODUCT_CATEGORIES[0])
    const [description, setDescription] = useState("")
    const [productPrice, setProductPrice] = useState("")
    const [productStock, setProductStock] = useState("")
    const [image, setImage] = useState<File | undefined>()
    const [preview, setPreview] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!image) {
            setPreview(null)
            return
        }

        const url = URL.createObjectURL(image)
        setPreview(url)

        return () => URL.revokeObjectURL(url)
    }, [image])

    const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            setError("File must be an image")
            e.target.value = ""
            return
        }

        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
            setError(`Image must not exceed ${MAX_IMAGE_MB}MB`)
            e.target.value = ""
            return
        }

        setError(null)
        setImage(file)
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const result = addProductSchema.safeParse({
            productName,
            productCategory,
            description,
            productPrice,
            productStock,
            image,
        })

        if (!result.success) {
            setError(result.error.issues[0].message)
            return
        }

        setError(null)
        addProduct(result.data)
    }

    return (
        <form onSubmit={handleSubmit} className="grid max-w-2xl gap-5 rounded-xl border bg-card p-6">
            <div className="grid gap-2">
                <Label>Product image</Label>

                <div className="relative size-40">
                    <label className="flex size-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted transition-colors hover:border-primary/40 hover:bg-primary/5">
                        {preview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={preview} alt="Product preview" className="size-full object-cover" />
                        ) : (
                            <span className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                                <ImagePlus className="size-6" />
                                Upload image
                            </span>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImage}
                            disabled={isPending}
                        />
                    </label>

                    {image && (
                        <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute -right-2 -top-2 size-7 rounded-full"
                            onClick={() => setImage(undefined)}
                            disabled={isPending}
                        >
                            <X className="size-4" />
                        </Button>
                    )}
                </div>

                <p className="text-xs text-muted-foreground">
                    Optional. Maximum file size: {MAX_IMAGE_MB}MB.
                </p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="productName">Product name</Label>
                <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => {
                        setProductName(e.target.value)
                        setError(null)
                    }}
                    disabled={isPending}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="productCategory">Category</Label>
                <select
                    id="productCategory"
                    value={productCategory}
                    onChange={(e) => {
                        setProductCategory(e.target.value as typeof PRODUCT_CATEGORIES[number])
                        setError(null)
                    }}
                    disabled={isPending}
                    className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                    {PRODUCT_CATEGORIES.map((category) => (
                        <option key={category} value={category} className="bg-background">
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="productPrice">Price (IDR)</Label>
                    <Input
                        id="productPrice"
                        type="number"
                        min={0}
                        value={productPrice}
                        onChange={(e) => {
                            setProductPrice(e.target.value)
                            setError(null)
                        }}
                        disabled={isPending}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="productStock">Stock</Label>
                    <Input
                        id="productStock"
                        type="number"
                        min={0}
                        value={productStock}
                        onChange={(e) => {
                            setProductStock(e.target.value)
                            setError(null)
                        }}
                        disabled={isPending}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => {
                        setDescription(e.target.value)
                        setError(null)
                    }}
                    disabled={isPending}
                />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2">
                <Button
                    variant="outline"
                    disabled={isPending}
                    nativeButton={false}
                    render={<Link href="/seller/my-products" />}
                >
                    Cancel
                </Button>

                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Add product"}
                </Button>
            </div>
        </form>
    )
}

export default AddProductForm
