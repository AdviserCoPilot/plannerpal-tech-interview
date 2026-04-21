import { Router } from "express";
import * as classService from "../services/classService";
import { asyncHandler } from "../util/asyncHandler";

export const classesRouter = Router();

classesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await classService.listClasses());
  })
);

classesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await classService.getClassById(req.params.id));
  })
);
