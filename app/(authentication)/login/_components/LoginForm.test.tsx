import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../_hooks/useLogin", () => ({ useLogin: jest.fn() }));

import { useLogin } from "../_hooks/useLogin";
import LoginForm from "./LoginForm";

const mockedUseLogin = jest.mocked(useLogin);
const mutate = jest.fn();

const mockHook = (isPending = false) =>
    mockedUseLogin.mockReturnValue({ mutate, isPending } as unknown as ReturnType<typeof useLogin>);

const isDisabled = (el: HTMLElement) =>
    el.hasAttribute("disabled") ||
    el.getAttribute("aria-disabled") === "true" ||
    el.hasAttribute("data-disabled");

const getRemember = () => screen.getByRole("checkbox");

const setup = () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    return {
        user,
        email: screen.getByLabelText("Email"),
        password: screen.getByLabelText("Password"),
        submit: screen.getByRole("button", { name: /login|loading/i }),
    };
};

beforeEach(() => {
    jest.clearAllMocks();
    mockHook();
});

describe("LoginForm", () => {
    it("menampilkan field email, password, remember me, dan tombol login", () => {
        const { email, password, submit } = setup();

        expect(email).toBeInTheDocument();
        expect(password).toHaveAttribute("type", "password");
        expect(getRemember()).toBeChecked();
        expect(submit).toHaveTextContent("Login");
    });

    it("punya link ke halaman register", () => {
        setup();
        expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/register");
    });

    it("submit dengan email dan password kosong: menampilkan pesan wajib diisi dan tidak memanggil login", async () => {
        const { user, password, submit } = setup();
        await user.clear(password);
        await user.click(submit);

        expect(await screen.findByText("Email is required")).toBeInTheDocument();
        expect(screen.getByText("Password is required")).toBeInTheDocument();
        expect(mutate).not.toHaveBeenCalled();
    });

    it("format email tidak valid: menampilkan pesan dan tidak memanggil login", async () => {
        const { user, email, password, submit } = setup();
        await user.type(email, "bukan-email");
        await user.clear(password);
        await user.type(password, "secret");
        await user.click(submit);

        expect(await screen.findByText("Invalid email format")).toBeInTheDocument();
        expect(mutate).not.toHaveBeenCalled();
    });

    it("data valid: memanggil login dengan email, password, dan rememberMe", async () => {
        const { user, email, password, submit } = setup();
        await user.type(email, "user@mail.com");
        await user.clear(password);
        await user.type(password, "secret123");
        await user.click(submit);

        await screen.findByRole("button", { name: /login/i });
        expect(mutate).toHaveBeenCalledTimes(1);
        expect(mutate).toHaveBeenCalledWith({
            email: "user@mail.com",
            password: "secret123",
            rememberMe: true,
        });
    });

    it("rememberMe di-uncheck: nilai false ikut terkirim", async () => {
        const { user, email, password, submit } = setup();
        await user.type(email, "user@mail.com");
        await user.clear(password);
        await user.type(password, "secret123");
        await user.click(screen.getByText("Remember me"));
        expect(getRemember()).not.toBeChecked();
        await user.click(submit);

        await screen.findByRole("button", { name: /login/i });
        expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ rememberMe: false }));
    });

    it("tombol mata menampilkan dan menyembunyikan password", async () => {
        const { user, password } = setup();

        await user.click(screen.getByRole("button", { name: "Show password" }));
        expect(password).toHaveAttribute("type", "text");

        await user.click(screen.getByRole("button", { name: "Hide password" }));
        expect(password).toHaveAttribute("type", "password");
    });

    it("saat pending: input dan tombol disabled, teks berubah menjadi Loading...", () => {
        mockHook(true);
        const { email, password, submit } = setup();

        expect(email).toBeDisabled();
        expect(password).toBeDisabled();
        expect(isDisabled(getRemember())).toBe(true);
        expect(submit).toBeDisabled();
        expect(submit).toHaveTextContent("Loading...");
    });
});