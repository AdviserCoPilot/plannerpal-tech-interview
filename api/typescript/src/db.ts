import knex from "knex";

const db = knex({
  client: "pg",
  connection: process.env.DATABASE_URL || "postgresql://atlas:atlas@localhost:5432/atlas_academy",
});

export default db;
