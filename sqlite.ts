import { Database } from "bun:sqlite";

export const doSetup = () => {
  const db = new Database(Bun.env.DATABASE_NAME, { create: true });
  const usersTable = db.query(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  usersTable.run();
  db.close();
};
