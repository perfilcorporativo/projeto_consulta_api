import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface AddressRecord {
  id?: number;
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  searched_at?: string;
}

const currentDir = dirname(fileURLToPath(import.meta.url));
const databasePath = process.env.CEP_DB_PATH
  ? process.env.CEP_DB_PATH
  : join(currentDir, "..", "data", "runtime", "consultas.db");

mkdirSync(dirname(databasePath), { recursive: true });
export const db = new DatabaseSync(databasePath);

db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS consultas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cep TEXT NOT NULL UNIQUE,
    logradouro TEXT NOT NULL DEFAULT '',
    bairro TEXT NOT NULL DEFAULT '',
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    searched_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_consultas_searched_at
    ON consultas(searched_at DESC);
`);

export function getCachedAddress(cep: string): AddressRecord | undefined {
  return db.prepare("SELECT * FROM consultas WHERE cep = ?").get(cep) as AddressRecord | undefined;
}

export function saveAddress(address: AddressRecord): AddressRecord {
  db.prepare(`
    INSERT INTO consultas (cep, logradouro, bairro, cidade, estado, searched_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(cep) DO UPDATE SET
      logradouro = excluded.logradouro,
      bairro = excluded.bairro,
      cidade = excluded.cidade,
      estado = excluded.estado,
      searched_at = CURRENT_TIMESTAMP
  `).run(address.cep,address.logradouro,address.bairro,address.cidade,address.estado);

  return getCachedAddress(address.cep)!;
}

export function getHistory(limit = 10): AddressRecord[] {
  return db.prepare(
    "SELECT * FROM consultas ORDER BY searched_at DESC, id DESC LIMIT ?"
  ).all(limit) as AddressRecord[];
}
