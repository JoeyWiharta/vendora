import { authErrorMessage } from "./authErrorMessage";

const DEFAULT_MESSAGE = "Something went wrong. Please try again";
const INVALID_LOGIN = "Invalid email or password";

const withCode = (code: string, message = "raw message") => Object.assign(new Error(message), { code });

describe("authErrorMessage", () => {
    it.each(["auth/invalid-credential", "auth/user-not-found", "auth/wrong-password"])(
        "memetakan %s ke pesan login generik (tidak membocorkan apakah email terdaftar)",
        (code) => {
            expect(authErrorMessage(withCode(code))).toBe(INVALID_LOGIN);
        },
    );

    it.each([
        ["auth/email-already-in-use", "Unable to create account. Please check your details and try again"],
        ["auth/weak-password", "Password is too weak"],
        ["auth/user-disabled", "This account has been disabled"],
        ["auth/too-many-requests", "Too many attempts. Please try again later"],
        ["auth/network-request-failed", "Network error. Please check your connection"],
        ["permission-denied", "You don't have permission to do this"],
    ])("memetakan %s ke pesan yang sesuai", (code, message) => {
        expect(authErrorMessage(withCode(code))).toBe(message);
    });

    it("memakai pesan default untuk kode yang tidak dikenal", () => {
        expect(authErrorMessage(withCode("auth/something-new"))).toBe(DEFAULT_MESSAGE);
    });

    it("membaca code dari object biasa (bukan instance Error)", () => {
        expect(authErrorMessage({ code: "auth/weak-password" })).toBe("Password is too weak");
    });

    it("memakai message dari Error biasa yang tidak punya code", () => {
        expect(authErrorMessage(new Error("Custom failure"))).toBe("Custom failure");
    });

    it.each([null, undefined, "string error", 42, {}])("tidak crash dan memakai default untuk input %p", (input) => {
        expect(authErrorMessage(input)).toBe(DEFAULT_MESSAGE);
    });
});