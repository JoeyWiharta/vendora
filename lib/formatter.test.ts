import { formatDate, formatFileSize, formatNumber, formatRupiah } from "./formatter";

describe("formatRupiah", () => {
    it("memformat dengan prefix Rp dan pemisah ribuan titik", () => {
        expect(formatRupiah(150000)).toBe("Rp150.000");
        expect(formatRupiah(1250000)).toBe("Rp1.250.000");
    });

    it.each([undefined, NaN, Infinity])("nilai %p menjadi Rp0", (v) => {
        expect(formatRupiah(v)).toBe("Rp0");
    });
});

describe("formatNumber", () => {
    it("memformat dengan pemisah ribuan", () => {
        expect(formatNumber(1234567)).toBe("1.234.567");
    });

    it.each([undefined, NaN])("nilai %p menjadi 0", (v) => {
        expect(formatNumber(v)).toBe("0");
    });
});

describe("formatFileSize", () => {
    it("di bawah 1 MB memakai KB", () => {
        expect(formatFileSize(512 * 1024)).toBe("512 KB");
    });

    it("1 MB ke atas memakai MB satu desimal", () => {
        expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
    });
});

describe("formatDate", () => {
    it("memformat tanggal gaya medium en-GB", () => {
        expect(formatDate(new Date(2025, 0, 5))).toBe("5 Jan 2025");
    });
});