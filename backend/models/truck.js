
const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema(
    {
        truckId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        registrationNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        driverName: {
            type: String,
            required: true,
            trim: true
        },
        capacityKg: {
            type: Number,
            required: true,
            min: 1
        },
        currentLoadKg: {
            type: Number,
            default: 0,
            min: 0
        },
        status: {
            type: String,
            enum: ["available", "on_route", "maintenance"],
            default: "available"
        },
        location: {
            address: { type: String, required: true },
            latitude: { type: Number, required: true, min: -90, max: 90 },
            longitude: { type: Number, required: true, min: -180, max: 180 }
        }
    },
    { timestamps: true }
);

truckSchema.pre("validate", function () {
    if (this.currentLoadKg > this.capacityKg) {
        this.invalidate(
            "currentLoadKg",
            "Current load cannot exceed truck capacity"
        );
    }
});

module.exports = mongoose.model("Truck", truckSchema);
