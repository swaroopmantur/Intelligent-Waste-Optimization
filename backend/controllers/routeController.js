
const Bin = require("../models/bin");
const Truck = require("../models/truck");

// Calculate geographical distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const toRad = (value) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Calculate collection priority
const calculatePriority = (bin) => {
    const fillScore = bin.fillLevel * 0.7;

    let hours = 0;

    if (bin.lastCollectedAt) {
        hours =
            (Date.now() - new Date(bin.lastCollectedAt).getTime()) /
            (1000 * 60 * 60);
    }

    const timeScore = Math.min((hours / 24) * 30, 30);

    return fillScore + timeScore;
};

// Optimize collection route for one truck
const optimizeRoute = async (req, res, next) => {
    try {
        const { truckId } = req.body;

        if (!truckId) {
            return res.status(400).json({
                success: false,
                message: "Please provide a truckId"
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

        const bins = await Bin.find({
            status: "active",
            fillLevel: { $gt: 0 }
        });

        let remainingCapacity =
            truck.capacityKg - truck.currentLoadKg;

        if (remainingCapacity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Truck has no remaining capacity"
            });
        }

        let currentLat = truck.location.latitude;
        let currentLon = truck.location.longitude;

        let totalDistanceKm = 0;
        let totalLoadKg = 0;

        const pendingBins = bins.map((bin) => {
            // Assumption: Bin capacity is specified in kg.
            const estimatedWeightKg =
                bin.capacity * (bin.fillLevel / 100);

            return {
                bin,
                estimatedWeightKg,
                priorityScore: calculatePriority(bin)
            };
        });

        const selectedStops = [];

        while (pendingBins.length > 0) {
            const eligibleBins = pendingBins.filter(
                (item) =>
                    item.estimatedWeightKg > 0 &&
                    item.estimatedWeightKg <= remainingCapacity
            );

            if (eligibleBins.length === 0) {
                break;
            }

            let bestIndex = -1;
            let bestCost = Infinity;

            eligibleBins.forEach((item) => {
                const distance = calculateDistance(
                    currentLat,
                    currentLon,
                    item.bin.location.latitude,
                    item.bin.location.longitude
                );

                // Prefer urgent bins while keeping travel distance low.
                const cost =
                    (distance + 0.1) /
                    (1 + item.priorityScore / 100);

                if (cost < bestCost) {
                    bestCost = cost;
                    bestIndex = pendingBins.indexOf(item);
                }
            });

            const selected = pendingBins.splice(bestIndex, 1)[0];
            const bin = selected.bin;

            const distance = calculateDistance(
                currentLat,
                currentLon,
                bin.location.latitude,
                bin.location.longitude
            );

            totalDistanceKm += distance;
            totalLoadKg += selected.estimatedWeightKg;
            remainingCapacity -= selected.estimatedWeightKg;

            selectedStops.push({
                binId: bin.binId,
                binMongoId: bin._id,
                address: bin.location.address,
                latitude: bin.location.latitude,
                longitude: bin.location.longitude,
                fillLevel: bin.fillLevel,
                estimatedWeightKg:
                    Number(selected.estimatedWeightKg.toFixed(2)),
                priorityScore:
                    Number(selected.priorityScore.toFixed(2)),
                distanceFromPreviousKm: Number(distance.toFixed(2))
            });

            currentLat = bin.location.latitude;
            currentLon = bin.location.longitude;
        }

        res.status(200).json({
            success: true,
            message: "Collection route optimized successfully",
            route: {
               
    truckId: truck.truckId,
    truckMongoId: truck._id,
                driverName: truck.driverName,
                startLocation: truck.location,
                stops: selectedStops,
                totalStops: selectedStops.length,
                totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
                estimatedLoadKg: Number(totalLoadKg.toFixed(2)),
                remainingCapacityKg:
                    Number(remainingCapacity.toFixed(2)),
                skippedBins: pendingBins.map(
                    (item) => item.bin.binId
                )
            }
        });

    } catch (error) {
    console.error("ROUTE OPTIMIZATION ERROR:", error);
    res.status(500).json({
        success: false,
        message: error.message
    });
}
};

module.exports = { optimizeRoute };
