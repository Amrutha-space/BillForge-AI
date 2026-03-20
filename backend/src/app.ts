import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env";
import { requestId } from "./middleware/requestId";
import { metricsMiddleware } from "./middleware/metricsMiddleware";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { swaggerSpec } from "./swagger";
import { register } from "./observability/metrics";

import { authRouter } from "./routes/auth.routes";
import { companiesRouter } from "./routes/companies.routes";
import { invoicesRouter } from "./routes/invoices.routes";
import { paymentsRouter } from "./routes/payments.routes";
import { subscriptionsRouter } from "./routes/subscriptions.routes";
import { analyticsRouter } from "./routes/analytics.routes";
import { stripeWebhookRouter } from "./routes/stripeWebhook.routes";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: "https://bill-forge-ai-98x.vercel.app",
      credentials: true
    })
  );
  app.use(morgan("combined"));
  app.use(requestId);
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  app.use(cookieParser());
  // Webhooks must use raw body (signature verification).
  app.use("/api/webhooks", express.raw({ type: "application/json", limit: "1mb" }), stripeWebhookRouter);
  app.use(express.json({ limit: "1mb" }));

  app.use(metricsMiddleware);

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.get("/metrics", async (_req, res) => {
    res.setHeader("content-type", register.contentType);
    res.send(await register.metrics());
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use("/api/auth", authRouter);
  app.use("/api/companies", companiesRouter);
  app.use("/api/invoices", invoicesRouter);
  app.use("/api/payments", paymentsRouter);
  app.use("/api/subscriptions", subscriptionsRouter);
  app.use("/api/analytics", analyticsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

