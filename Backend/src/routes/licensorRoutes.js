const express = require("express");
const router = express.Router();
const {
  licensorLogin,
  licensorIdLogin,
  getLicensorMe,
  getLicensorBooks,
} = require("../controllers/licensorController");
const { protectLicensorRole } = require("../middleware/authMiddleware");
const { validateRequest, rules } = require("../middleware/validateRequest");

router.post(
  "/login",
  validateRequest({
    body: {
      email: rules.email({ required: true }),
      password: rules.string({ min: 1, max: 72, required: true }),
    },
  }),
  licensorLogin
);
router.post(
  "/login-id",
  validateRequest({
    body: {
      licensorId: rules.string({ min: 3, max: 40, required: true }),
      password: rules.string({ min: 1, max: 72, required: true }),
    },
  }),
  licensorIdLogin
);
router.get("/me", protectLicensorRole, getLicensorMe);
router.get("/my-books", protectLicensorRole, getLicensorBooks);

module.exports = router;
