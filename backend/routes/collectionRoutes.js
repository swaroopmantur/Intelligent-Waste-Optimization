
const express = require("express");
const router = express.Router();

const {
    startCollection,
    markBinCollected,
    getCollections
} = require("../controllers/collectionController");

router.post("/start", startCollection);
router.patch("/:collectionId/bins/:binId/collect", markBinCollected);
router.get("/", getCollections);

module.exports = router;
