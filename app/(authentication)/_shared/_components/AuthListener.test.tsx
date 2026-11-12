import { render, act } from "@testing-library/react";
import type { User } from "firebase/auth";

jest.mock("firebase/auth", () => ({
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn(),
}));
jest.mock("@/lib/firebase", () => ({ authFirebase: { name: "auth" } }));
jest.mock("../_services/authService", () => ({ getUserData: jest.fn() }));

import { onAuthStateChanged, signOut } from "firebase/auth";
import { authFirebase } from "@/lib/firebase";
import { authFlow } from "@/app/(authentication)/_shared/_store/authFlow";
import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";
import { getUserData } from "../_services/authService";
import AuthListener from "./AuthListener";

const mockedOnAuthStateChanged = jest.mocked(onAuthStateChanged);
const mockedSignOut = jest.mocked(signOut);
const mockedGetUserData = jest.mocked(getUserData);

const fbUser = { uid: "u1", email: "user@mail.com" } as unknown as User;
const userData = { uid: "u1", email: "user@mail.com", role: "seller" as const };

let emit: (user: User | null) => Promise<void>;
const unsubscribe = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
    authFlow.busy = false;
    useAuthStore.setState({ user: null, loading: true });
    mockedSignOut.mockResolvedValue(undefined);

    mockedOnAuthStateChanged.mockImplementation(((_auth: unknown, callback: (u: User | null) => Promise<void>) => {
        emit = callback;
        return unsubscribe;
    }) as never);
});

describe("AuthListener", () => {
    it("tidak merender apa pun dan mendaftar listener ke auth Firebase", () => {
        const { container } = render(<AuthListener />);

        expect(container).toBeEmptyDOMElement();
        expect(mockedOnAuthStateChanged).toHaveBeenCalledWith(authFirebase, expect.any(Function));
    });

    it("user Firebase ada dan data valid: store diisi dari getUserData", async () => {
        mockedGetUserData.mockResolvedValue(userData);
        render(<AuthListener />);

        await act(async () => {
            await emit(fbUser);
        });

        expect(mockedGetUserData).toHaveBeenCalledWith(fbUser);
        expect(useAuthStore.getState().user).toEqual(userData);
        expect(useAuthStore.getState().loading).toBe(false);
    });

    it("tidak ada user Firebase: store dikosongkan dan loading berhenti", async () => {
        useAuthStore.setState({ user: userData, loading: true });
        render(<AuthListener />);

        await act(async () => {
            await emit(null);
        });

        expect(useAuthStore.getState().user).toBeNull();
        expect(useAuthStore.getState().loading).toBe(false);
        expect(mockedGetUserData).not.toHaveBeenCalled();
    });

    it("data user tidak valid: signOut dan store dikosongkan", async () => {
        mockedGetUserData.mockRejectedValue(new Error("invalid"));
        render(<AuthListener />);

        await act(async () => {
            await emit(fbUser);
        });

        expect(mockedSignOut).toHaveBeenCalledWith(authFirebase);
        expect(useAuthStore.getState().user).toBeNull();
        expect(useAuthStore.getState().loading).toBe(false);
    });

    it("saat login/register sedang berjalan (authFlow.busy): event diabaikan", async () => {
        authFlow.busy = true;
        render(<AuthListener />);

        await act(async () => {
            await emit(fbUser);
        });

        expect(mockedGetUserData).not.toHaveBeenCalled();
        expect(mockedSignOut).not.toHaveBeenCalled();
        expect(useAuthStore.getState().user).toBeNull();
        expect(useAuthStore.getState().loading).toBe(true);
    });

    it("unmount: listener dilepas", () => {
        const { unmount } = render(<AuthListener />);
        unmount();
        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
});