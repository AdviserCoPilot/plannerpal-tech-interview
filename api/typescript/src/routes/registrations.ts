import { Router } from "express";
import db from "../db";

export const registrationsRouter = Router();

registrationsRouter.get("/", async (req, res) => {
  try {
    const { parentId } = req.query;
    if (!parentId) {
      return res.status(400).json({ error: "parentId required" });
    }
    const registrations = await db("registrations as r")
      .select("r.id", "r.class_id", "r.status", "c.name as class_name")
      .join("classes as c", "c.id", "r.class_id")
      .where("r.parent_id", parentId as string)
      .andWhere("r.status", "registered")
      .orderBy("c.start_time");
    res.json({ registrations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

registrationsRouter.get("/all", async (_req, res) => {
  try {
    const rows = await db("registrations as r")
      .select(
        "r.id",
        "r.class_id",
        "c.name as class_name",
        "p.name as parent_name",
        "p.email as parent_email",
        "r.created_at"
      )
      .join("classes as c", "c.id", "r.class_id")
      .join("parents as p", "p.id", "r.parent_id")
      .where("r.status", "registered")
      .orderBy("c.start_time")
      .orderBy("p.name");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch all registrations" });
  }
});

registrationsRouter.post("/", async (req, res) => {
  try {
    const { classId, parentId } = req.body;
    if (!classId || !parentId) {
      return res.status(400).json({ error: "classId and parentId required" });
    }

    await db.transaction(async (trx) => {
      const classRow = await trx("classes")
        .select("capacity")
        .where("id", classId)
        .first();
      if (!classRow) {
        return res.status(404).json({ error: "Class not found" });
      }
      const capacity = parseInt(classRow.capacity, 10);

      const countResult = await trx("registrations")
        .count("* as count")
        .where("class_id", classId)
        .andWhere("status", "registered")
        .first();
      const registeredCount = parseInt((countResult as any).count, 10);

      if (registeredCount >= capacity) {
        return res.status(409).json({ error: "Class is full" });
      }

      await trx("registrations")
        .insert({
          class_id: classId,
          parent_id: parentId,
          status: "registered",
        })
        .onConflict(["class_id", "parent_id"])
        .merge({ status: "registered" });

      return res.status(201).json({
        status: "registered",
        message: "Successfully registered for class",
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register" });
  }
});

registrationsRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const reg = await db("registrations")
      .select("*")
      .where("id", id)
      .andWhere("status", "registered")
      .first();
    if (!reg) {
      return res.status(404).json({ error: "Registration not found" });
    }

    await db("registrations")
      .where("id", id)
      .update({ status: "cancelled" });

    res.json({ message: "Registration cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cancel" });
  }
});
