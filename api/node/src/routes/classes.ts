import { Router } from "express";
import { pool } from "../db";

export const classesRouter = Router();

classesRouter.get("/", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM registrations r WHERE r.class_id = c.id AND r.status = 'registered') as registered_count
      FROM classes c
      ORDER BY c.start_time ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

classesRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM registrations r WHERE r.class_id = c.id AND r.status = 'registered') as registered_count
      FROM classes c
      WHERE c.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch class" });
  }
});
