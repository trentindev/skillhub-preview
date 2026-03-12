import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "skillhub",
  user: process.env.DB_USER || "skillhub",
  password: process.env.DB_PASSWORD || "skillhub",
});

export default pool;
