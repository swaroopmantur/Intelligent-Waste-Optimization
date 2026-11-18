
const mongoose = require("mongoose");

const binSchema = new mongoose.Schema(
  {
    binId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    location: {
      address: {
        type: String,
        required: true
      },
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      }
    },

    capacity: {
      type: Number,
      required: true,
      min: 1
    },

    fillLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    wasteType: {
      type: String,
      enum: ["General", "recyclable", "organic", "hazardous"],
      required: true
    },

    status: {
      type: String,
      enum: ["active", "maintenance", "inactive"],
      default: "active"
    },

    lastCollectedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

binSchema.index({
  "location.latitude": 1,
  "location.longitude": 1
});

binSchema.index({
  status: 1,
  fillLevel: -1
});

module.exports = mongoose.model("Bin", binSchema);
