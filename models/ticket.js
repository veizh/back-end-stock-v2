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
      ],
    },

    productRef: {
      type: String,
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    transitRef: {
      type: String,
      default: null,
    },

    site: {
      type: String,
      default: null,
    },

    quantity: {
      type: Number,
      required: true,
    },

    oldStock: {
      type: Number,
      required: true,
    },

    newStock: {
      type: Number,
      required: true,
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
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);