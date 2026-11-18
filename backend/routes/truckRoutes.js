
const express = require("express");

const {
    createTruck,
    getTrucks,
    getTruckById,
    updateTruck,
    deleteTruck
} = require("../controllers/truckController");

const router = express.Router();

router.post("/", createTruck);
router.get("/", getTrucks);
router.get("/:id", getTruckById);
router.put("/:id", updateTruck);
router.delete("/:id", deleteTruck);

module.exports = router;
