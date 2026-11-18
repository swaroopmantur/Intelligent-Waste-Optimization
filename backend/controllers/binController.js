
const Bin = require("../models/bin");

// @desc    Create a new waste bin
// @route   POST /api/bins
const createBin = async (req, res) => {
  try {
    const bin = await Bin.create(req.body);

    res.status(201).json({
      success: true,
      message: "Waste bin created successfully",
      data: bin
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Bin ID already exists"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create waste bin"
    });
  }
};


// @desc    Get all waste bins
// @route   GET /api/bins
const getBins = async (req, res) => {
  try {
    const { status, wasteType } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (wasteType) {
      filter.wasteType = wasteType;
    }

    const bins = await Bin.find(filter).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: bins.length,
      data: bins
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch waste bins"
    });
  }
};


// @desc    Get a single bin
// @route   GET /api/bins/:id
const getBinById = async (req, res) => {
  try {
    const bin = await Bin.findById(req.params.id);

    if (!bin) {
      return res.status(404).json({
        success: false,
        message: "Waste bin not found"
      });
    }

    res.status(200).json({
      success: true,
      data: bin
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid bin ID"
    });
  }
};


// @desc    Update a waste bin
// @route   PUT /api/bins/:id
const updateBin = async (req, res) => {
  try {
    const bin = await Bin.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!bin) {
      return res.status(404).json({
        success: false,
        message: "Waste bin not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Waste bin updated successfully",
      data: bin
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Delete a waste bin
// @route   DELETE /api/bins/:id
const deleteBin = async (req, res) => {
  try {
    const bin = await Bin.findByIdAndDelete(req.params.id);

    if (!bin) {
      return res.status(404).json({
        success: false,
        message: "Waste bin not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Waste bin deleted successfully"
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid bin ID"
    });
  }
};

// Get ML fill-level prediction for a bin
const predictBinFill = async (req, res) => {
    try {
        const { binId } = req.params;

        const bin = await Bin.findById(binId);

        if (!bin) {
            return res.status(404).json({
                success: false,
                message: "Bin not found"
            });
        }

        const response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fill_level: bin.fillLevel,
                hourly_usage: 3,
                temperature: 30,
                humidity: 65,
                rainfall: 2,
                waste_type: 0
            })
        });

        if (!response.ok) {
            throw new Error("ML prediction service failed");
        }

        const prediction = await response.json();

        res.status(200).json({
            success: true,
            binId: bin.binId,
            prediction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
  createBin,
  getBins,
  getBinById,
  updateBin,
  deleteBin,
  predictBinFill
};

  