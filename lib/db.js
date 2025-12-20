import mysql from "mysql2/promise";

let pool;

function createPool() {
  return mysql.createPool({
    host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
    user: "2X5erR8aRQTCmJ6.root",
    password: "RElRtdQ5I8z8UV76",
    database: "testolia",
    port: Number(process.env.DB_PORT || 4000),

    // ✅ REQUIRED for TiDB Cloud
    ssl: { rejectUnauthorized: true },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
  });
}

// ✅ KEEP SAME EXPORT NAME
export const db = {
  query: async (...args) => {
    if (!pool) {
      pool = createPool();
    }
    return pool.query(...args);
  },
};
