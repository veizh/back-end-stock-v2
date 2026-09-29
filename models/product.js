const mongoose = require("mongoose");

const transitSchema = new mongoose.Schema(
  {
    interventionRef: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

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
      required: true,
      min: 0,
      default: 0,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    enTransit: {
      type: [transitSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);