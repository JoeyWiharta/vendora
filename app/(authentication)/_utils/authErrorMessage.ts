const INVALID_LOGIN = "Invalid email or password";
const AUTH_ERROR_MESSAGES: Record<string, string> = {
    "auth/invalid-credential": INVALID_LOGIN,
    "auth/user-not-found": INVALID_LOGIN,
    "auth/wrong-password": INVALID_LOGIN,
    "auth/email-already-in-use": "Unable to create account. Please check your details and try again",
    "auth/weak-password": "Password is too weak",
    "auth/too-many-requests": "Too many attempts. Please try again later",
    "auth/network-request-failed": "Network error. Please check your connection",
    "permission-denied": "You don't have permission to do this",
};

export const authErrorMessage = (error: unknown) => AUTH_ERROR_MESSAGES[(error as { code?: string })?.code ?? ""] ?? "Something went wrong. Please try again";