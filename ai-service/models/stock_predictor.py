"""
StockPredictor – thin wrapper around scikit-learn LinearRegression.

For a PFA (final-year project), this demonstrates:
  1. Feature engineering from raw time-series data
  2. Model training + R² scoring
  3. Confidence interval estimation via residuals
"""

import numpy as np
from sklearn.linear_model import LinearRegression
from typing import List, Tuple, Dict, Any


class StockPredictor:
    """Trains a per-request LinearRegression model on historical sales data."""

    def predict(
        self,
        sales_history: List[Tuple[int, float]],
        periods_ahead: int = 3,
    ) -> Dict[str, Any]:
        """
        Args:
            sales_history: list of (period, quantity) tuples
            periods_ahead:  number of future periods to forecast

        Returns:
            dict with 'predictions' list and 'score' (R²)
        """
        if len(sales_history) < 3:
            raise ValueError("At least 3 data points required")

        # Prepare features: period number + period² for trend curves
        X_raw = np.array([p for p, _ in sales_history]).reshape(-1, 1)
        y     = np.array([q for _, q in sales_history])

        # Polynomial features (degree 2)
        X = self._poly_features(X_raw)

        model = LinearRegression()
        model.fit(X, y)

        score   = float(model.score(X, y))
        residuals = y - model.predict(X)
        std_res   = float(np.std(residuals))

        # Forecast
        last_period = int(X_raw[-1][0])
        future_periods = list(range(last_period + 1, last_period + periods_ahead + 1))
        X_future = self._poly_features(np.array(future_periods).reshape(-1, 1))
        predictions_raw = model.predict(X_future)

        predictions = [
            {
                "period":    future_periods[i],
                "predicted": max(0.0, float(predictions_raw[i])),         # can't sell negative
                "lower":     max(0.0, float(predictions_raw[i]) - 1.96 * std_res),
                "upper":     max(0.0, float(predictions_raw[i]) + 1.96 * std_res),
            }
            for i in range(periods_ahead)
        ]

        return {"predictions": predictions, "score": score}

    # ── Helpers ──────────────────────────────────────────────────────────────

    @staticmethod
    def _poly_features(X: np.ndarray) -> np.ndarray:
        """Add squared term to capture non-linear trends."""
        return np.hstack([X, X ** 2])
