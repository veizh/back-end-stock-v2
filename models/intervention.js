const mongoose = require("mongoose");

const interventionSchema = new mongoose.Schema(
  {
    ref: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    client: {
      type: String,
      required: true,
      trim: true,
    },

    site: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    quoteNumber: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      required: true,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Intervention",
  interventionSchema
);