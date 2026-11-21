import { shuffle } from "./shuffle";

describe("shuffle", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("menghasilkan array dengan elemen yang sama", () => {
        const input = [1, 2, 3, 4, 5];

        const result = shuffle(input);

        expect(result).toHaveLength(input.length);
        expect(result).toEqual(expect.arrayContaining(input));
    });

    it("tidak mengubah array asli", () => {
        const input = [1, 2, 3, 4];

        shuffle(input);

        expect(input).toEqual([1, 2, 3, 4]);
    });

    it("mengembalikan array kosong ketika input kosong", () => {
        expect(shuffle([])).toEqual([]);
    });

    it("mengembalikan array dengan satu elemen tanpa perubahan", () => {
        expect(shuffle([1])).toEqual([1]);
    });

    it("menjalankan pertukaran elemen berdasarkan indeks acak", () => {
        jest.spyOn(Math, "random")
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0);

        const result = shuffle([1, 2, 3]);

        expect(result).toEqual([2, 3, 1]);
        expect(Math.random).toHaveBeenCalledTimes(2);
    });

    it("tetap menghasilkan urutan sama ketika indeks acak sama dengan indeks saat ini", () => {
        jest.spyOn(Math, "random").mockReturnValue(0.99);

        const result = shuffle([1, 2, 3]);

        expect(result).toEqual([1, 2, 3]);
    });
});