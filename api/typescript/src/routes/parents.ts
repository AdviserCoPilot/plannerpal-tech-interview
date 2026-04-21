import { Router } from "express";
import * as parentService from "../services/parentService";
import { asyncHandler } from "../util/asyncHandler";

export const parentsRouter = Router();

parentsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await parentService.listParents());
  })
);
