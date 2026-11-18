
const Collection = require("../models/collection");
const Bin = require("../models/bin");
const Truck = require("../models/truck");

// Start a collection run
const startCollection = async (req, res, next) => {
    try {
        const { truckId, bins } = req.body;

        if (!truckId || !Array.isArray(bins) || bins.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Truck ID and collection bins are required"
            });
        }

        const truck = await Truck.findById(truckId);

        if (!truck) {
            return res.status(404).json({
                success: false,
                message: "Truck not found"
            });
        }

        if (truck.status !== "available") {
            return res.status(400).json({
                success: false,
                message: "Truck is not available"
            });
        }

        const collectionBins = [];

        for (const stop of bins) {
            const bin = await Bin.findById(stop.binMongoId);

            if (!bin) {
                return res.status(404).json({
                    success: false,
                    message: `Bin not found: ${stop.binId || stop.binMongoId}`
                });
            }

            collectionBins.push({
    bin: bin._id,
    binId: bin.binId,
    address: bin.location.address,
    fillLevelBefore: bin.fillLevel,
    estimatedWeightKg: Number(stop.estimatedWeightKg) || 0,
    status: "pending",
    collectedAt: null
});
        }

        const totalEstimatedWasteKg = collectionBins.reduce(
            (total, item) => total + item.estimatedWeightKg,
            0
        );

        const collection = await Collection.create({
            truck: truck._id,
            truckId: truck.truckId,
            driverName: truck.driverName,
            bins: collectionBins,
            totalEstimatedWasteKg
        });

        truck.status = "on_route";
        await truck.save();

        res.status(201).json({
            success: true,
            message: "Collection started successfully",
            collection
        });

    } catch (error) {
        next(error);
    }
};

// Mark one bin as collected


const markBinCollected = async (req, res) => {
    try {
        const { collectionId, binId } = req.params;

        const collection = await Collection.findById(collectionId);

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: "Collection not found"
            });
        }

        if (collection.status === "completed") {
            return res.status(400).json({
                success: false,
                message: "Collection is already completed"
            });
        }

        const binStop = collection.bins.find(
            (item) => item.bin.toString() === binId
        );

        if (!binStop) {
            return res.status(404).json({
                success: false,
                message: "Bin not found in this collection"
            });
        }

        if (binStop.status === "collected") {
            return res.status(400).json({
                success: false,
                message: "This bin has already been collected"
            });
        }

        const bin = await Bin.findById(binId);

        if (!bin) {
            return res.status(404).json({
                success: false,
                message: "Bin not found"
            });
        }

        bin.fillLevel = 0;
        bin.lastCollectedAt = new Date();

        binStop.status = "collected";
        binStop.collectedAt = new Date();

        await bin.save();

        const allCollected = collection.bins.every(
            (item) => item.status === "collected"
        );

        if (allCollected) {
            collection.status = "completed";
            collection.completedAt = new Date();

            const truck = await Truck.findById(collection.truck);

            if (truck) {
                truck.status = "available";
                truck.currentLoadKg = 0;
                await truck.save();
            }
        }

        await collection.save();

        return res.status(200).json({
            success: true,
            message: allCollected
                ? "Collection completed. Truck is now available."
                : "Bin marked as collected successfully.",
            collection
        });

    } catch (error) {
        console.error("MARK BIN COLLECTED ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// Get collection history
const getCollections = async (req, res, next) => {
    try {
        const collections = await Collection.find()
            .populate("truck", "truckId driverName registrationNumber")
            .populate("bins.bin", "binId location")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: collections.length,
            collections
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    startCollection,
    markBinCollected,
    getCollections
};
