import { env } from "../config/env";
import { HttpError } from "../utils/httpError";
import { StatusCodes } from "http-status-codes";

export type AiPredictionInput = {
  invoice_amount: number;
  customer_history: number;
  previous_delays: number;
};

export type AiPredictionOutput = {
  risk_score: number;
  delay_probability: number;
  model_version: string;
};

export async function predictLatePayment(input: AiPredictionInput): Promise<AiPredictionOutput> {
  const url = `${env.AI_SERVICE_URL.replace(/\/$/, "")}/predict`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new HttpError("AI service error", StatusCodes.BAD_GATEWAY, { status: resp.status, body: text });
  }
  return (await resp.json()) as AiPredictionOutput;
}

