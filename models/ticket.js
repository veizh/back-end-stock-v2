const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "TRANSIT_SEND",
        "TRANSIT_RETURN",
        "STOCK_ADD",
        "STOCK_REMOVE",
        "PRODUCT_UPDATE",
        "SITE_TRANSFER",
      ],
    },

    productRef: {
      type: String,
      required: true,
      trim: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    /*
     * TRANSFERT ENTRE INTERVENTIONS
     *
     * from = intervention qui envoie
     * to   = intervention qui reçoit
     *
     * Exemple :
     *
     * from: "INT-2026-004"
     * to:   "INT-2026-002"
     */
    from: {
      type: String,
      default: null,
      trim: true,
    },

    to: {
      type: String,
      default: null,
      trim: true,
    },

    /*
     * Quantité transférée / ajoutée / retirée
     */
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    /*
     * Informations liées aux anciens mouvements
     * de stock / transit.
     */
    transitRef: {
      type: String,
      default: null,
      trim: true,
    },

    site: {
      type: String,
      default: null,
      trim: true,
    },

    oldStock: {
      type: Number,
      default: null,
    },

    newStock: {
      type: Number,
      default: null,
    },

    oldTransitQuantity: {
      type: Number,
      default: null,
    },

    newTransitQuantity: {
      type: Number,
      default: null,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);