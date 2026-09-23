import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { FxPair } from "@/lib/constants";
import type { Bar } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "market.db");

let dbInstance: Database.Database | null = null;

export function getDbPath(): string {
  return DB_PATH;
}

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS fx_bars (
      pair TEXT NOT NULL,
      date TEXT NOT NULL,
      open REAL NOT NULL,
      high REAL NOT NULL,
      low REAL NOT NULL,
      close REAL NOT NULL,
      source TEXT NOT NULL,
      PRIMARY KEY (pair, date)
    );
    CREATE TABLE IF NOT EXISTS fx_meta (
      pair TEXT PRIMARY KEY,
      spot REAL NOT NULL,
      as_of TEXT NOT NULL,
      source TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_fx_bars_pair_date ON fx_bars(pair, date);
  `);

  dbInstance = db;
  return db;
}

export interface FxMetaRow {
  pair: string;
  spot: number;
  as_of: string;
  source: string;
  updated_at: string;
}

export function countBars(pair: FxPair): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS n FROM fx_bars WHERE pair = ?")
    .get(pair) as { n: number };
  return row.n;
}

export function latestBarDate(pair: FxPair): string | null {
  const row = getDb()
    .prepare(
      "SELECT date FROM fx_bars WHERE pair = ? ORDER BY date DESC LIMIT 1"
    )
    .get(pair) as { date: string } | undefined;
  return row?.date ?? null;
}

export function upsertBars(
  pair: FxPair,
  bars: Bar[],
  source: string
): number {
  if (bars.length === 0) return 0;
  const stmt = getDb().prepare(`
    INSERT INTO fx_bars (pair, date, open, high, low, close, source)
    VALUES (@pair, @date, @open, @high, @low, @close, @source)
    ON CONFLICT(pair, date) DO UPDATE SET
      open = excluded.open,
      high = excluded.high,
      low = excluded.low,
      close = excluded.close,
      source = excluded.source
  `);
  const tx = getDb().transaction((rows: Bar[]) => {
    for (const b of rows) {
      stmt.run({
        pair,
        date: b.date,
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
        source,
      });
    }
  });
  tx(bars);
  return bars.length;
}

export function getBars(pair: FxPair): Bar[] {
  return getDb()
    .prepare(
      `SELECT date, open, high, low, close
       FROM fx_bars WHERE pair = ?
       ORDER BY date ASC`
    )
    .all(pair) as Bar[];
}

export function getMeta(pair: FxPair): FxMetaRow | null {
  return (
    (getDb()
      .prepare(
        "SELECT pair, spot, as_of, source, updated_at FROM fx_meta WHERE pair = ?"
      )
      .get(pair) as FxMetaRow | undefined) ?? null
  );
}

export function upsertMeta(
  pair: FxPair,
  spot: number,
  asOf: string,
  source: string,
  updatedAt: string
): void {
  getDb()
    .prepare(
      `INSERT INTO fx_meta (pair, spot, as_of, source, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(pair) DO UPDATE SET
         spot = excluded.spot,
         as_of = excluded.as_of,
         source = excluded.source,
         updated_at = excluded.updated_at`
    )
    .run(pair, spot, asOf, source, updatedAt);
}
