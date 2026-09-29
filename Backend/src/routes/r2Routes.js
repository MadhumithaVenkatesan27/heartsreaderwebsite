const express = require("express");
const { protectAdmin } = require("../middleware/authMiddleware");
const { checkR2Health } = require("../services/r2Service");

const router = express.Router();

router.get("/health", protectAdmin, async (req, res) => {
  const health = await checkR2Health();
  const statusCode = health.connection === "ok" ? 200 : 503;
  res.status(statusCode).json({
    status: health.connection === "ok" ? "success" : "error",
    data: health,
  });
});

module.exports = router;
