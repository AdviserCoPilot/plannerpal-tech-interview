import { Router } from "express";
import { pool } from "../db";

export const registrationsRouter = Router();

registrationsRouter.get("/", async (req, res) => {
  try {
    const { parentId } = req.query;
    if (!parentId) {
      return res.status(400).json({ error: "parentId required" });
    }
    const result = await pool.query(
      `SELECT r.id, r.class_id, r.status, c.name as class_name
       FROM registrations r
       JOIN classes c ON c.id = r.class_id
       WHERE r.parent_id = $1 AND r.status = 'registered'
       ORDER BY c.start_time`,
      [parentId]
    );
    res.json({ registrations: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

registrationsRouter.get("/all", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.class_id, c.name as class_name,
              p.name as parent_name, p.email as parent_email,
              r.created_at
       FROM registrations r
       JOIN classes c ON c.id = r.class_id
       JOIN parents p ON p.id = r.parent_id
       WHERE r.status = 'registered'
       ORDER BY c.start_time, p.name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch all registrations" });
  }
});

registrationsRouter.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const { classId, parentId } = req.body;
    if (!classId || !parentId) {
      return res.status(400).json({ error: "classId and parentId required" });
    }

    const classResult = await client.query(
      "SELECT capacity FROM classes WHERE id = $1",
      [classId]
    );
    if (classResult.rows.length === 0) {
      return res.status(404).json({ error: "Class not found" });
    }
    const capacity = parseInt(classResult.rows[0].capacity, 10);

    const regCount = await client.query(
      `SELECT COUNT(*) as count FROM registrations WHERE class_id = $1 AND status = 'registered'`,
      [classId]
    );
    const registeredCount = parseInt(regCount.rows[0].count, 10);

    if (registeredCount >= capacity) {
      return res.status(409).json({ error: "Class is full" });
    }

    await client.query(
      `INSERT INTO registrations (class_id, parent_id, status)
       VALUES ($1, $2, 'registered')
       ON CONFLICT (class_id, parent_id)
       DO UPDATE SET status = 'registered'`,
      [classId, parentId]
    );
    return res.status(201).json({
      status: "registered",
      message: "Successfully registered for class",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register" });
  } finally {
    client.release();
  }
});

registrationsRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const reg = await pool.query(
      "SELECT * FROM registrations WHERE id = $1 AND status = 'registered'",
      [id]
    );
    if (reg.rows.length === 0) {
      return res.status(404).json({ error: "Registration not found" });
    }

    await pool.query(
      "UPDATE registrations SET status = 'cancelled' WHERE id = $1",
      [id]
    );

    res.json({ message: "Registration cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cancel" });
  }
});
