jest.mock("@/lib/cloudinary", () => ({
    __esModule: true,
    default: { uploader: { destroy: jest.fn() } },
}));

import cloudinary from "@/lib/cloudinary";
import { deleteImageFromCloudinary } from "./deleteImageService";

const mockedDestroy = jest.mocked(cloudinary.uploader.destroy);

beforeEach(() => jest.resetAllMocks());

describe("deleteImageFromCloudinary", () => {
    it("memanggil destroy dengan public id", async () => {
        mockedDestroy.mockResolvedValue({ result: "ok" });

        await deleteImageFromCloudinary("pub-1");

        expect(mockedDestroy).toHaveBeenCalledWith("pub-1");
    });

    it.each(["ok", "not found"])("hasil '%s' dianggap berhasil", async (result) => {
        mockedDestroy.mockResolvedValue({ result });

        await expect(deleteImageFromCloudinary("pub-1")).resolves.toBeUndefined();
    });

    it("hasil lain dianggap gagal", async () => {
        mockedDestroy.mockResolvedValue({ result: "error" });

        await expect(deleteImageFromCloudinary("pub-1")).rejects.toThrow("Failed to delete image");
    });

    it.each(["", undefined, 123])(
        "public id %p: melempar error dan tidak memanggil destroy",
        async (publicId) => {
            await expect(deleteImageFromCloudinary(publicId as unknown as string)).rejects.toThrow(
                "Public ID is required",
            );
            expect(mockedDestroy).not.toHaveBeenCalled();
        },
    );
    
    it("error dari SDK diteruskan", async () => {
        mockedDestroy.mockRejectedValue(new Error("API down"));

        await expect(deleteImageFromCloudinary("pub-1")).rejects.toThrow("API down");
    });
});