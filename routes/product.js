const express = require("express");

const {
  getProducts,
  getProduct,
  createProduct,
  addStock,
  deleteTransit,
  removeStock,
  updateProduct,
  sendToSite,
  returnTransit,
} = require("../controllers/product");

const router = express.Router();

router.get("/", getProducts);

router.get("/:ref", getProduct);

router.post("/create", createProduct);

router.put("/:ref", updateProduct);

router.post("/:ref/add", addStock);

router.post("/:ref/remove", removeStock);

router.post("/:ref/send", sendToSite);

router.delete("/:ref/transit/:transitRef", deleteTransit);

router.post(
  "/:ref/transit/:transitRef/return",
  returnTransit
);

module.exports = router;