import cors from "cors";
import express from "express";
import workshopsRouter from "./routes/workshops.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONT_URL || "http://localhost:5173",
  }),
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/workshops", workshopsRouter);

export default app;
