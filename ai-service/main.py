"""
AI microservice for stock demand prediction.
Exposes a REST API consumed by the Spring Boot core-service.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import prediction

app = FastAPI(
    title="ERP AI Service",
    description="Stock demand forecasting powered by ML",
    version="1.0.0",
)

# CORS – allow the API Gateway and direct Angular calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction.router, prefix="/api/v1/ai", tags=["prediction"])


@app.get("/actuator/health")
def health():
    return {"status": "UP"}
