import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import authRoutes from "./routes/auth.js";
import apartmentRoutes from "./routes/apartments.js";
import reviewRoutes from "./routes/reviews.js";
import uploadRoutes from "./routes/upload.js";

const app = express();

// Allow the React origin and send credentials, so the browser includes the
// auth cookie on cross-origin requests. A specific origin is required when
// credentials are enabled (a wildcard is rejected by the browser).
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json()); // parse JSON request bodies
app.use(cookieParser()); // read cookies into req.cookies

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);

export default app;
