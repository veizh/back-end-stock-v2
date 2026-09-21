const express = require("express");

const {
  getProducts,
  getProduct,
  createProduct,
  addStock,
  updateProduct,
  removeStock,
  sendToSite,
  deleteTransit,
} = require("../controllers/product");

const router = express.Router();
router.put("/:ref", updateProduct);
router.get("/", getProducts);
router.get("/:ref", getProduct);
router.post("/:ref/send", sendToSite);
router.post("/create", createProduct);
router.delete("/:ref/transit/:transitRef", deleteTransit);
router.post("/:ref/add", addStock);
router.post("/:ref/remove", removeStock);

module.exports = router;