
const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
    {
        truck: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Truck",
            required: true
        },
        truckId: {
            type: String,
            required: true
        },
        driverName: {
            type: String,
            required: true
        },
        bins: [
            {
                bin: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Bin",
                    required: true
                },
                binId: {
                    type: String,
                    required: true
                },
                address: String,
                fillLevelBefore: Number,
                estimatedWeightKg: Number,
                status: {
                    type: String,
                    enum: ["pending", "collected"],
                    default: "pending"
                },
                collectedAt: Date
            }
        ],
        totalEstimatedWasteKg: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ["in_progress", "completed"],
            default: "in_progress"
        },
        startedAt: {
            type: Date,
            default: Date.now
        },
        completedAt: Date
    },
    { timestamps: true }
);

module.exports = mongoose.model("Collection", collectionSchema);
