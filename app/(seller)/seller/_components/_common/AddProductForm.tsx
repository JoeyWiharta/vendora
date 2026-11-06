"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PRODUCT_CATEGORIES } from "@/constants/ProductCategory"
import { DEFAULT_PRODUCT_IMAGE } from "@/constants/ProductDefaultImage"
import { cn } from "@/lib/utils"
import { MAX_IMAGE_MB, addProductSchema } from "../../_schema/productAddSchema"
import { useAddProduct } from "../../_hooks/useAddProducts"
import type { AddProductFormPayload } from "../../_types/productTypes"

const formatRupiah = (value?: number) =>
    `Rp ${(Number.isFinite(value) ? (value as number) : 0).toLocaleString("id-ID")}`

const AddProductForm = () => {
    const { mutate: addProduct, isPending } = useAddProduct()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { register, control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<AddProductFormPayload>({
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

    const values = watch()
    const image = values.image
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    useEffect(() => {
        if (!image) {
            setPreviewImage(null)
            return
        }
        const url = URL.createObjectURL(image)
        setPreviewImage(url)
        return () => URL.revokeObjectURL(url)
    }, [image])

    const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) setValue("image", file, { shouldValidate: true })
        e.target.value = ""
    }

    return (
        <form
            onSubmit={handleSubmit((data) => addProduct(data))}
            noValidate
            className="grid w-full items-start gap-6 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_26rem]"
        >
            {/* ================= KIRI: INPUT ================= */}
            <div className="grid gap-6">
                {/* Foto */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Field data-invalid={!!errors.image}>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImage}
                                disabled={isPending}
                            />

                            <Button
                                type="button"
                                variant="outline"
                                disabled={isPending}
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "h-auto flex-col gap-2 border-dashed px-4 py-8 font-normal",
                                    errors.image && "border-destructive",
                                )}
                            >
                                <ImagePlus className="size-6 text-muted-foreground" />
                                <span className="text-sm font-medium">{image ? "Change image" : "Click to upload"}</span>
                                <span className="text-xs text-muted-foreground">Image file, max {MAX_IMAGE_MB}MB</span>
                            </Button>

                            {image && (
                                <div className="flex items-center justify-between gap-3 rounded-lg border py-1.5 pl-3 pr-1.5 text-sm">
                                    <span className="truncate">{image.name}</span>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        aria-label="Remove image"
                                        className="size-7 shrink-0"
                                        onClick={() => setValue("image", undefined, { shouldValidate: true })}
                                        disabled={isPending}
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            )}

                            {errors.image ? (
                                <FieldError>{errors.image.message}</FieldError>
                            ) : (
                                <FieldDescription>Optional. A default image is used if you skip this.</FieldDescription>
                            )}
                        </Field>
                    </CardContent>
                </Card>

                {/* Info dasar */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-5">
                        <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
                            <Field data-invalid={!!errors.productName}>
                                <FieldLabel htmlFor="productName">Product name</FieldLabel>
                                <InputGroup className="px-2">
                                    <InputGroupInput
                                        id="productName"
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
                                            <SelectContent>
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
                                rows={6}
                                placeholder="Describe the material, size, condition, and anything buyers should know."
                                disabled={isPending}
                                aria-invalid={!!errors.description}
                                {...register("description")}
                            />
                            {errors.description && <FieldError>{errors.description.message}</FieldError>}
                        </Field>
                    </CardContent>
                </Card>

                {/* Harga & stok */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing & stock</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-5 sm:grid-cols-2">
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
                                    disabled={isPending}
                                    aria-invalid={!!errors.productStock}
                                    {...register("productStock", { valueAsNumber: true })}
                                />
                                <InputGroupAddon align="inline-end">pcs</InputGroupAddon>
                            </InputGroup>
                            {errors.productStock && <FieldError>{errors.productStock.message}</FieldError>}
                        </Field>
                    </CardContent>
                </Card>
            </div>

            {/* ================= KANAN: SUMMARY ================= */}
            <aside className="grid gap-4 lg:sticky lg:top-6">
                <Card className="gap-0 overflow-hidden py-0">
                    <CardHeader className="border-b py-4">
                        <CardTitle className="text-sm">Summary</CardTitle>
                    </CardHeader>

                    <div className="relative aspect-[4/3] bg-muted">
                        <Image
                            src={previewImage ?? DEFAULT_PRODUCT_IMAGE}
                            alt="Product preview"
                            fill
                            unoptimized
                            sizes="(min-width: 1280px) 26rem, (min-width: 1024px) 22rem, 100vw"
                            className="object-cover"
                        />
                        {!previewImage && (
                            <Badge variant="secondary" className="absolute bottom-2 left-2">
                                Default image
                            </Badge>
                        )}
                    </div>

                    <CardContent className="grid gap-4 py-5">
                        <div className="grid gap-2">
                            {values.productCategory && (
                                <Badge variant="secondary" className="w-fit">
                                    {values.productCategory}
                                </Badge>
                            )}
                            <p
                                className={cn(
                                    "break-words text-lg font-semibold leading-snug",
                                    !values.productName && "text-muted-foreground",
                                )}
                            >
                                {values.productName || "Product name"}
                            </p>
                            <p className="line-clamp-4 whitespace-pre-line text-sm text-muted-foreground">
                                {values.description || "Your product description will appear here."}
                            </p>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Price</p>
                                <p className="font-semibold">{formatRupiah(values.productPrice)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Stock</p>
                                <p className="font-semibold">
                                    {Number.isFinite(values.productStock) ? values.productStock : 0} pcs
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
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
        </form>
    )
}

export default AddProductForm