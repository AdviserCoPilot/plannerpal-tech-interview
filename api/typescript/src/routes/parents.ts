import { Router } from "express";
import db from "../db";

export const parentsRouter = Router();

parentsRouter.get("/", async (_req, res) => {
  try {
    const parents = await db("parents")
      .select("id", "email", "name")
      .orderBy("name");
    res.json(parents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch parents" });
  }
});
