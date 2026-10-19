import { z } from "zod";

export const registerSchema = z.object({
  classId: z.string().uuid(),
  parentId: z.string().uuid(),
});

export const parentIdQuerySchema = z.object({
  parentId: z.string().uuid(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
