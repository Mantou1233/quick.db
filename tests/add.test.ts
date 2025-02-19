import { QuickDB } from "../src";
import { EntryGenerator } from "./generators/EntryGenerator";
import { faker } from "@faker-js/faker";
import { SqliteDriverMock } from "./mocks/SqliteDriver";

const db = new QuickDB({
    driver: new SqliteDriverMock("test.sqlite"),
});

describe("add", () => {
    afterEach(async () => {
        SqliteDriverMock.mockClear();
        await db.deleteAll();
    });

    describe("no initial data", () => {
        afterEach(async () => {
            SqliteDriverMock.mockClear();
            await db.deleteAll();
        });

        it("should add entry", async () => {
            const entry = EntryGenerator.generateEntry<number>(
                faker.datatype.number
            );
            const returned = await db.add(entry.id, entry.value);
            const result = await db.get(entry.id);
            expect(result).toEqual(entry.value);
            expect(returned).toEqual(entry.value);
        });

        it("should add entry convert string to number", async () => {
            const entry = EntryGenerator.generateEntry<number>(
                faker.datatype.number
            );
            entry.value = entry.value.toString() as any;
            const returned = await db.add(entry.id, entry.value);
            const result = await db.get(entry.id);
            expect(result).toEqual(Number(entry.value));
            expect(returned).toEqual(Number(entry.value));
        });

        it("should add from object property", async () => {
            const entry = EntryGenerator.generateComplexEntry<number>(
                faker.datatype.number
            );
            const returned = await db.add(entry.id, entry.value);
            const result = await db.get(entry.id);
            expect(result).toEqual(entry.value);
            expect(returned).toEqual(entry.value);
        });
    });

    describe("with initial data", () => {
        beforeEach(async () => {
            await db.set("test", 5);
            await db.set("string", "5");
            await db.set("object", { test: 10 });
        });

        afterEach(async () => {
            SqliteDriverMock.mockClear();
            await db.deleteAll();
        });

        it("should add entry", async () => {
            const returned = await db.add("test", 10);
            const result = await db.get("test");
            expect(result).toEqual(15);
            expect(returned).toEqual(15);
        });

        it("should add entry convert string to number", async () => {
            const returned = await db.add("string", 10);
            const result = await db.get("string");
            expect(result).toEqual(15);
            expect(returned).toEqual(15);
        });

        it("should add entry convert string to number with db string", async () => {
            const returned = await db.add("string", "10" as any);
            const result = await db.get("string");
            expect(result).toEqual(15);
            expect(returned).toEqual(15);
        });

        it("should add object property", async () => {
            const returned = await db.add("object.test", 10);
            const result = await db.get("object");
            expect(result).toEqual({ test: 20 });
            expect(returned).toEqual(20);
        });
    });
});
