const express = require("express");

const {
  getInterventions,
  getIntervention,
  createIntervention,
  updateIntervention,
  closeIntervention,
  getInterventionTickets,
  transferProduct,getinterventionsProducts,
} = require("../controllers/product");

const router = express.Router();

/*
 * GET /interventions
 * Liste toutes les interventions
 */
router.get("/", getInterventions);

/*
 * GET /interventions/:ref
 * Récupère une intervention par sa ref
 */
router.get("/:ref", getIntervention);

/*
 * POST /interventions/create
 * Crée une nouvelle intervention
 */
router.post("/create", createIntervention);

/*
 * PUT /interventions/:ref
 * Modifie une intervention
 */
router.put("/:ref", updateIntervention);

/*
 * PATCH /interventions/:ref/close
 * Clôture une intervention
 */
router.patch("/:ref/close", closeIntervention);
router.get("/:ref/products",getinterventionsProducts);
/*
 * POST /interventions/:ref/transfer
 * Transfère du matériel vers une autre intervention
 */
router.post("/:ref/transfer", transferProduct);

/*
 * GET /interventions/:ref/tickets
 * Récupère tous les tickets liés à cette intervention
 */
router.get("/:ref/tickets", getInterventionTickets);

module.exports = router;