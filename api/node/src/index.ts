import express from "express";
import cors from "cors";
import { classesRouter } from "./routes/classes";
import { parentsRouter } from "./routes/parents";
import { registrationsRouter } from "./routes/registrations";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/classes", classesRouter);
app.use("/parents", parentsRouter);
app.use("/registrations", registrationsRouter);

app.listen(PORT, () => {
  console.log(`Atlas Academy API running at http://localhost:${PORT}`);
});
