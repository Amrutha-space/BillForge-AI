from fastapi import APIRouter

from app.model import MODEL_VERSION, predict
from app.schemas import PredictRequest, PredictResponse

router = APIRouter()


@router.post("/predict", response_model=PredictResponse, tags=["prediction"])
def predict_endpoint(req: PredictRequest):
    risk_score, delay_probability = predict(
        invoice_amount=req.invoice_amount,
        customer_history=req.customer_history,
        previous_delays=req.previous_delays,
    )
    return PredictResponse(
        risk_score=risk_score,
        delay_probability=delay_probability,
        model_version=MODEL_VERSION,
    )

