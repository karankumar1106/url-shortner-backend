import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  }),
);

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
import urlRouter from "./routes/url.routes.js"
import redirectToOriginalUrlRouter from "./routes/redirect.routes.js"
// router declaration
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/urls",urlRouter)
app.use("/",redirectToOriginalUrlRouter)

export { app };
