from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    invoice_amount: float = Field(..., ge=0)
    customer_history: int = Field(..., ge=0)
    previous_delays: int = Field(..., ge=0)


class PredictResponse(BaseModel):
    risk_score: float
    delay_probability: float
    model_version: str

