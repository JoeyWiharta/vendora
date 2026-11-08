"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trash2, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PRODUCT_CATEGORIES } from "@/constants/ProductCategory"
import { DEFAULT_PRODUCT_IMAGE } from "@/constants/ProductDefaultImage"
import { cn } from "@/lib/utils"
import { formatRupiah, formatFileSize, formatNumber } from "@/lib/formatter"
import { MAX_IMAGE_MB, addProductSchema } from "../../_schema/productAddSchema"
import { useAddProduct } from "../../_hooks/useAddProducts"
import type { AddProductFormPayload } from "../../_types/productTypes"

const AddProductForm = () => {
    const { mutate: addProduct, isPending } = useAddProduct()
    const [isDragging, setIsDragging] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { register, control, handleSubmit, setValue, watch,reset, formState: { errors } } = useForm<AddProductFormPayload>({
        resolver: zodResolver(addProductSchema),
        defaultValues: {
            productName: "",
            productCategory: "",
            description: "",
            image: undefined,
        },
    })

    useEffect(() => {
        reset()
    }, [reset])

    const [image, productName, productCategory, description, productPrice, productStock] = watch(["image", "productName", "productCategory", "description", "productPrice", "productStock"])

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
        if (!isPending) pickFile(e.dataTransfer.files?.[0])
    }

    return (
        <form onSubmit={handleSubmit((data) => addProduct(data))} noValidate className="w-full pb-24 lg:pb-0">
            <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_20rem] xl:grid-cols-[1fr_22rem]">
                <Card>
                    <CardContent>
                        <FieldGroup className="gap-4">
                            <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                                <Field data-invalid={!!errors.productName}>
                                    <FieldLabel htmlFor="productName">Product name</FieldLabel>
                                    <InputGroup className="px-2">
                                        <InputGroupInput
                                            id="productName"
                                            maxLength={120}
                                            placeholder="e.g. Wireless mechanical keyboard"
                                            disabled={isPending}
                                            aria-invalid={!!errors.productName}
                                            {...register("productName")}
                                        />
                                    </InputGroup>
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

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field data-invalid={!!errors.productPrice}>
                                    <FieldLabel htmlFor="productPrice">Price</FieldLabel>
                                    <InputGroup className="px-2">
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
                                    <InputGroup className="px-2">
                                        <InputGroupInput
                                            id="productStock"
                                            type="number"
                                            inputMode="numeric"
                                            min={1}
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

                            <Field data-invalid={!!errors.description}>
                                <FieldLabel htmlFor="description">Description</FieldLabel>
                                <Textarea
                                    id="description"
                                    rows={3}
                                    maxLength={2000}
                                    placeholder="Describe the material, size, condition, and anything buyers should know."
                                    className="resize-none"
                                    disabled={isPending}
                                    aria-invalid={!!errors.description}
                                    {...register("description")}
                                />
                                {errors.description && <FieldError>{errors.description.message}</FieldError>}
                            </Field>

                            <Field data-invalid={!!errors.image}>
                                <FieldLabel>Product image</FieldLabel>
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
                                        setIsDragging(true)
                                    }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    className={cn(
                                        "flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed p-3 transition-colors",
                                        "hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        isDragging && "border-primary bg-primary/10",
                                        errors.image && "border-destructive",
                                        isPending && "pointer-events-none opacity-60",
                                    )}
                                >
                                    {image && previewImage ? (
                                        <>
                                            <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                                                <Image src={previewImage} alt="Selected image" fill unoptimized className="object-cover" />
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
                                    ) : (
                                        <>
                                            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
                                                <UploadCloud className="size-5 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium">
                                                    <span className="text-primary">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-muted-foreground">Image file · max {MAX_IMAGE_MB}MB</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {errors.image ? (
                                    <FieldError>{errors.image.message}</FieldError>
                                ) : (
                                    <FieldDescription>A default image is used if you skip this.</FieldDescription>
                                )}
                            </Field>
                        </FieldGroup>
                    </CardContent>
                </Card>

                <aside className="flex min-w-0 flex-col gap-3">
                    <Card className="gap-0 overflow-hidden py-0">
                        <div className="relative aspect-4/3 bg-muted">
                            <Image
                                src={previewImage ?? DEFAULT_PRODUCT_IMAGE}
                                alt="Product preview"
                                fill
                                unoptimized
                                sizes="(min-width: 1280px) 22rem, (min-width: 1024px) 20rem, 100vw"
                                className="object-cover"
                            />
                            {!previewImage && (
                                <Badge variant="secondary" className="absolute bottom-2 left-2">
                                    Default image
                                </Badge>
                            )}
                        </div>

                        <CardContent className="grid min-w-0 gap-1.5 py-3">
                            <Badge variant="secondary" className={cn("w-fit", !productCategory && "text-muted-foreground")}>
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
                            <p className="truncate text-lg font-bold text-primary">{formatRupiah(productPrice)}</p>
                            <p className="truncate text-xs text-muted-foreground">
                                Stock: {formatNumber(productStock)} pcs
                            </p>
                            <p
                                className={cn(
                                    "line-clamp-3 whitespace-pre-line wrap-break-word text-xs text-muted-foreground",
                                    !description && "italic",
                                )}
                            >
                                {description || "Your product description will appear here."}
                            </p>
                        </CardContent>
                    </Card>

                    <div className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-[1fr_2fr] gap-2 border-t bg-background/95 p-3 backdrop-blur lg:static lg:mt-auto lg:grid-cols-1 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
                        <Button type="submit" size="lg" disabled={isPending} className="order-2 lg:order-1">
                            {isPending && <Spinner />}
                            {isPending ? "Saving..." : "Add product"}
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            disabled={isPending}
                            nativeButton={false}
                            render={<Link href="/seller/my-products" />}
                            className="order-1 lg:order-2"
                        >
                            Cancel
                        </Button>
                    </div>
                </aside>
            </div>
        </form>
    )
}

export default AddProductForm