// IndexedDB durable storage — the source of truth for all user data.
//
// This is the ONLY module that talks to IndexedDB. store.ts mirrors these
// stores into an in-memory cache so the (synchronous) compute engine never has
// to await IO. Everything here is async; nothing here imports a feature module,
// so there are no import cycles.

import { openDB, type IDBPDatabase } from "idb";

export const DB_NAME = "uspsa-trainer";
export const DB_VERSION = 1;

// Keyed ("kv") stores hold out-of-line values addressed by an explicit string
// key. Collection stores hold records keyed by their own `id`.
export type StoreName = "profile" | "sessions" | "runs" | "plans" | "meta";

let dbPromise: Promise<IDBPDatabase> | null = null;

function isAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function db(): Promise<IDBPDatabase> {
  if (!isAvailable()) {
    return Promise.reject(new Error("IndexedDB unavailable (server or unsupported environment)"));
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(database, oldVersion) {
        // v1 = initial schema. migrate(fromVersion) grows here as the schema
        // evolves; each case falls through so an old client catches every step.
        if (oldVersion < 1) {
          database.createObjectStore("profile"); // kv: "current"
          database.createObjectStore("sessions", { keyPath: "id" });
          database.createObjectStore("runs", { keyPath: "id" });
          database.createObjectStore("plans"); // kv: session_plan / plan_progress / constraints
          database.createObjectStore("meta"); // kv: schemaVersion / imported_matches / ble_last_device / flags
        }
      },
    });
  }
  return dbPromise;
}

/** Whole-collection read (sessions, runs). */
export async function getAll<T>(store: StoreName): Promise<T[]> {
  return (await db()).getAll(store) as Promise<T[]>;
}

/** Upsert a record into a keyPath collection store. */
export async function put<T>(store: StoreName, value: T): Promise<void> {
  await (await db()).put(store, value);
}

/** Bulk upsert into a keyPath collection store, in one transaction. */
export async function putAll<T>(store: StoreName, values: T[]): Promise<void> {
  const database = await db();
  const tx = database.transaction(store, "readwrite");
  await Promise.all([...values.map((v) => tx.store.put(v)), tx.done]);
}

export async function remove(store: StoreName, key: string): Promise<void> {
  await (await db()).delete(store, key);
}

export async function clear(store: StoreName): Promise<void> {
  await (await db()).clear(store);
}

// ── keyed (kv) access, for profile / plans / meta ──

export async function getKV<T>(store: StoreName, key: string): Promise<T | undefined> {
  return (await db()).get(store, key) as Promise<T | undefined>;
}

export async function getAllKV<T>(store: StoreName): Promise<Array<[string, T]>> {
  const database = await db();
  const keys = await database.getAllKeys(store);
  const values = await database.getAll(store);
  return keys.map((k, i) => [String(k), values[i] as T]);
}

export async function putKV<T>(store: StoreName, key: string, value: T): Promise<void> {
  await (await db()).put(store, value, key);
}

export async function removeKV(store: StoreName, key: string): Promise<void> {
  await (await db()).delete(store, key);
}

/** Test/reset helper — drop the whole database and reset the connection. */
export async function deleteDatabase(): Promise<void> {
  if (dbPromise) {
    (await dbPromise).close();
    dbPromise = null;
  }
  if (!isAvailable()) return;
  const { deleteDB } = await import("idb");
  await deleteDB(DB_NAME);
}
