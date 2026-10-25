import * as SQLite from 'expo-sqlite';

// Base de datos local de la app (SQLite). Se abre una sola vez y se comparte.
// Docs expo-sqlite: https://docs.expo.dev/versions/latest/sdk/sqlite/
//
// Para agregar una tabla nueva (por ejemplo la cola de visitas sin sincronizar), sumá
// otro CREATE TABLE IF NOT EXISTS dentro de crearTablas().
let promesaBD: Promise<SQLite.SQLiteDatabase> | null = null;

async function crearTablas(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS lugares (
      id TEXT PRIMARY KEY NOT NULL,
      json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS categorias (
      id TEXT PRIMARY KEY NOT NULL,
      json TEXT NOT NULL
    );
  `);
}

export function obtenerBD() {
  if (!promesaBD) {
    promesaBD = SQLite.openDatabaseAsync('miciudad.db').then(async (db) => {
      await crearTablas(db);
      return db;
    });
  }
  return promesaBD;
}
