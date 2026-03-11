import app from "./app";
import db from "./db";

const PORT = process.env.PORT || 4000;

(async () => {
  await db.migrate.latest();
  app.listen(PORT, () => {
    console.log(`Atlas Academy API running at http://localhost:${PORT}`);
  });
})();
