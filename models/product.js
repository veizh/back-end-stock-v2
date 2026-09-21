const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
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

    quantity: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },

    location: {
      type: String,
      required: false,
      trim: true,
    },

 enTransit: [
  {
    ref: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    site: {
      type: String,
      required: true,
      trim: true,
    },
  },

    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);