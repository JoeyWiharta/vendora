"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trash2, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PRODUCT_CATEGORIES } from "@/constants/ProductCategory"
import { DEFAULT_PRODUCT_IMAGE } from "@/constants/ProductDefaultImage"
import { cn } from "@/lib/utils"
import { formatRupiah, formatFileSize, formatNumber } from "@/lib/formatter"
import { MAX_IMAGE_MB, addEditProductSchema } from "../../_schema/productAddEditSchema"
import { useAddProduct } from "../../_hooks/useAddProducts"
import { useUpdateProduct } from "../../_hooks/useUpdateProduct"
import type { AddProductFormPayload, Product } from "../../_types/productTypes"

interface ProductFormProps {
    product?: Product
}

const ProductForm = ({ product }: ProductFormProps) => {
    const isEdit = !!product

    const { mutate: addProduct, isPending: isAdding } = useAddProduct()
    const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct()
    const isPending = isAdding || isUpdating

    const [isDragging, setIsDragging] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const existingImage = product?.productImage && product.productImage !== DEFAULT_PRODUCT_IMAGE ? product.productImage : null

    const { register, control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<AddProductFormPayload>({
        resolver: zodResolver(addEditProductSchema),
        defaultValues: {
            productName: product?.productName ?? "",
            productCategory: product?.productCategory ?? "",
            description: product?.description ?? "",
            productPrice: product?.productPrice,
            productStock: product?.productStock,
            image: undefined,
        },
    })

    const [image, productName, productCategory, description, productPrice, productStock] = watch([
        "image",
        "productName",
        "productCategory",
        "description",
        "productPrice",
        "productStock",
    ])

    useEffect(() => {
        if (!image) {
            setPreviewImage(null)
            return
        }
        const url = URL.createObjectURL(image)
        setPreviewImage(url)
        return () => URL.revokeObjectURL(url)
    }, [image])

    const pickFile = (file?: File) => {
        if (file) setValue("image", file, { shouldValidate: true })
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        pickFile(e.target.files?.[0])
        e.target.value = ""
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        if (isPending) return
        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith("image/")) pickFile(file)
    }

    useEffect(() => {
        reset()
    }, [reset])

    return (
        <form
            onSubmit={handleSubmit((data) =>
                isEdit
                    ? updateProduct({
                        id: product.id,
                        data: {
                            ...data,
                            productImage: product.productImage,
                            productImagePublicId: product.productImagePublicId,
                        },
                    }) : addProduct(data))}
            noValidate
            className="w-full pb-20 md:pb-0"
        >
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="grid min-w-0 gap-5">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup className="gap-4">
                                <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                                    <Field data-invalid={!!errors.productName}>
                                        <FieldLabel htmlFor="productName">Product name</FieldLabel>
                                        <Input
                                            id="productName"
                                            maxLength={120}
                                            placeholder="e.g. Wireless mechanical keyboard"
                                            disabled={isPending}
                                            aria-invalid={!!errors.productName}
                                            {...register("productName")}
                                        />
                                        {errors.productName && <FieldError>{errors.productName.message}</FieldError>}
                                    </Field>

                                    <Field data-invalid={!!errors.productCategory}>
                                        <FieldLabel htmlFor="productCategory">Category</FieldLabel>
                                        <Controller
                                            name="productCategory"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value || null}
                                                    onValueChange={(value) => field.onChange(value ?? "")}
                                                    disabled={isPending}
                                                >
                                                    <SelectTrigger
                                                        id="productCategory"
                                                        className="w-full"
                                                        aria-invalid={!!errors.productCategory}
                                                    >
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent alignItemWithTrigger={false} sideOffset={4}>
                                                        {PRODUCT_CATEGORIES.map((category) => (
                                                            <SelectItem key={category} value={category}>
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.productCategory && <FieldError>{errors.productCategory.message}</FieldError>}
                                    </Field>
                                </div>

                                <Field data-invalid={!!errors.description}>
                                    <FieldLabel htmlFor="description">Description</FieldLabel>
                                    <Textarea
                                        id="description"
                                        rows={4}
                                        maxLength={2000}
                                        placeholder="Describe the material, size, condition, and anything buyers should know."
                                        className="min-h-24 resize-none"
                                        disabled={isPending}
                                        aria-invalid={!!errors.description}
                                        {...register("description")}
                                    />
                                    {errors.description && <FieldError>{errors.description.message}</FieldError>}
                                </Field>
                            </FieldGroup>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing & stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field data-invalid={!!errors.productPrice}>
                                    <FieldLabel htmlFor="productPrice">Price</FieldLabel>
                                    <InputGroup>
                                        <InputGroupAddon>Rp</InputGroupAddon>
                                        <InputGroupInput
                                            id="productPrice"
                                            type="number"
                                            inputMode="numeric"
                                            min={1}
                                            placeholder="0"
                                            className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            disabled={isPending}
                                            aria-invalid={!!errors.productPrice}
                                            {...register("productPrice", { valueAsNumber: true })}
                                        />
                                    </InputGroup>
                                    {errors.productPrice && <FieldError>{errors.productPrice.message}</FieldError>}
                                </Field>

                                <Field data-invalid={!!errors.productStock}>
                                    <FieldLabel htmlFor="productStock">Stock</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            id="productStock"
                                            type="number"
                                            inputMode="numeric"
                                            min={isEdit ? 0 : 1}
                                            placeholder="0"
                                            className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            disabled={isPending}
                                            aria-invalid={!!errors.productStock}
                                            {...register("productStock", { valueAsNumber: true })}
                                        />
                                        <InputGroupAddon align="inline-end">pcs</InputGroupAddon>
                                    </InputGroup>
                                    {errors.productStock && <FieldError>{errors.productStock.message}</FieldError>}
                                </Field>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Product image</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {isEdit
                                    ? "Optional. Leave as is to keep the current image."
                                    : "Optional. A default image is used if skipped."}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <Field data-invalid={!!errors.image}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleInputChange}
                                    disabled={isPending}
                                />

                                <div
                                    role="button"
                                    tabIndex={0}
                                    aria-label="Upload product image"
                                    onClick={() => !isPending && fileInputRef.current?.click()}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault()
                                            if (!isPending) fileInputRef.current?.click()
                                        }
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault()
                                        if (!isPending) setIsDragging(true)
                                    }}
                                    onDragLeave={(e) => {
                                        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                                            setIsDragging(false)
                                        }
                                    }}
                                    onDrop={handleDrop}
                                    className={cn(
                                        "flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-3 transition-colors",
                                        "hover:border-primary/60 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        isDragging && "border-primary bg-primary/5",
                                        errors.image && "border-destructive",
                                        isPending && "pointer-events-none opacity-60",
                                    )}
                                >
                                    {image && previewImage ? (
                                        <>
                                            <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                                                <Image
                                                    src={previewImage}
                                                    alt="Selected image"
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{image.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatFileSize(image.size)} · Click or drop to replace
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={isPending}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setValue("image", undefined, { shouldValidate: true })
                                                }}
                                            >
                                                <Trash2 />
                                                <span className="hidden sm:inline">Remove</span>
                                            </Button>
                                        </>
                                    ) : existingImage ? (
                                        <>
                                            <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                                                <Image
                                                    src={existingImage}
                                                    alt="Current image"
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium">Current image</p>
                                                <p className="text-xs text-muted-foreground">Click or drop to replace</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
                                                <UploadCloud className="size-5 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium">
                                                    <span className="text-primary">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Image file · max {MAX_IMAGE_MB}MB
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {errors.image && <FieldError>{errors.image.message}</FieldError>}
                            </Field>
                        </CardContent>
                    </Card>

                    <div className="hidden justify-end gap-2 md:flex">
                        <Button
                            variant="outline"
                            disabled={isPending}
                            nativeButton={false}
                            render={<Link href="/seller/my-products" />}
                            className="min-w-28"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending} className="min-w-32">
                            {isPending && <Spinner />}
                            {isPending ? "Saving..." : isEdit ? "Save changes" : "Add product"}
                        </Button>
                    </div>
                </div>

                <aside className="hidden min-w-0 lg:sticky lg:top-6 lg:block">
                    <Card className="gap-0 overflow-hidden py-0">
                        <div className="relative aspect-4/3 bg-muted">
                            <Image
                                src={previewImage ?? existingImage ?? DEFAULT_PRODUCT_IMAGE}
                                alt="Product preview"
                                fill
                                unoptimized
                                loading="eager"
                                sizes="(min-width: 1280px) 22rem, 20rem"
                                className="object-cover"
                            />
                            {!previewImage && !existingImage && (
                                <Badge variant="secondary" className="absolute bottom-2 left-2">
                                    Default image
                                </Badge>
                            )}
                        </div>

                        <CardContent className="grid min-w-0 gap-2 py-4">
                            <Badge
                                variant="secondary"
                                className={cn("w-fit", !productCategory && "text-muted-foreground")}
                            >
                                {productCategory || "Category"}
                            </Badge>
                            <p
                                className={cn(
                                    "line-clamp-2 wrap-break-word text-sm font-medium leading-snug",
                                    !productName && "text-muted-foreground",
                                )}
                            >
                                {productName || "Your product name"}
                            </p>
                            <p className="truncate text-lg font-semibold">{formatRupiah(productPrice)}</p>
                            <p className="line-clamp-3 whitespace-pre-line wrap-break-word text-xs text-muted-foreground">
                                {description || "Your product description will appear here."}
                            </p>
                            <Separator />
                            <p className="text-xs text-muted-foreground">
                                Stock: <span className="font-medium text-foreground">{formatNumber(productStock)} pcs</span>
                            </p>
                        </CardContent>
                    </Card>
                </aside>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-[1fr_2fr] gap-2 border-t bg-background/95 p-3 backdrop-blur md:hidden">
                <Button
                    variant="outline"
                    size="lg"
                    disabled={isPending}
                    nativeButton={false}
                    render={<Link href="/seller/my-products" />}
                >
                    Cancel
                </Button>
                <Button type="submit" size="lg" disabled={isPending}>
                    {isPending && <Spinner />}
                    {isPending ? "Saving..." : isEdit ? "Save changes" : "Add product"}
                </Button>
            </div>
        </form>
    )
}

export default ProductForm