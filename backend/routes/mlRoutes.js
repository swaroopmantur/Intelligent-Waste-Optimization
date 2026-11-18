
const express = require("express");

const router = express.Router();

router.post("/predict", async (req, res, next) => {
    try {
        const response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req.body),
            signal: AbortSignal.timeout(10000)
        });

        const result = await response.json();

        return res.status(response.status).json(result);
    } catch (error) {
        if (error.name === "TimeoutError" || error.cause?.code === "ECONNREFUSED") {
            return res.status(503).json({
                success: false,
                message: "ML prediction service is unavailable"
            });
        }

        next(error);
    }
});

module.exports = router;
