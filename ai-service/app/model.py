from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


MODEL_VERSION = "lr-v1"


def _make_synthetic_training_data(n: int = 2000, seed: int = 42) -> tuple[pd.DataFrame, np.ndarray]:
    rng = np.random.default_rng(seed)

    invoice_amount = rng.lognormal(mean=4.2, sigma=0.6, size=n)  # dollars
    customer_history = rng.integers(low=0, high=60, size=n)
    previous_delays = rng.poisson(lam=1.2, size=n)

    # latent risk: higher amount + more previous delays + low history => higher risk
    z = (
        0.0009 * invoice_amount
        + 0.75 * previous_delays
        - 0.025 * customer_history
        + rng.normal(0, 0.7, size=n)
    )
    prob = 1 / (1 + np.exp(-z))
    y = (rng.random(size=n) < prob).astype(int)

    X = pd.DataFrame(
        {
            "invoice_amount": invoice_amount,
            "customer_history": customer_history,
            "previous_delays": previous_delays,
        }
    )
    return X, y


def train_model(seed: int = 42) -> Pipeline:
    X, y = _make_synthetic_training_data(seed=seed)
    pipe = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=500, n_jobs=1)),
        ]
    )
    pipe.fit(X, y)
    return pipe


_MODEL: Pipeline | None = None


def get_model() -> Pipeline:
    global _MODEL
    if _MODEL is None:
        _MODEL = train_model()
    return _MODEL


def predict(invoice_amount: float, customer_history: int, previous_delays: int) -> tuple[float, float]:
    model = get_model()
    X = pd.DataFrame(
        [
            {
                "invoice_amount": float(invoice_amount),
                "customer_history": int(customer_history),
                "previous_delays": int(previous_delays),
            }
        ]
    )
    proba = float(model.predict_proba(X)[0, 1])
    # risk_score: keep as same scale but slightly smoothed for display
    risk_score = float(min(1.0, max(0.0, 0.15 + 0.85 * proba)))
    return risk_score, proba

