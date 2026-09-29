const express = require("express");

const {
  getInterventions,
  getIntervention,
  createIntervention,
  updateIntervention,
  closeIntervention,
  getInterventionTickets,
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
 * POST /interventions/:ref/close
 * Clôture une intervention
 */
router.post("/:ref/close", closeIntervention);

/*
 * GET /interventions/:ref/tickets
 * Récupère tous les tickets liés à cette intervention
 *
 * Un ticket est lié si :
 * ticket.from === intervention.ref
 * OU
 * ticket.to === intervention.ref
 */
router.get("/:ref/tickets", getInterventionTickets);

module.exports = router;