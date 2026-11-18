
const express = require("express");

const router = express.Router();

const {
  createBin,
  getBins,
  getBinById,
  updateBin,
  deleteBin,
  predictBinFill
} = require("../controllers/binController");

// Create a new bin
router.post("/", createBin);
router.get("/:binId/predict", predictBinFill);

// Get all bins
router.get("/", getBins);

// Get a specific bin
router.get("/:id", getBinById);

// Update a bin
router.put("/:id", updateBin);

// Delete a bin
router.delete("/:id", deleteBin);

module.exports = router;
