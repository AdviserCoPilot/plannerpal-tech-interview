import db from "../db";
import { NotFoundError } from "../errors";

export async function listClasses() {
  return db("classes as c")
    .select("c.*")
    .select(
      db("registrations as r")
        .count("*")
        .where("r.class_id", db.raw("c.id"))
        .andWhere("r.status", "registered")
        .as("registered_count")
    )
    .orderBy("c.start_time", "asc");
}

export async function getClassById(id: string) {
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
    throw new NotFoundError("Class not found");
  }
  return row;
}
