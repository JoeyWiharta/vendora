const INVALID_LOGIN = "Invalid email or password";
const DEFAULT_MESSAGE = "Something went wrong. Please try again";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
    "auth/invalid-credential": INVALID_LOGIN,
    "auth/user-not-found": INVALID_LOGIN,
    "auth/wrong-password": INVALID_LOGIN,
    "auth/email-already-in-use": "Unable to create account. Please check your details and try again",
    "auth/weak-password": "Password is too weak",
    "auth/user-disabled": "This account has been disabled",
    "auth/too-many-requests": "Too many attempts. Please try again later",
    "auth/network-request-failed": "Network error. Please check your connection",
    "permission-denied": "You don't have permission to do this",
};

const getErrorCode = (error: unknown) => typeof error === "object" && error !== null && "code" in error ? String((error as { code: unknown }).code) : "";

export const authErrorMessage = (error: unknown) => {
    const code = getErrorCode(error);
    if (code) return AUTH_ERROR_MESSAGES[code] ?? DEFAULT_MESSAGE;
    return error instanceof Error ? error.message : DEFAULT_MESSAGE;
};