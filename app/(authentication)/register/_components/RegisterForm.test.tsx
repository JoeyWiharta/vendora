import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../_hooks/useRegister", () => ({ useRegister: jest.fn() }));

import { useRegister } from "../_hooks/useRegister";
import RegisterForm from "./RegisterForm";

const mockedUseRegister = jest.mocked(useRegister);
const mutate = jest.fn();

const mockHook = (isPending = false) =>
    mockedUseRegister.mockReturnValue({ mutate, isPending } as unknown as ReturnType<typeof useRegister>);

const isDisabled = (el: HTMLElement) =>
    el.hasAttribute("disabled") ||
    el.getAttribute("aria-disabled") === "true" ||
    el.hasAttribute("data-disabled");

// urutan sesuai ROLE_OPTIONS: customer dulu, seller kedua
const getRadios = () => {
    const [customer, seller] = screen.getAllByRole("radio");
    return { customer, seller };
};

const setup = () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    return {
        user,
        email: screen.getByLabelText("Email"),
        password: screen.getByLabelText("Password"),
        confirm: screen.getByLabelText("Confirm password"),
        submit: screen.getByRole("button", { name: /sign up|loading/i }),
    };
};

const fillValid = async (s: ReturnType<typeof setup>) => {
    await s.user.type(s.email, "user@mail.com");
    await s.user.type(s.password, "password123");
    await s.user.type(s.confirm, "password123");
};

beforeEach(() => {
    jest.clearAllMocks();
    mockHook();
});

describe("RegisterForm", () => {
    it("menampilkan pilihan role (customer terpilih secara default), field, dan tombol", () => {
        const { submit } = setup();
        const { customer, seller } = getRadios();

        expect(customer).toBeChecked();
        expect(seller).not.toBeChecked();
        expect(submit).toHaveTextContent("Sign up");
    });

    it("punya link kembali ke halaman login", () => {
        setup();
        expect(screen.getByRole("link", { name: /login/i })).toHaveAttribute("href", "/login");
    });

    it("submit kosong: menampilkan semua pesan wajib diisi dan tidak memanggil register", async () => {
        const { user, submit } = setup();
        await user.click(submit);

        expect(await screen.findByText("Email is required")).toBeInTheDocument();
        expect(screen.getByText("Password is required")).toBeInTheDocument();
        expect(screen.getByText("Confirm password is required")).toBeInTheDocument();
        expect(mutate).not.toHaveBeenCalled();
    });

    it("format email tidak valid: menampilkan pesan", async () => {
        const s = setup();
        await s.user.type(s.email, "bukan-email");
        await s.user.type(s.password, "password123");
        await s.user.type(s.confirm, "password123");
        await s.user.click(s.submit);

        expect(await screen.findByText("Invalid email format")).toBeInTheDocument();
        expect(mutate).not.toHaveBeenCalled();
    });

    it("password kurang dari 8 karakter: menampilkan pesan", async () => {
        const s = setup();
        await s.user.type(s.email, "user@mail.com");
        await s.user.type(s.password, "short1");
        await s.user.type(s.confirm, "short1");
        await s.user.click(s.submit);

        expect(await screen.findByText("Password must be at least 8 characters")).toBeInTheDocument();
        expect(mutate).not.toHaveBeenCalled();
    });

    it("konfirmasi password tidak cocok: menampilkan pesan dan tidak register", async () => {
        const s = setup();
        await s.user.type(s.email, "user@mail.com");
        await s.user.type(s.password, "password123");
        await s.user.type(s.confirm, "beda123456");
        await s.user.click(s.submit);

        expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
        expect(mutate).not.toHaveBeenCalled();
    });

    it("data valid sebagai customer: register dipanggil tanpa confirmPassword", async () => {
        const s = setup();
        await fillValid(s);
        await s.user.click(s.submit);

        await screen.findByRole("button", { name: /sign up/i });
        expect(mutate).toHaveBeenCalledTimes(1);
        expect(mutate).toHaveBeenCalledWith({
            email: "user@mail.com",
            password: "password123",
            role: "customer",
        });
    });

    it("memilih seller: role seller ikut terkirim", async () => {
        const s = setup();
        await s.user.click(screen.getByText("Seller"));
        expect(getRadios().seller).toBeChecked();
        expect(getRadios().customer).not.toBeChecked();

        await fillValid(s);
        await s.user.click(s.submit);

        await screen.findByRole("button", { name: /sign up/i });
        expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ role: "seller" }));
    });

    it("tombol mata password dan confirm password bekerja terpisah", async () => {
        const { user, password, confirm } = setup();

        await user.click(screen.getByRole("button", { name: "Show password" }));
        expect(password).toHaveAttribute("type", "text");
        expect(confirm).toHaveAttribute("type", "password");

        await user.click(screen.getByRole("button", { name: "Show confirm password" }));
        expect(confirm).toHaveAttribute("type", "text");
    });

    it("saat pending: input dan tombol disabled, teks Loading...", () => {
        mockHook(true);
        const { email, password, confirm, submit } = setup();

        expect(email).toBeDisabled();
        expect(password).toBeDisabled();
        expect(confirm).toBeDisabled();
        expect(isDisabled(getRadios().customer)).toBe(true);
        expect(isDisabled(getRadios().seller)).toBe(true);
        expect(submit).toBeDisabled();
        expect(submit).toHaveTextContent("Loading...");
    });
});