const express = require("express");
const {
  getDiscoveryHome,
  getPublicCollections,
} = require("../controllers/discoveryController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/collections", getPublicCollections);
router.get("/home", protect, getDiscoveryHome);

module.exports = router;
