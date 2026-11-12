import { loginSchema } from "./loginSchema";

const valid = { email: "user@mail.com", password: "secret", rememberMe: false };

const messagesFor = (input: unknown, field: string) => {
    const result = loginSchema.safeParse(input);
    if (result.success) return [];
    return result.error.issues.filter((i) => i.path[0] === field).map((i) => i.message);
};

describe("loginSchema", () => {
    it("menerima data valid", () => {
        expect(loginSchema.safeParse(valid).success).toBe(true);
    });

    it("menolak email kosong", () => {
        expect(messagesFor({ ...valid, email: "" }, "email")).toContain("Email is required");
    });

    it("menolak format email tidak valid", () => {
        expect(messagesFor({ ...valid, email: "bukan-email" }, "email")).toContain("Invalid email format");
    });

    it("menolak password kosong", () => {
        expect(messagesFor({ ...valid, password: "" }, "password")).toContain("Password is required");
    });

    it("tidak menerapkan batas panjang password saat login", () => {
        expect(loginSchema.safeParse({ ...valid, password: "abc" }).success).toBe(true);
    });

    it("menolak rememberMe yang bukan boolean", () => {
        expect(loginSchema.safeParse({ ...valid, rememberMe: "yes" }).success).toBe(false);
    });
});