
const express = require("express");
const Bin = require("../models/bin");

const router = express.Router();

// Get bins ranked by collection priority
router.get("/", async (req, res, next) => {
    try {
        const bins = await Bin.find({ status: "active" });

        const currentTime = Date.now();

        const prioritizedBins = bins.map((bin) => {
            const fillScore = bin.fillLevel * 0.7;

            let hoursSinceCollection = 0;

            if (bin.lastCollectedAt) {
                hoursSinceCollection =
                    (currentTime - new Date(bin.lastCollectedAt).getTime())
                    / (1000 * 60 * 60);
            }

            const timeScore = Math.min(
                (hoursSinceCollection / 24) * 30,
                30
            );

            const priorityScore = Math.round(fillScore + timeScore);

            let priority = "Low";

            if (priorityScore >= 70) {
                priority = "Critical";
            } else if (priorityScore >= 40) {
                priority = "High";
            } else if (priorityScore >= 20) {
                priority = "Medium";
            }

            return {
                ...bin.toObject(),
                priorityScore,
                priority
            };
        });

        prioritizedBins.sort(
            (a, b) => b.priorityScore - a.priorityScore
        );

        res.status(200).json({
            success: true,
            count: prioritizedBins.length,
            bins: prioritizedBins
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
