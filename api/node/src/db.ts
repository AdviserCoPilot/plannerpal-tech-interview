import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL || "postgresql://atlas:atlas@localhost:5432/atlas_academy";

export const pool = new Pool({ connectionString });
