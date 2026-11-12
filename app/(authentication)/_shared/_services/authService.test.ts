jest.mock("firebase/auth", () => ({
    createUserWithEmailAndPassword: jest.fn(),
    deleteUser: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    setPersistence: jest.fn(),
    browserLocalPersistence: { type: "LOCAL" },
    browserSessionPersistence: { type: "SESSION" },
}));
jest.mock("firebase/firestore", () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    serverTimestamp: jest.fn(),
}));
jest.mock("@/lib/firebase", () => ({
    authFirebase: { name: "auth" },
    dbFirebase: { name: "db" },
}));

import {
    createUserWithEmailAndPassword,
    deleteUser,
    signInWithEmailAndPassword,
    signOut,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { authFirebase, dbFirebase } from "@/lib/firebase";
import { authFlow } from "@/app/(authentication)/_shared/_store/authFlow";
import { getUserData, loginUser, registerUser, logoutUser } from "./authService";

const mockedDoc = jest.mocked(doc);
const mockedGetDoc = jest.mocked(getDoc);
const mockedSetDoc = jest.mocked(setDoc);
const mockedServerTimestamp = jest.mocked(serverTimestamp);
const mockedSignIn = jest.mocked(signInWithEmailAndPassword);
const mockedCreateUser = jest.mocked(createUserWithEmailAndPassword);
const mockedSignOut = jest.mocked(signOut);
const mockedDeleteUser = jest.mocked(deleteUser);
const mockedSetPersistence = jest.mocked(setPersistence);

const fbUser = { uid: "u1", email: "user@mail.com" } as unknown as User;
const docRef = { path: "master-users/u1" };

const snapshot = (data?: Record<string, unknown>) =>
    ({ exists: () => data !== undefined, data: () => data }) as never;

const validDoc = { uid: "u1", email: "user@mail.com", role: "customer" };

beforeEach(() => {
    jest.resetAllMocks();
    mockedDoc.mockReturnValue(docRef as never);
    mockedServerTimestamp.mockReturnValue("SERVER_TS" as never);
    mockedSetPersistence.mockResolvedValue(undefined);
    mockedSignOut.mockResolvedValue(undefined);
    mockedDeleteUser.mockResolvedValue(undefined);
    mockedSetDoc.mockResolvedValue(undefined);
    authFlow.busy = false;
});

describe("getUserData", () => {
    it("mengembalikan data user dari master-users", async () => {
        mockedGetDoc.mockResolvedValue(snapshot({ ...validDoc, role: "seller" }));

        await expect(getUserData(fbUser)).resolves.toEqual({
            uid: "u1",
            email: "user@mail.com",
            role: "seller",
        });
        expect(mockedDoc).toHaveBeenCalledWith(dbFirebase, "master-users", "u1");
    });

    it("melempar pesan login generik jika dokumen user tidak ada", async () => {
        mockedGetDoc.mockResolvedValue(snapshot(undefined));
        await expect(getUserData(fbUser)).rejects.toThrow("Invalid email or password");
    });

    it.each([
        ["uid tidak cocok", { ...validDoc, uid: "lain" }],
        ["email tidak cocok", { ...validDoc, email: "lain@mail.com" }],
        ["role tidak valid", { ...validDoc, role: "admin" }],
        ["role kosong", { uid: "u1", email: "user@mail.com" }],
    ])("melempar error data tidak valid jika %s", async (_label, data) => {
        mockedGetDoc.mockResolvedValue(snapshot(data));
        await expect(getUserData(fbUser)).rejects.toThrow(
            "Your account data is invalid. Please contact support",
        );
    });
});

describe("loginUser", () => {
    const payload = { email: "user@mail.com", password: "secret", rememberMe: true };

    beforeEach(() => {
        mockedSignIn.mockResolvedValue({ user: fbUser } as never);
        mockedGetDoc.mockResolvedValue(snapshot(validDoc));
    });

    it("sukses: memanggil Firebase dengan kredensial dan mengembalikan UserData", async () => {
        await expect(loginUser(payload)).resolves.toEqual({
            uid: "u1",
            email: "user@mail.com",
            role: "customer",
        });
        expect(mockedSignIn).toHaveBeenCalledWith(authFirebase, "user@mail.com", "secret");
    });

    it("rememberMe true memakai local persistence", async () => {
        await loginUser({ ...payload, rememberMe: true });
        expect(mockedSetPersistence).toHaveBeenCalledWith(authFirebase, browserLocalPersistence);
    });

    it("rememberMe false memakai session persistence", async () => {
        await loginUser({ ...payload, rememberMe: false });
        expect(mockedSetPersistence).toHaveBeenCalledWith(authFirebase, browserSessionPersistence);
    });

    it("gagal sign in: error diteruskan dan tidak signOut", async () => {
        const error = Object.assign(new Error("x"), { code: "auth/invalid-credential" });
        mockedSignIn.mockRejectedValue(error);

        await expect(loginUser(payload)).rejects.toBe(error);
        expect(mockedSignOut).not.toHaveBeenCalled();
    });

    it("akun ada di Auth tapi tidak ada di master-users: signOut lalu melempar error", async () => {
        mockedGetDoc.mockResolvedValue(snapshot(undefined));

        await expect(loginUser(payload)).rejects.toThrow("Invalid email or password");
        expect(mockedSignOut).toHaveBeenCalledWith(authFirebase);
    });

    it("authFlow.busy true selama proses dan kembali false setelahnya", async () => {
        let busyDuring: boolean | undefined;
        mockedSignIn.mockImplementation(async () => {
            busyDuring = authFlow.busy;
            return { user: fbUser } as never;
        });

        await loginUser(payload);
        expect(busyDuring).toBe(true);
        expect(authFlow.busy).toBe(false);
    });

    it("authFlow.busy kembali false walaupun gagal", async () => {
        mockedSignIn.mockRejectedValue(new Error("boom"));
        await expect(loginUser(payload)).rejects.toThrow();
        expect(authFlow.busy).toBe(false);
    });
});

describe("registerUser", () => {
    const payload = {
        role: "seller",
        email: "user@mail.com",
        password: "password123",
        confirmPassword: "password123",
    } as Parameters<typeof registerUser>[0];

    beforeEach(() => {
        mockedCreateUser.mockResolvedValue({ user: fbUser } as never);
    });

    it("sukses: membuat akun, menyimpan role di master-users, dan mengembalikan UserData", async () => {
        await expect(registerUser(payload)).resolves.toEqual({
            uid: "u1",
            email: "user@mail.com",
            role: "seller",
        });

        expect(mockedSetPersistence).toHaveBeenCalledWith(authFirebase, browserLocalPersistence);
        expect(mockedCreateUser).toHaveBeenCalledWith(authFirebase, "user@mail.com", "password123");
        expect(mockedDoc).toHaveBeenCalledWith(dbFirebase, "master-users", "u1");
        expect(mockedSetDoc).toHaveBeenCalledWith(docRef, {
            uid: "u1",
            email: "user@mail.com",
            role: "seller",
            createdAt: "SERVER_TS",
        });
    });

    it("tidak menyimpan password ke Firestore", async () => {
        await registerUser(payload);
        const saved = mockedSetDoc.mock.calls[0][1] as Record<string, unknown>;
        expect(saved).not.toHaveProperty("password");
        expect(saved).not.toHaveProperty("confirmPassword");
    });

    it("gagal membuat akun: tidak menulis Firestore dan error diteruskan", async () => {
        const error = Object.assign(new Error("x"), { code: "auth/email-already-in-use" });
        mockedCreateUser.mockRejectedValue(error);

        await expect(registerUser(payload)).rejects.toBe(error);
        expect(mockedSetDoc).not.toHaveBeenCalled();
        expect(mockedDeleteUser).not.toHaveBeenCalled();
    });

    it("gagal menulis Firestore: akun Auth dihapus (rollback) dan error diteruskan", async () => {
        mockedSetDoc.mockRejectedValue(new Error("firestore down"));

        await expect(registerUser(payload)).rejects.toThrow("firestore down");
        expect(mockedDeleteUser).toHaveBeenCalledWith(fbUser);
    });

    it("rollback gagal pun tetap melempar error aslinya", async () => {
        mockedSetDoc.mockRejectedValue(new Error("firestore down"));
        mockedDeleteUser.mockRejectedValue(new Error("delete failed"));

        await expect(registerUser(payload)).rejects.toThrow("firestore down");
    });

    it("authFlow.busy kembali false setelah sukses maupun gagal", async () => {
        await registerUser(payload);
        expect(authFlow.busy).toBe(false);

        mockedCreateUser.mockRejectedValue(new Error("boom"));
        await expect(registerUser(payload)).rejects.toThrow();
        expect(authFlow.busy).toBe(false);
    });
});

describe("logoutUser", () => {
    it("memanggil signOut dengan instance auth", async () => {
        await logoutUser();
        expect(mockedSignOut).toHaveBeenCalledWith(authFirebase);
    });
});