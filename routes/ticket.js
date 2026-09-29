const express = require("express");

const {
  getTickets,
  getTicket,
  createTicket,
} = require("../controllers/product");

const router = express.Router();

/*
 * GET /tickets
 * Tous les tickets
 */
router.get("/", getTickets);

/*
 * GET /tickets/:id
 * Ticket précis
 */
router.get("/:id", getTicket);

/*
 * POST /tickets/create
 * Création manuelle d'un ticket
 */
router.post("/create", createTicket);

module.exports = router;