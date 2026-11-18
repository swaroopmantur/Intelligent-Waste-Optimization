
const Truck = require("../models/truck");

// Register a truck
const createTruck = async (req, res, next) => {
    try {
        const truck = await Truck.create(req.body);

        res.status(201).json({
            success: true,
            message: "Truck registered successfully",
            data: truck
        });
    } catch (error) {
        next(error);
    }
};

// Get all trucks with optional status filter
const getTrucks = async (req, res, next) => {
    try {
        const filter = {};

        if (req.query.status) {
            filter.status = req.query.status;
        }

        const trucks = await Truck.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: trucks.length,
            data: trucks
        });
    } catch (error) {
        next(error);
    }
};

// Get one truck
const getTruckById = async (req, res, next) => {
    try {
        const truck = await Truck.findById(req.params.id);

        if (!truck) {
            return res.status(404).json({
                success: false,
                message: "Truck not found"
            });
        }

        res.status(200).json({ success: true, data: truck });
    } catch (error) {
        next(error);
    }
};

// Update truck
const updateTruck = async (req, res, next) => {
    try {
        const truck = await Truck.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!truck) {
            return res.status(404).json({
                success: false,
                message: "Truck not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Truck updated successfully",
            data: truck
        });
    } catch (error) {
        next(error);
    }
};

// Delete truck
const deleteTruck = async (req, res, next) => {
    try {
        const truck = await Truck.findByIdAndDelete(req.params.id);

        if (!truck) {
            return res.status(404).json({
                success: false,
                message: "Truck not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Truck deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTruck,
    getTrucks,
    getTruckById,
    updateTruck,
    deleteTruck
};
