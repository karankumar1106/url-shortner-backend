import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
const app = express();
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use(helmet());
app.use(limiter);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
);

if(process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cookieParser());
app.use(
  express.json({
    limit: "16kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  }),
);

app.use(errorHandler);

import healthCheckRouter from "./routes/healthcheck.routes.js";
import urlRouter from "./routes/url.routes.js";
import redirectToOriginalUrlRouter from "./routes/redirect.routes.js";
import userRouter from "./routes/user.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
// router declaration
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/urls", urlRouter);
app.use("/", redirectToOriginalUrlRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/analytics", analyticsRouter);

export { app };
