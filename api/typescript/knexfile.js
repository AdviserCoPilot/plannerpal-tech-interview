module.exports = {
  client: "pg",
  connection: process.env.DATABASE_URL || "postgresql://atlas:atlas@localhost:5432/atlas_academy",
  migrations: {
    directory: "./migrations",
  },
};
