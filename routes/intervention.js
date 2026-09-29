const express = require("express");

const {
  getInterventions,
  getIntervention,
  createIntervention,
  updateIntervention,
  closeIntervention,
  getInterventionProducts,
  getInterventionProduct,
  getInterventionTickets,
  transferProduct,
} = require("../controllers/product");

const router = express.Router();

router.get("/:ref/products", getInterventionProducts);
router.get("/:ref/products/:productRef", getInterventionProduct);
router.get("/:ref/tickets", getInterventionTickets);

router.post("/:ref/transfer", transferProduct);

router.get("/:ref", getIntervention);
router.post("/create", createIntervention);
router.put("/:ref", updateIntervention);
router.patch("/:ref/close", closeIntervention);

router.get("/", getInterventions);

module.exports = router;