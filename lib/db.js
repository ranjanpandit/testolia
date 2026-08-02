import mysql from "mysql2/promise";

let pool;

function createPool() {
  const host = process.env.DB_HOST || "localhost";
  const isLocalHost =
    host === "localhost" || host === "127.0.0.1" || host === "::1";

  return mysql.createPool({
    host,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "testolia",
    port: Number(process.env.DB_PORT || 3306),
    ...(isLocalHost
      ? {}
      : {
          ssl: { rejectUnauthorized: false },
        }),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
  });
}

export const db = {
  query: async (...args) => {
    if (!pool) pool = createPool();
    return pool.query(...args);
  },
  getConnection: async () => {
    if (!pool) pool = createPool();
    return pool.getConnection();
  },
};
