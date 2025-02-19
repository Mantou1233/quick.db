import { QuickDB } from "../src";
import { EntryGenerator } from "./generators/EntryGenerator";
import { faker } from "@faker-js/faker";
import { SqliteDriverMock } from "./mocks/SqliteDriver";

const db = new QuickDB({
    driver: new SqliteDriverMock("test.sqlite"),
});

describe("shift", () => {
    afterEach(async () => {
        SqliteDriverMock.mockClear();
        await db.deleteAll();
    });

    describe("no initial data", () => {
        afterEach(async () => {
            SqliteDriverMock.mockClear();
            await db.deleteAll();
        });

        it("should shift entry no data return undefined", async () => {
            const entry = EntryGenerator.generateEntry<number>(
                faker.datatype.number
            );
            const returned = await db.shift(entry.id);
            expect(returned).toEqual(undefined);
        });
    });

    describe("with initial data", () => {
        beforeEach(async () => {
            await db.set("test", [5, 6]);
            await db.set("object", { test: [10, 19] });
        });

        afterEach(async () => {
            SqliteDriverMock.mockClear();
            await db.deleteAll();
        });

        it("should shift entry", async () => {
            const returned = await db.shift("test");
            const result = await db.get("test");
            expect(result).toEqual([6]);
            expect(returned).toEqual(5);
        });

        it("should shift from object property", async () => {
            const returned = await db.shift("object.test");
            const result = await db.get("object.test");
            expect(result).toEqual([19]);
            expect(returned).toEqual(10);
        });
    });
});
