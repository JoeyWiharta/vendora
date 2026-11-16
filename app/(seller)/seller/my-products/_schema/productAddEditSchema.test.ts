import { addEditProductSchema, MAX_IMAGE_MB } from "./productAddEditSchema";

const valid = {
    productName: "Keyboard",
    productCategory: "Electronics",
    description: "Mechanical keyboard",
    productPrice: 150000,
    productStock: 10,
};

const messagesFor = (input: unknown, field: string) => {
    const result = addEditProductSchema.safeParse(input);
    if (result.success) return [];
    return result.error.issues.filter((i) => i.path[0] === field).map((i) => i.message);
};

const makeFile = (name: string, type: string, sizeBytes: number) => {
    const file = new File(["x"], name, { type });
    Object.defineProperty(file, "size", { value: sizeBytes });
    return file;
};

describe("addEditProductSchema", () => {
    it("menerima data valid tanpa gambar", () => {
        expect(addEditProductSchema.safeParse(valid).success).toBe(true);
    });

    describe("productName", () => {
        it("menolak nama dengan 5 karakter", () => {
            expect(messagesFor({ ...valid, productName: "abcde" }, "productName")).toContain(
                "Product name must be more than 5 characters",
            );
        });

        it("menerima nama dengan 6 karakter", () => {
            expect(addEditProductSchema.safeParse({ ...valid, productName: "abcdef" }).success).toBe(true);
        });

        it("spasi di pinggir tidak dihitung", () => {
            expect(messagesFor({ ...valid, productName: "  abc  " }, "productName")).not.toHaveLength(0);
        });
    });

    describe("productCategory", () => {
        it("menolak kategori kosong", () => {
            expect(messagesFor({ ...valid, productCategory: "" }, "productCategory")).toContain(
                "Please select a product category",
            );
        });
    });

    describe("description", () => {
        it("menolak deskripsi kosong", () => {
            expect(messagesFor({ ...valid, description: "" }, "description")).toContain("Description is required");
        });

        it("menolak deskripsi berisi spasi saja", () => {
            expect(messagesFor({ ...valid, description: "   " }, "description")).toContain("Description is required");
        });
    });

    describe("productPrice", () => {
        it.each([0, -1])("menolak harga %i", (price) => {
            expect(messagesFor({ ...valid, productPrice: price }, "productPrice")).toContain(
                "Price must be greater than 0",
            );
        });

        it("menolak harga desimal", () => {
            expect(messagesFor({ ...valid, productPrice: 10.5 }, "productPrice")).toContain(
                "Price must be a whole number",
            );
        });

        it("menolak harga NaN (input dikosongkan)", () => {
            expect(addEditProductSchema.safeParse({ ...valid, productPrice: NaN }).success).toBe(false);
        });

        it("menerima harga 1", () => {
            expect(addEditProductSchema.safeParse({ ...valid, productPrice: 1 }).success).toBe(true);
        });
    });

    describe("productStock", () => {
        it.each([0, -5])("menolak stok %i", (stock) => {
            expect(messagesFor({ ...valid, productStock: stock }, "productStock")).toContain(
                "Stock must be greater than 0",
            );
        });

        it("menolak stok desimal", () => {
            expect(messagesFor({ ...valid, productStock: 2.5 }, "productStock")).toContain(
                "Stock must be a whole number",
            );
        });

        it("menerima stok 1", () => {
            expect(addEditProductSchema.safeParse({ ...valid, productStock: 1 }).success).toBe(true);
        });
    });

    describe("image", () => {
        it("gambar bersifat opsional (default image dipakai jika dilewati)", () => {
            expect(addEditProductSchema.safeParse({ ...valid, image: undefined }).success).toBe(true);
        });

        it("menerima gambar valid", () => {
            const image = makeFile("a.png", "image/png", 1024);
            expect(addEditProductSchema.safeParse({ ...valid, image }).success).toBe(true);
        });

        it("menolak file kosong", () => {
            const image = makeFile("a.png", "image/png", 0);
            expect(messagesFor({ ...valid, image }, "image")).toContain("Image cannot be empty");
        });

        it("menolak file yang bukan gambar", () => {
            const image = makeFile("a.pdf", "application/pdf", 1024);
            expect(messagesFor({ ...valid, image }, "image")).toContain("File must be an image");
        });

        it("menolak gambar melebihi batas ukuran", () => {
            const image = makeFile("a.png", "image/png", MAX_IMAGE_MB * 1024 * 1024 + 1);
            expect(messagesFor({ ...valid, image }, "image")).toContain(`Image must not exceed ${MAX_IMAGE_MB}MB`);
        });

        it("menerima gambar tepat di batas ukuran", () => {
            const image = makeFile("a.png", "image/png", MAX_IMAGE_MB * 1024 * 1024);
            expect(addEditProductSchema.safeParse({ ...valid, image }).success).toBe(true);
        });
    });
});