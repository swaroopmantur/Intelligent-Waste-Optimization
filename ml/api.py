
from fastapi import FastAPI
from pydantic import BaseModel, Field
import joblib
import numpy as np

app = FastAPI(title="Smart Waste Prediction API")

model = joblib.load("fill_prediction_model.pkl")


class BinData(BaseModel):
    fill_level: float = Field(ge=0, le=100)
    hourly_usage: float = Field(ge=0)
    temperature: float
    humidity: float = Field(ge=0, le=100)
    rainfall: float = Field(ge=0)
    waste_type: int = Field(ge=0, le=3)


@app.get("/")
def home():
    return {
        "success": True,
        "message": "Waste Prediction ML API is running"
    }


@app.post("/predict")
def predict(data: BinData):
    features = np.array([[
        data.fill_level,
        data.hourly_usage,
        data.temperature,
        data.humidity,
        data.rainfall,
        data.waste_type
    ]])

    predicted_fill = float(model.predict(features)[0])
    predicted_fill = float(np.clip(predicted_fill, 0, 100))

    remaining_hours = None

    if data.hourly_usage > 0:
        remaining_hours = max(
            0,
            (100 - data.fill_level) / data.hourly_usage
        )

    return {
        "success": True,
        "current_fill": data.fill_level,
        "predicted_fill_after_6_hours": round(predicted_fill, 2),
        "estimated_hours_until_full": (
            round(remaining_hours, 2)
            if remaining_hours is not None else None
        ),
        "collection_recommended": predicted_fill >= 80
    }
