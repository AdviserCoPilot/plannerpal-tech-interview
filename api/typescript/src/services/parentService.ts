import db from "../db";

export async function listParents() {
  return db("parents").select("id", "email", "name").orderBy("name");
}
