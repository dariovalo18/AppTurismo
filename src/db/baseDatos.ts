import * as SQLite from 'expo-sqlite';

// Base de datos local de la app (SQLite). Se abre una sola vez y se comparte.
// Docs expo-sqlite: https://docs.expo.dev/versions/latest/sdk/sqlite/
//
// Para agregar una tabla nueva, sumá otro CREATE TABLE IF NOT EXISTS dentro de crearTablas().
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

    -- PERSONA 4: visitas del recorrido. Es a la vez el recorrido que se ve sin señal
    -- y la cola de subida (sincronizada = 0 -> falta subir al servidor).
    --   id      : lo genera la app y es el mismo que usa el servidor (POST /yo/visitas es idempotente por id)
    --   fotoUri : ruta de la foto en el teléfono
    --   fotoUrl : url de la foto ya subida con POST /archivos
    CREATE TABLE IF NOT EXISTS visitas (
      id TEXT PRIMARY KEY NOT NULL,
      usuarioId TEXT NOT NULL,
      lugarId TEXT NOT NULL,
      fechaHora TEXT NOT NULL,
      origen TEXT NOT NULL,
      fotoUri TEXT,
      fotoUrl TEXT,
      nota TEXT,
      sincronizada INTEGER NOT NULL DEFAULT 0
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
