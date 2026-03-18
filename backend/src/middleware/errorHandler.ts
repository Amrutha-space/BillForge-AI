import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { HttpError } from "../utils/httpError";

export function notFound(req: Request, res: Response) {
  res.status(StatusCodes.NOT_FOUND).json({ error: { message: `Route not found: ${req.method} ${req.path}` } });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: { message: err.message, details: err.details } });
  }
  if (err instanceof Error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: { message: err.message } });
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: { message: "Internal Server Error" } });
}

