import db from "../db";
import { ConflictError, NotFoundError } from "../errors";

const STATUS_REGISTERED = "registered";

export async function findByParent(parentId: string) {
  return db("registrations as r")
    .select("r.id", "r.class_id", "r.status", "c.name as class_name")
    .join("classes as c", "c.id", "r.class_id")
    .where("r.parent_id", parentId)
    .andWhere("r.status", STATUS_REGISTERED)
    .orderBy("c.start_time");
}

export async function findAll() {
  return db("registrations as r")
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
    .where("r.status", STATUS_REGISTERED)
    .orderBy("c.start_time")
    .orderBy("p.name");
}

export async function register(classId: string, parentId: string) {
  return db.transaction(async (trx) => {
    const classRow = await trx("classes")
      .select("capacity")
      .where("id", classId)
      .forUpdate()
      .first();
    if (!classRow) {
      throw new NotFoundError("Class not found");
    }

    const capacity = Number(classRow.capacity);
    const countResult = await trx("registrations")
      .count("* as count")
      .where("class_id", classId)
      .andWhere("status", STATUS_REGISTERED)
      .first();
    const registeredCount = countResult ? Number((countResult as { count: string | number }).count) : 0;

    if (registeredCount >= capacity) {
      throw new ConflictError("Class is full");
    }

    await trx("registrations")
      .insert({ class_id: classId, parent_id: parentId, status: STATUS_REGISTERED })
      .onConflict(["class_id", "parent_id"])
      .merge({ status: STATUS_REGISTERED });

    return { status: STATUS_REGISTERED, message: "Successfully registered for class" };
  });
}

export async function cancel(id: string) {
  const reg = await db("registrations")
    .select("*")
    .where("id", id)
    .andWhere("status", STATUS_REGISTERED)
    .first();
  if (!reg) {
    throw new NotFoundError("Registration not found");
  }

  await db("registrations").where("id", id).update({ status: "cancelled" });
}
