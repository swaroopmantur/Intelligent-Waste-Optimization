const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Waste Management API is running",
        status: "Healthy"
    });
});

module.exports = router;
