
const express = require("express");
const { optimizeRoute } = require("../controllers/routeController");

const router = express.Router();

router.post("/optimize", optimizeRoute);

module.exports = router;
