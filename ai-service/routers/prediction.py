"""
Stock demand prediction router.

Accepts historical sales data (list of (date, quantity) pairs) and returns
a short-term demand forecast using a simple LinearRegression model.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from typing import List
from models.stock_predictor import StockPredictor

router = APIRouter()
_predictor = StockPredictor()


class SalesPoint(BaseModel):
    """A single historical sales observation."""
    period: int           # sequential period number (1, 2, 3 …)
    quantity: float       # units sold in that period


class PredictionRequest(BaseModel):
    productId:   int
    tenantId:    str
    salesHistory: List[SalesPoint]
    periodsAhead: int = 3   # how many future periods to predict

    @field_validator("salesHistory")
    @classmethod
    def validate_history(cls, v: List[SalesPoint]) -> List[SalesPoint]:
        if len(v) < 3:
            raise ValueError("At least 3 historical data points required")
        return v


class PredictedPeriod(BaseModel):
    period:          int
    predictedQty:    float
    confidenceLower: float
    confidenceUpper: float


class PredictionResponse(BaseModel):
    productId:   int
    tenantId:    str
    predictions: List[PredictedPeriod]
    modelScore:  float   # R² on training data


@router.post("/predict/stock", responses={422: {"description": "Unprocessable Entity - validation error or insufficient data"}})
def predict_stock(request: PredictionRequest) -> PredictionResponse:
    """
    Predict future stock demand for a product.

    Supply at least 3 historical (period, quantity) pairs.
    Returns a list of predicted quantities for the next N periods.
    """
    try:
        result = _predictor.predict(
            sales_history=[(p.period, p.quantity) for p in request.salesHistory],
            periods_ahead=request.periodsAhead,
        )
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    predictions = [
        PredictedPeriod(
            period=item["period"],
            predictedQty=item["predicted"],
            confidenceLower=item["lower"],
            confidenceUpper=item["upper"],
        )
        for item in result["predictions"]
    ]

    return PredictionResponse(
        productId=request.productId,
        tenantId=request.tenantId,
        predictions=predictions,
        modelScore=result["score"],
    )
