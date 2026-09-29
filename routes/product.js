const express = require("express");

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  addStock,
  removeStock,
  sendToSite,
  returnTransit,
  deleteTransit,
  getProductOnIntervention,
} = require("../controllers/product");

const router = express.Router();

router.get("/", getProducts);
router.post("/", createProduct);

router.get("/:ref/intervention/:interventionRef", getProductOnIntervention);

router.post("/:ref/add", addStock);
router.post("/:ref/remove", removeStock);

router.post("/:ref/send", sendToSite);

router.post(
  "/:ref/transit/:interventionRef/return",
  returnTransit
);

router.delete(
  "/:ref/transit/:interventionRef",
  deleteTransit
);

router.get("/:ref", getProduct);
router.put("/:ref", updateProduct);

module.exports = router;