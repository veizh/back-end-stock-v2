const Product = require("../models/product");

const generateTransitRef = () => {
  return `TR-${Date.now().toString(36).toUpperCase()}`;
};

const deleteTransit = async (req, res) => {
  try {
    const { ref, transitRef } = req.params;

    // Recherche du produit
    const product = await Product.findOne({ ref });

    if (!product) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    // Recherche du transit
    const transitIndex = product.enTransit.findIndex(
      (transit) => transit.ref === transitRef
    );

    if (transitIndex === -1) {
      return res.status(404).json({
        message: "Transit introuvable",
        transitRef,
      });
    }

    // Récupération du transit
    const transit = product.enTransit[transitIndex];

    const oldQuantity = product.quantity;

    // La quantité du transit retourne dans le stock
    product.quantity += transit.quantity;

    // Suppression du transit
    product.enTransit.splice(transitIndex, 1);

    // Sauvegarde
    await product.save();

    res.json({
      message: `Transit ${transitRef} supprimé. ${transit.quantity} objets ont été remis en stock.`,

      ref: product.ref,

      transitRef: transit.ref,

      site: transit.site,

      returnedQuantity: transit.quantity,

      oldQuantity,

      newQuantity: product.quantity,

      remainingTransits: product.enTransit,

      product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la suppression du transit",
    });
  }
};

const sendToSite = async (req, res) => {
  try {
    const { quantity, site } = req.body;

    // Vérification de la quantité
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: "La quantité doit être un entier supérieur à 0",
      });
    }

    // Vérification du site
    if (!site || typeof site !== "string" || site.trim() === "") {
      return res.status(400).json({
        message: "Le site de destination est obligatoire",
      });
    }

    // Recherche du produit
    const product = await Product.findOne({
      ref: req.params.ref,
    });

    if (!product) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    // Vérification du stock disponible
    if (quantity > product.quantity) {
      return res.status(400).json({
        message: "Stock insuffisant",
        stockDisponible: product.quantity,
      });
    }

    // Anciennes valeurs pour la réponse
    const oldQuantity = product.quantity;
    const oldEnTransit = [...product.enTransit];

    // Génération d'une référence unique pour l'envoi
    const transitRef = `TR-${Date.now().toString(36).toUpperCase()}`;

    // Nouveau stock après envoi
    const newQuantity = oldQuantity - quantity;

    // Retrait du stock
    product.quantity = newQuantity;

    // Ajout de l'envoi dans les produits en transit
    product.enTransit.push({
      ref: transitRef,
      quantity,
      site: site.trim(),
    });

    // Sauvegarde
    await product.save();

    // Réponse
    res.json({
      message: `Envoi effectué vers ${site.trim()}. Il reste ${newQuantity} objets en stock.`,

      ref: product.ref,

      transitRef,

      sentQuantity: quantity,

      destination: site.trim(),

      oldQuantity,

      newQuantity,

      oldEnTransit,

      newEnTransit: product.enTransit,

      product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de l'envoi du produit vers le site",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, ref, quantity, location, enTransit } = req.body;

    const product = await Product.findOne({
      ref: req.params.ref,
    });

    if (!product) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    // On garde les anciennes valeurs pour le suivi
    const oldProduct = {
      ref: product.ref,
      name: product.name,
      quantity: product.quantity,
      location: product.location,
      enTransit: product.enTransit,
    };

    // Si la référence change, on vérifie qu'elle n'existe pas déjà
    if (ref && ref !== product.ref) {
      const existingProduct = await Product.findOne({ ref });

      if (existingProduct) {
        return res.status(409).json({
          message: "Cette référence existe déjà",
        });
      }
    }

    product.name = name;
    product.ref = ref;
    product.quantity = quantity;
    product.location = location;
    product.enTransit = enTransit;

    await product.save();

    res.json({
      message: "Produit modifié avec succès",
      oldProduct,
      newProduct: product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la modification du produit",
    });
  }
};

const addStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: "La quantité doit être un entier supérieur à 0",
      });
    }

    const product = await Product.findOne({
      ref: req.params.ref,
    });

    if (!product) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    const oldQuantity = product.quantity;

    product.quantity += quantity;

    await product.save();

    res.json({
      message: "Stock ajouté avec succès",
      ref: product.ref,
      addedQuantity: quantity,
      oldQuantity,
      newQuantity: product.quantity,
      product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de l'ajout du stock",
    });
  }
};

const removeStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: "La quantité doit être un entier supérieur à 0",
      });
    }

    const product = await Product.findOne({
      ref: req.params.ref,
    });

    if (!product) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    const oldQuantity = product.quantity;

    if (quantity > oldQuantity) {
      return res.status(400).json({
        message: "Stock insuffisant",
        stockDisponible: oldQuantity,
      });
    }

    product.quantity -= quantity;

    await product.save();

    res.json({
      message: "Stock retiré avec succès",
      ref: product.ref,
      removedQuantity: quantity,
      oldQuantity,
      newQuantity: product.quantity,
      product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors du retrait du stock",
    });
  }
};
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ ref: 1 });

    res.json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la récupération des produits",
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      ref: req.params.ref,
    });

    if (!product) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    res.json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la récupération du produit",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { ref, name, quantity, location, enTransit } = req.body;

    const product = await Product.create({
      ref,
      name,
      quantity,
      location,
      enTransit,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Cette référence existe déjà",
      });
    }

    res.status(500).json({
      message: "Erreur lors de la création du produit",
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  addStock,
  deleteTransit,
  removeStock,
  updateProduct,
  sendToSite,
};