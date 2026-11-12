import { registerSchema } from "./registerSchema";

const valid = {
    role: "customer",
    email: "user@mail.com",
    password: "password123",
    confirmPassword: "password123",
};

const messagesFor = (input: unknown, field: string) => {
    const result = registerSchema.safeParse(input);
    if (result.success) return [];
    return result.error.issues.filter((i) => i.path[0] === field).map((i) => i.message);
};

describe("registerSchema", () => {
    it.each(["customer", "seller"])("menerima data valid dengan role %s", (role) => {
        expect(registerSchema.safeParse({ ...valid, role }).success).toBe(true);
    });

    it("menolak role di luar customer/seller", () => {
        expect(messagesFor({ ...valid, role: "admin" }, "role")).toContain("Select account type");
    });

    it("menolak role yang tidak diisi", () => {
        const { role: _role, ...withoutRole } = valid;
        expect(messagesFor(withoutRole, "role")).toContain("Select account type");
    });

    it("menolak email kosong", () => {
        expect(messagesFor({ ...valid, email: "" }, "email")).toContain("Email is required");
    });

    it("menolak format email tidak valid", () => {
        expect(messagesFor({ ...valid, email: "bukan-email" }, "email")).toContain("Invalid email format");
    });

    it("menolak password kurang dari 8 karakter", () => {
        const input = { ...valid, password: "short12", confirmPassword: "short12" };
        expect(messagesFor(input, "password")).toContain("Password must be at least 8 characters");
    });

    it("menerima password tepat 8 karakter", () => {
        const input = { ...valid, password: "12345678", confirmPassword: "12345678" };
        expect(registerSchema.safeParse(input).success).toBe(true);
    });

    it("menolak confirmPassword kosong", () => {
        expect(messagesFor({ ...valid, confirmPassword: "" }, "confirmPassword")).toContain(
            "Confirm password is required",
        );
    });

    it("menolak jika password dan confirmPassword berbeda, error ada di confirmPassword", () => {
        const input = { ...valid, confirmPassword: "beda123456" };
        expect(messagesFor(input, "confirmPassword")).toContain("Passwords do not match");
    });
});