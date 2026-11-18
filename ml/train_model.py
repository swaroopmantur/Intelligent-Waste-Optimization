
import numpy as np
import pandas as pd
import joblib

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

np.random.seed(42)

# Generate simulated sensor readings for initial model training
n = 5000

fill_level = np.random.uniform(5, 95, n)
hourly_usage = np.random.uniform(0.2, 5, n)
temperature = np.random.uniform(20, 42, n)
humidity = np.random.uniform(30, 95, n)
rainfall = np.random.uniform(0, 30, n)
waste_type = np.random.randint(0, 4, n)

# Simulated fill level after 6 hours
future_fill = (
    fill_level
    + hourly_usage * 6
    + waste_type * 0.8
    + humidity * 0.015
    - rainfall * 0.025
    + np.random.normal(0, 2, n)
)

future_fill = np.clip(future_fill, 0, 100)

data = pd.DataFrame({
    "fill_level": fill_level,
    "hourly_usage": hourly_usage,
    "temperature": temperature,
    "humidity": humidity,
    "rainfall": rainfall,
    "waste_type": waste_type,
    "future_fill": future_fill
})

X = data.drop("future_fill", axis=1)
y = data["future_fill"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestRegressor(
    n_estimators=150,
    max_depth=12,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

predictions = model.predict(X_test)

print("Model Training Completed")
print("MAE:", round(mean_absolute_error(y_test, predictions), 2))
print("R2 Score:", round(r2_score(y_test, predictions), 3))

joblib.dump(model, "fill_prediction_model.pkl")

print("Model saved successfully!")
