import { IDriver } from "./IDriver";
import { Database } from "better-sqlite3";

export class SqliteDriver implements IDriver {
    private static instance: SqliteDriver | null = null;
    private readonly database: Database;

    private constructor(path: string) {
        const sqlite3 = require("better-sqlite3");
        this.database = sqlite3(path);
    }

    public static createSingleton(path: string): SqliteDriver {
        if (!SqliteDriver.instance) {
            SqliteDriver.instance = new SqliteDriver(path);
        }
        return SqliteDriver.instance;
    }

    public async prepare(table: string): Promise<void> {
        await this.database.exec(`CREATE TABLE IF NOT EXISTS ${table} (ID TEXT PRIMARY KEY, json TEXT)`);
    }

    public async getAllRows(table: string): Promise<{ id: string; value: any }[]> {
        const prep = this.database.prepare(`SELECT * FROM ${table}`);
        const data = [];

        for (const row of prep.iterate()) {
            data.push({
                id: row.ID,
                value: JSON.parse(row.json),
            });
        }

        return data;
    }

    public async getRowByKey<T>(
        table: string,
        key: string
    ): Promise<[T | null, boolean]> {
        const value = await this.database
            .prepare(`SELECT json FROM ${table} WHERE ID = @key`)
            .get({ key });

        return value != null ? [JSON.parse(value.json), true] : [null, false];
    }

    public async setRowByKey<T>(
        table: string,
        key: string,
        value: any,
        update: boolean
    ): Promise<T> {
        const stringifiedJson = JSON.stringify(value);
        if (update) {
            await this.database
                .prepare(`UPDATE ${table} SET json = (?) WHERE ID = (?)`)
                .run(stringifiedJson, key);
        } else {
            await this.database
                .prepare(`INSERT INTO ${table} (ID,json) VALUES (?,?)`)
                .run(key, stringifiedJson);
        }

        return value;
    }

    public async deleteAllRows(table: string): Promise<number> {
        const result = await this.database.prepare(`DELETE FROM ${table}`).run();
        return result.changes;
    }

    public async deleteRowByKey(table: string, key: string): Promise<number> {
        const result = await this.database.prepare(`DELETE FROM ${table} WHERE ID=@key`).run({ key });
        return result.changes;
    }
}
