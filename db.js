import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "M9C6C53RTEQR",
  port: 5432,
  database: "workout_db",
});

export default pool;
