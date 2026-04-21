import { Router } from "express";
import { parentIdQuerySchema, registerSchema } from "../schemas";
import * as registrationService from "../services/registrationService";
import { asyncHandler } from "../util/asyncHandler";

export const registrationsRouter = Router();

registrationsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { parentId } = parentIdQuerySchema.parse(req.query);
    const registrations = await registrationService.findByParent(parentId);
    res.json({ registrations });
  })
);

registrationsRouter.get(
  "/all",
  asyncHandler(async (_req, res) => {
    res.json(await registrationService.findAll());
  })
);

registrationsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { classId, parentId } = registerSchema.parse(req.body);
    const result = await registrationService.register(classId, parentId);
    res.status(201).json(result);
  })
);

registrationsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await registrationService.cancel(req.params.id);
    res.json({ message: "Registration cancelled" });
  })
);
