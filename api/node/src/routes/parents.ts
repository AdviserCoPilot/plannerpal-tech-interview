import { Router } from "express";
import { pool } from "../db";

export const parentsRouter = Router();

parentsRouter.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name FROM parents ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch parents" });
  }
});
