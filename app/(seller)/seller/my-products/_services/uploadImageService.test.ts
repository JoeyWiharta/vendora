import { uploadImageToCloudinary } from "./uploadImageService";

const ORIGINAL_ENV = process.env;
const mockFetch = jest.fn();

const file = new File(["x"], "photo.png", { type: "image/png" });

const jsonResponse = (ok: boolean, body: unknown) =>
    ({ ok, json: () => Promise.resolve(body) }) as unknown as Response;

beforeEach(() => {
    jest.resetAllMocks();
    process.env = {
        ...ORIGINAL_ENV,
        NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "demo-cloud",
        NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: "demo-preset",
    };
    global.fetch = mockFetch as unknown as typeof fetch;
});

afterAll(() => {
    process.env = ORIGINAL_ENV;
});

describe("uploadImageToCloudinary", () => {
    it("mengirim POST ke endpoint Cloudinary sesuai cloud name", async () => {
        mockFetch.mockResolvedValue(jsonResponse(true, { secure_url: "u", public_id: "p" }));

        await uploadImageToCloudinary(file);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toBe("https://api.cloudinary.com/v1_1/demo-cloud/image/upload");
        expect(options.method).toBe("POST");
    });

    it("body berisi file dan upload_preset", async () => {
        mockFetch.mockResolvedValue(jsonResponse(true, { secure_url: "u", public_id: "p" }));

        await uploadImageToCloudinary(file);

        const body = mockFetch.mock.calls[0][1].body as FormData;
        expect(body.get("upload_preset")).toBe("demo-preset");
        expect((body.get("file") as File).name).toBe("photo.png");
    });

    it("mengembalikan hanya secure_url dan public_id", async () => {
        mockFetch.mockResolvedValue(
            jsonResponse(true, { secure_url: "https://img/1.png", public_id: "pub-1", bytes: 123 }),
        );

        await expect(uploadImageToCloudinary(file)).resolves.toEqual({
            secure_url: "https://img/1.png",
            public_id: "pub-1",
        });
    });

    it("cloud name tidak ada: melempar error konfigurasi dan tidak memanggil fetch", async () => {
        delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

        await expect(uploadImageToCloudinary(file)).rejects.toThrow("Cloudinary configuration is missing");
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("upload preset tidak ada: melempar error konfigurasi", async () => {
        delete process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        await expect(uploadImageToCloudinary(file)).rejects.toThrow("Cloudinary configuration is missing");
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("respons gagal: memakai pesan error dari Cloudinary", async () => {
        mockFetch.mockResolvedValue(jsonResponse(false, { error: { message: "Invalid preset" } }));

        await expect(uploadImageToCloudinary(file)).rejects.toThrow("Invalid preset");
    });

    it("respons gagal tanpa pesan: memakai pesan default", async () => {
        mockFetch.mockResolvedValue(jsonResponse(false, {}));

        await expect(uploadImageToCloudinary(file)).rejects.toThrow("Failed to upload image");
    });

    it("error jaringan diteruskan", async () => {
        mockFetch.mockRejectedValue(new Error("Network down"));

        await expect(uploadImageToCloudinary(file)).rejects.toThrow("Network down");
    });
});