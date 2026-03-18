import type { NextFunction, Request, Response } from "express";
import { httpRequestDurationSeconds } from "../observability/metrics";

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationSeconds = Number(end - start) / 1e9;
    const route = (req.route?.path as string | undefined) ?? req.path;
    httpRequestDurationSeconds
      .labels(req.method, route, String(res.statusCode))
      .observe(durationSeconds);
  });

  next();
}

