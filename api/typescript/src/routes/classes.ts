import { Router } from "express";
import db from "../db";

export const classesRouter = Router();

classesRouter.get("/", async (_req, res) => {
  try {
    const classes = await db("classes as c")
      .select("c.*")
      .select(
        db("registrations as r")
          .count("*")
          .where("r.class_id", db.raw("c.id"))
          .andWhere("r.status", "registered")
          .as("registered_count")
      )
      .orderBy("c.start_time", "asc");
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

classesRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const row = await db("classes as c")
      .select("c.*")
      .select(
        db("registrations as r")
          .count("*")
          .where("r.class_id", db.raw("c.id"))
          .andWhere("r.status", "registered")
          .as("registered_count")
      )
      .where("c.id", id)
      .first();
    if (!row) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch class" });
  }
});
