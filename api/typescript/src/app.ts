import express from "express";
import cors from "cors";
import { errorHandler } from "./errors";
import { classesRouter } from "./routes/classes";
import { parentsRouter } from "./routes/parents";
import { registrationsRouter } from "./routes/registrations";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/classes", classesRouter);
app.use("/parents", parentsRouter);
app.use("/registrations", registrationsRouter);

app.use(errorHandler);

export default app;
