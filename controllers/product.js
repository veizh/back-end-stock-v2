const Product = require("../models/product");
const Ticket = require("../models/ticket");
const Intervention = require("../models/intervention");

/* =========================================================
   INTERVENTIONS
========================================================= */

/**
 * GET /interventions
 *
 * Récupère toutes les interventions.
 */
const getInterventions = async (req, res) => {
  try {
    const interventions = await Intervention.find()
      .sort({ createdAt: -1 });

    res.json(interventions);
  } catch (error) {
    console.error(
      "Erreur récupération interventions :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors de la récupération des interventions",
    });
  }
};

/**
 * GET /interventions/:ref
 *
 * Récupère une intervention par sa ref.
 */
const getIntervention = async (req, res) => {
  try {
    const intervention = await Intervention.findOne({
      ref: req.params.ref,
    });

    if (!intervention) {
      return res.status(404).json({
        message: "Intervention introuvable",
      });
    }

    res.json(intervention);
  } catch (error) {
    console.error(
      "Erreur récupération intervention :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors de la récupération de l'intervention",
    });
  }
};

/**
 * POST /interventions/create
 *
 * Création d'une intervention.
 */
const createIntervention = async (req, res) => {
  try {
    const {
      ref,
      name,
      client,
      site,
      address,
      quoteNumber,
      status,
    } = req.body;

    if (
      !ref ||
      !name ||
      !client ||
      !site ||
      !address
    ) {
      return res.status(400).json({
        message:
          "ref, name, client, site et address sont obligatoires",
      });
    }

    const existingIntervention =
      await Intervention.findOne({ ref });

    if (existingIntervention) {
      return res.status(409).json({
        message:
          "Cette référence d'intervention existe déjà",
      });
    }

    const intervention =
      await Intervention.create({
        ref,
        name,
        client,
        site,
        address,
        quoteNumber: quoteNumber || null,
        status: status || "open",
      });

    res.status(201).json(intervention);
  } catch (error) {
    console.error(
      "Erreur création intervention :",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Cette référence d'intervention existe déjà",
      });
    }

    res.status(500).json({
      message:
        "Erreur lors de la création de l'intervention",
    });
  }
};

/**
 * PUT /interventions/:ref
 *
 * Modification d'une intervention.
 */
const updateIntervention = async (req, res) => {
  try {
    const intervention =
      await Intervention.findOne({
        ref: req.params.ref,
      });

    if (!intervention) {
      return res.status(404).json({
        message: "Intervention introuvable",
      });
    }

    const {
      ref,
      name,
      client,
      site,
      address,
      quoteNumber,
      status,
    } = req.body;

    if (ref && ref !== intervention.ref) {
      const existingIntervention =
        await Intervention.findOne({ ref });

      if (existingIntervention) {
        return res.status(409).json({
          message:
            "Cette référence d'intervention existe déjà",
        });
      }

      intervention.ref = ref;
    }

    if (name !== undefined) {
      intervention.name = name;
    }

    if (client !== undefined) {
      intervention.client = client;
    }

    if (site !== undefined) {
      intervention.site = site;
    }

    if (address !== undefined) {
      intervention.address = address;
    }

    if (quoteNumber !== undefined) {
      intervention.quoteNumber = quoteNumber;
    }

    if (status !== undefined) {
      if (!["open", "closed"].includes(status)) {
        return res.status(400).json({
          message:
            "Le statut doit être 'open' ou 'closed'",
        });
      }

      intervention.status = status;
    }

    await intervention.save();

    res.json({
      message:
        "Intervention modifiée avec succès",
      intervention,
    });
  } catch (error) {
    console.error(
      "Erreur modification intervention :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors de la modification de l'intervention",
    });
  }
};

/**
 * PATCH /interventions/:ref/close
 *
 * Clôture une intervention.
 */
const closeIntervention = async (req, res) => {
  try {
    const intervention =
      await Intervention.findOne({
        ref: req.params.ref,
      });

    if (!intervention) {
      return res.status(404).json({
        message: "Intervention introuvable",
      });
    }

    if (intervention.status === "closed") {
      return res.status(400).json({
        message:
          "Cette intervention est déjà clôturée",
      });
    }

    intervention.status = "closed";

    await intervention.save();

    res.json({
      message:
        "Intervention clôturée avec succès",
      intervention,
    });
  } catch (error) {
    console.error(
      "Erreur clôture intervention :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors de la clôture de l'intervention",
    });
  }
};

/**
 * DELETE /interventions/:ref
 *
 * Suppression d'une intervention.
 */
const deleteIntervention = async (req, res) => {
  try {
    const intervention =
      await Intervention.findOneAndDelete({
        ref: req.params.ref,
      });

    if (!intervention) {
      return res.status(404).json({
        message: "Intervention introuvable",
      });
    }

    res.json({
      message:
        "Intervention supprimée avec succès",
      intervention,
    });
  } catch (error) {
    console.error(
      "Erreur suppression intervention :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors de la suppression de l'intervention",
    });
  }
};

/* =========================================================
   MATÉRIEL D'UNE INTERVENTION
========================================================= */

/**
 * GET /interventions/:ref/products
 *
 * Récupère tout le matériel présent sur une intervention.
 *
 * Product.enTransit :
 *
 * {
 *   interventionRef: "INT-2026-001",
 *   quantity: 5
 * }
 */
const getInterventionProducts = async (req, res) => {
  try {
    const interventionRef = req.params.ref;

    const intervention =
      await Intervention.findOne({
        ref: interventionRef,
      });

    if (!intervention) {
      return res.status(404).json({
        message:
          "Intervention introuvable",
      });
    }

    const products = await Product.find({
      "enTransit.interventionRef":
        intervention.ref,
    }).sort({ ref: 1 });

    const interventionProducts =
      products
        .map((product) => {
          const transit =
            product.enTransit.find(
              (item) =>
                item.interventionRef ===
                intervention.ref
            );

          if (
            !transit ||
            transit.quantity <= 0
          ) {
            return null;
          }

          return {
            ref: product.ref,
            name: product.name,
            quantity: transit.quantity,
          };
        })
        .filter(Boolean);

    res.json({
      intervention: {
        ref: intervention.ref,
        name: intervention.name,
        client: intervention.client,
        site: intervention.site,
      },

      products:
        interventionProducts,
    });
  } catch (error) {
    console.error(
      "Erreur récupération matériel intervention :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors de la récupération du matériel de l'intervention",
    });
  }
};

/**
 * GET /interventions/:ref/products/:productRef
 *
 * Récupère un produit précis sur une intervention.
 */
const getInterventionProduct = async (
  req,
  res
) => {
  try {
    const {
      ref,
      productRef,
    } = req.params;

    const intervention =
      await Intervention.findOne({
        ref,
      });

    if (!intervention) {
      return res.status(404).json({
        message:
          "Intervention introuvable",
      });
    }

    const product =
      await Product.findOne({
        ref: productRef,
      });

    if (!product) {
      return res.status(404).json({
        message:
          "Produit introuvable",
      });
    }

    const transit =
      product.enTransit.find(
        (item) =>
          item.interventionRef ===
          intervention.ref
      );

    if (!transit || transit.quantity <= 0) {
      return res.status(404).json({
        message:
          "Produit absent de cette intervention",
        productRef,
        interventionRef:
          intervention.ref,
      });
    }

    res.json({
      intervention: {
        ref: intervention.ref,
        name: intervention.name,
        site: intervention.site,
      },

      product: {
        ref: product.ref,
        name: product.name,
        quantity: transit.quantity,
      },
    });
  } catch (error) {
    console.error(
      "Erreur récupération produit intervention :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors de la récupération du produit de l'intervention",
    });
  }
};

/* =========================================================
   TICKETS D'UNE INTERVENTION
========================================================= */

/**
 * GET /interventions/:ref/tickets
 *
 * Récupère tous les tickets liés à l'intervention.
 */
const getInterventionTickets = async (
  req,
  res
) => {
  try {
    const interventionRef =
      req.params.ref;

    const intervention =
      await Intervention.findOne({
        ref: interventionRef,
      });

    if (!intervention) {
      return res.status(404).json({
        message:
          "Intervention introuvable",
      });
    }

    const tickets =
      await Ticket.find({
        $or: [
          {
            from: intervention.ref,
          },
          {
            to: intervention.ref,
          },
        ],
      }).sort({
        createdAt: -1,
      });

    res.json({
      intervention: {
        ref: intervention.ref,
        name: intervention.name,
        client: intervention.client,
        site: intervention.site,
      },

      tickets,
    });
  } catch (error) {
    console.error(
      "Erreur récupération tickets intervention :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors de la récupération des tickets de l'intervention",
    });
  }
};

/* =========================================================
   TRANSFERT ENTRE INTERVENTIONS
========================================================= */

/**
 * POST /interventions/:ref/transfer
 *
 * Body :
 *
 * {
 *   "to": "INT-2026-003",
 *   "productRef": "P002",
 *   "quantity": 2
 * }
 *
 * Déplace une quantité de matériel :
 *
 * INT-001 -> INT-003
 */
const transferProduct = async (
  req,
  res
) => {
  try {
    const fromRef =
      req.params.ref;

    const {
      to,
      productRef,
      quantity,
    } = req.body;

    /* =========================
       VALIDATION
    ========================= */

    if (!to) {
      return res.status(400).json({
        message:
          "L'intervention de destination est obligatoire",
      });
    }

    if (!productRef) {
      return res.status(400).json({
        message:
          "La référence du produit est obligatoire",
      });
    }

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        message:
          "La quantité doit être un entier supérieur à 0",
      });
    }

    if (fromRef === to) {
      return res.status(400).json({
        message:
          "Une intervention ne peut pas transférer du matériel vers elle-même",
      });
    }

    /* =========================
       SOURCE
    ========================= */

    const fromIntervention =
      await Intervention.findOne({
        ref: fromRef,
      });

    if (!fromIntervention) {
      return res.status(404).json({
        message:
          "Intervention source introuvable",
      });
    }

    /* =========================
       DESTINATION
    ========================= */

    const toIntervention =
      await Intervention.findOne({
        ref: to,
      });

    if (!toIntervention) {
      return res.status(404).json({
        message:
          "Intervention destination introuvable",
      });
    }

    /* =========================
       STATUTS
    ========================= */

    if (
      fromIntervention.status !==
      "open"
    ) {
      return res.status(400).json({
        message:
          "Impossible de transférer depuis une intervention clôturée",
      });
    }

    if (
      toIntervention.status !==
      "open"
    ) {
      return res.status(400).json({
        message:
          "Impossible de transférer vers une intervention clôturée",
      });
    }

    /* =========================
       PRODUIT
    ========================= */

    const product =
      await Product.findOne({
        ref: productRef,
      });

    if (!product) {
      return res.status(404).json({
        message:
          "Produit introuvable",
      });
    }

    /* =========================
       STOCK SOURCE
    ========================= */

    const sourceTransit =
      product.enTransit.find(
        (item) =>
          item.interventionRef ===
          fromIntervention.ref
      );

    const sourceQuantity =
      sourceTransit
        ? sourceTransit.quantity
        : 0;

    if (
      quantity >
      sourceQuantity
    ) {
      return res.status(400).json({
        message:
          "Stock insuffisant sur l'intervention source",

        stockDisponible:
          sourceQuantity,

        quantityDemandee:
          quantity,

        intervention:
          fromIntervention.ref,
      });
    }

    /* =========================
       RETRAIT SOURCE
    ========================= */

    sourceTransit.quantity -=
      quantity;

    /* =========================
       DESTINATION
    ========================= */

    let destinationTransit =
      product.enTransit.find(
        (item) =>
          item.interventionRef ===
          toIntervention.ref
      );

    const oldDestinationQuantity =
      destinationTransit
        ? destinationTransit.quantity
        : 0;

    if (destinationTransit) {
      destinationTransit.quantity +=
        quantity;
    } else {
      destinationTransit = {
        interventionRef:
          toIntervention.ref,
        quantity,
      };

      product.enTransit.push(
        destinationTransit
      );
    }

    const newDestinationQuantity =
      oldDestinationQuantity +
      quantity;

    /* =========================
       SUPPRESSION DES LIGNES VIDES
    ========================= */

    product.enTransit =
      product.enTransit.filter(
        (item) =>
          item.quantity > 0
      );

    await product.save();

    /* =========================
       TICKET
    ========================= */

    const ticket =
      await Ticket.create({
        type: "SITE_TRANSFER",

        productRef:
          product.ref,

        productName:
          product.name,

        from:
          fromIntervention.ref,

        to:
          toIntervention.ref,

        quantity,

        site:
          toIntervention.site,

        oldTransitQuantity:
          sourceQuantity,

        newTransitQuantity:
          sourceQuantity -
          quantity,

        destinationOldQuantity:
          oldDestinationQuantity,

        destinationNewQuantity:
          newDestinationQuantity,

        action:
          "Transfert de matériel entre interventions",
      });

    res.json({
      message:
        "Transfert effectué avec succès",

      product: {
        ref: product.ref,
        name: product.name,
      },

      from: {
        intervention:
          fromIntervention.ref,

        site:
          fromIntervention.site,

        oldQuantity:
          sourceQuantity,

        newQuantity:
          sourceQuantity -
          quantity,
      },

      to: {
        intervention:
          toIntervention.ref,

        site:
          toIntervention.site,

        oldQuantity:
          oldDestinationQuantity,

        newQuantity:
          newDestinationQuantity,
      },

      ticket,
    });
  } catch (error) {
    console.error(
      "Erreur transfert matériel :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors du transfert du matériel",
    });
  }
};

/* =========================================================
   PRODUITS
========================================================= */

/**
 * GET /products
 */
const getProducts = async (
  req,
  res
) => {
  try {
    const products =
      await Product.find().sort({
        ref: 1,
      });

    res.json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Erreur lors de la récupération des produits",
    });
  }
};

/**
 * GET /products/:ref
 */
const getProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findOne({
        ref: req.params.ref,
      });

    if (!product) {
      return res.status(404).json({
        message:
          "Produit introuvable",
      });
    }

    res.json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Erreur lors de la récupération du produit",
    });
  }
};

/**
 * POST /products
 */
const createProduct = async (
  req,
  res
) => {
  try {
    const {
      ref,
      name,
      quantity,
      location,
      enTransit,
    } = req.body;

    const product =
      await Product.create({
        ref,
        name,
        quantity,
        location,
        enTransit:
          enTransit || [],
      });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Cette référence existe déjà",
      });
    }

    res.status(500).json({
      message:
        "Erreur lors de la création du produit",
    });
  }
};

/**
 * PUT /products/:ref
 */
const updateProduct = async (
  req,
  res
) => {
  try {
    const {
      name,
      ref,
      quantity,
      location,
      enTransit,
    } = req.body;

    const product =
      await Product.findOne({
        ref: req.params.ref,
      });

    if (!product) {
      return res.status(404).json({
        message:
          "Produit introuvable",
      });
    }

    const oldProduct = {
      ref: product.ref,
      name: product.name,
      quantity: product.quantity,
      location: product.location,
      enTransit: product.enTransit,
    };

    if (
      ref &&
      ref !== product.ref
    ) {
      const existingProduct =
        await Product.findOne({
          ref,
        });

      if (existingProduct) {
        return res.status(409).json({
          message:
            "Cette référence existe déjà",
        });
      }
    }

    if (name !== undefined) {
      product.name = name;
    }

    if (ref !== undefined) {
      product.ref = ref;
    }

    if (quantity !== undefined) {
      product.quantity =
        quantity;
    }

    if (location !== undefined) {
      product.location =
        location;
    }

    if (enTransit !== undefined) {
      product.enTransit =
        enTransit;
    }

    await product.save();

    res.json({
      message:
        "Produit modifié avec succès",

      oldProduct,

      newProduct:
        product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Erreur lors de la modification du produit",
    });
  }
};

/* =========================================================
   STOCK CENTRAL
========================================================= */

/**
 * POST /products/:ref/add
 */
const addStock = async (
  req,
  res
) => {
  try {
    const { quantity } =
      req.body;

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        message:
          "La quantité doit être un entier supérieur à 0",
      });
    }

    const product =
      await Product.findOne({
        ref: req.params.ref,
      });

    if (!product) {
      return res.status(404).json({
        message:
          "Produit introuvable",
      });
    }

    const oldQuantity =
      product.quantity;

    product.quantity +=
      quantity;

    await product.save();

    const ticket =
      await Ticket.create({
        type: "STOCK_ADD",

        productRef:
          product.ref,

        productName:
          product.name,

        site:
          product.location,

        quantity,

        oldStock:
          oldQuantity,

        newStock:
          product.quantity,

        from: "STOCK",

        to: "STOCK",

        action:
          "Ajout de stock",
      });

    res.json({
      message:
        "Stock ajouté avec succès",

      ref: product.ref,

      addedQuantity:
        quantity,

      oldQuantity,

      newQuantity:
        product.quantity,

      product,

      ticket,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Erreur lors de l'ajout du stock",
    });
  }
};

/**
 * POST /products/:ref/remove
 */
const removeStock = async (
  req,
  res
) => {
  try {
    const { quantity } =
      req.body;

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        message:
          "La quantité doit être un entier supérieur à 0",
      });
    }

    const product =
      await Product.findOne({
        ref: req.params.ref,
      });

    if (!product) {
      return res.status(404).json({
        message:
          "Produit introuvable",
      });
    }

    const oldQuantity =
      product.quantity;

    if (
      quantity >
      oldQuantity
    ) {
      return res.status(400).json({
        message:
          "Stock insuffisant",

        stockDisponible:
          oldQuantity,
      });
    }

    product.quantity -=
      quantity;

    await product.save();

    const ticket =
      await Ticket.create({
        type: "STOCK_REMOVE",

        productRef:
          product.ref,

        productName:
          product.name,

        site:
          product.location,

        quantity,

        oldStock:
          oldQuantity,

        newStock:
          product.quantity,

        from: "STOCK",

        to: "STOCK",

        action:
          "Retrait de stock",
      });

    res.json({
      message:
        "Stock retiré avec succès",

      ref: product.ref,

      removedQuantity:
        quantity,

      oldQuantity,

      newQuantity:
        product.quantity,

      product,

      ticket,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Erreur lors du retrait du stock",
    });
  }
};

/* =========================================================
   STOCK -> INTERVENTION
========================================================= */

/**
 * POST /products/:ref/send
 *
 * Body :
 *
 * {
 *   "quantity": 2,
 *   "interventionRef": "INT-2026-001"
 * }
 */
const sendToSite = async (
  req,
  res
) => {
  try {
    const {
      quantity,
      interventionRef,
    } = req.body;

    /* =========================
       VALIDATION
    ========================= */

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        message:
          "La quantité doit être un entier supérieur à 0",
      });
    }

    if (!interventionRef) {
      return res.status(400).json({
        message:
          "La référence de l'intervention est obligatoire",
      });
    }

    /* =========================
       INTERVENTION
    ========================= */

    const intervention =
      await Intervention.findOne({
        ref:
          interventionRef.trim(),
      });

    if (!intervention) {
      return res.status(404).json({
        message:
          "Intervention introuvable",
      });
    }

    if (
      intervention.status !==
      "open"
    ) {
      return res.status(400).json({
        message:
          "Impossible d'envoyer du matériel vers une intervention clôturée",
      });
    }

    /* =========================
       PRODUIT
    ========================= */

    const product =
      await Product.findOne({
        ref: req.params.ref,
      });

    if (!product) {
      return res.status(404).json({
        message:
          "Produit introuvable",
        productRef:
          req.params.ref,
      });
    }

    /* =========================
       STOCK ENTREPÔT
    ========================= */

    const oldStock =
      product.quantity;

    if (
      quantity >
      oldStock
    ) {
      return res.status(400).json({
        message:
          "Stock insuffisant",

        stockDisponible:
          oldStock,

        quantityDemandee:
          quantity,
      });
    }

    const newStock =
      oldStock - quantity;

    product.quantity =
      newStock;

    /* =========================
       STOCK INTERVENTION
    ========================= */

    let interventionTransit =
      product.enTransit.find(
        (item) =>
          item.interventionRef ===
          intervention.ref
      );

    const oldTransitQuantity =
      interventionTransit
        ? interventionTransit.quantity
        : 0;

    if (interventionTransit) {
      interventionTransit.quantity +=
        quantity;
    } else {
      product.enTransit.push({
        interventionRef:
          intervention.ref,

        quantity,
      });

      interventionTransit =
        product.enTransit[
          product.enTransit.length - 1
        ];
    }

    const newTransitQuantity =
      oldTransitQuantity +
      quantity;

    await product.save();

    /* =========================
       TICKET
    ========================= */

    const ticket =
      await Ticket.create({
        type: "TRANSIT_SEND",

        productRef:
          product.ref,

        productName:
          product.name,

        from: "STOCK",

        to:
          intervention.ref,

        quantity,

        site:
          intervention.site,

        oldStock,

        newStock,

        oldTransitQuantity,

        newTransitQuantity,

        action:
          `Envoi du produit vers l'intervention ${intervention.ref}`,
      });

    res.json({
      message:
        "Produit envoyé vers l'intervention avec succès",

      intervention: {
        ref:
          intervention.ref,

        name:
          intervention.name,

        site:
          intervention.site,
      },

      product: {
        ref:
          product.ref,

        name:
          product.name,

        oldStock,

        quantity:
          product.quantity,
      },

      interventionStock: {
        oldQuantity:
          oldTransitQuantity,

        newQuantity:
          newTransitQuantity,
      },

      ticket,
    });
  } catch (error) {
    console.error(
      "Erreur envoi produit vers intervention :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors de l'envoi du produit vers l'intervention",
    });
  }
};

/* =========================================================
   INTERVENTION -> STOCK
========================================================= */

/**
 * POST /products/:ref/transit/:interventionRef/return
 *
 * Body :
 *
 * {
 *   "quantity": 2
 * }
 */
const returnTransit = async (
  req,
  res
) => {
  try {
    const {
      ref,
      interventionRef,
    } = req.params;

    const { quantity } =
      req.body;

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        message:
          "La quantité doit être un entier supérieur à 0",
      });
    }

    /* =========================
       PRODUIT
    ========================= */

    const product =
      await Product.findOne({
        ref,
      });

    if (!product) {
      return res.status(404).json({
        message:
          "Produit introuvable",
      });
    }

    /* =========================
       INTERVENTION
    ========================= */

    const intervention =
      await Intervention.findOne({
        ref:
          interventionRef,
      });

    if (!intervention) {
      return res.status(404).json({
        message:
          "Intervention introuvable",
      });
    }

    /* =========================
       STOCK INTERVENTION
    ========================= */

    const transit =
      product.enTransit.find(
        (item) =>
          item.interventionRef ===
          intervention.ref
      );

    if (!transit) {
      return res.status(404).json({
        message:
          "Ce produit n'est pas présent sur cette intervention",
      });
    }

    const oldTransitQuantity =
      transit.quantity;

    if (
      quantity >
      oldTransitQuantity
    ) {
      return res.status(400).json({
        message:
          "La quantité retournée dépasse la quantité présente sur l'intervention",

        quantitySurIntervention:
          oldTransitQuantity,

        quantityDemandee:
          quantity,
      });
    }

    /* =========================
       STOCK ENTREPÔT
    ========================= */

    const oldStock =
      product.quantity;

    product.quantity +=
      quantity;

    transit.quantity -=
      quantity;

    const newTransitQuantity =
      transit.quantity;

    const newStock =
      product.quantity;

    /* =========================
       SUPPRESSION SI 0
    ========================= */

    if (
      transit.quantity <= 0
    ) {
      product.enTransit =
        product.enTransit.filter(
          (item) =>
            item.interventionRef !==
            intervention.ref
        );
    }

    await product.save();

    /* =========================
       TICKET
    ========================= */

    const ticket =
      await Ticket.create({
        type:
          "TRANSIT_RETURN",

        productRef:
          product.ref,

        productName:
          product.name,

        from:
          intervention.ref,

        to: "STOCK",

        quantity,

        site:
          intervention.site,

        oldStock,

        newStock,

        oldTransitQuantity,

        newTransitQuantity,

        action:
          `Retour du produit depuis l'intervention ${intervention.ref} vers le stock`,
      });

    res.json({
      message:
        "Produit retourné au stock avec succès",

      intervention: {
        ref:
          intervention.ref,

        site:
          intervention.site,
      },

      product: {
        ref:
          product.ref,

        name:
          product.name,

        oldStock,

        newStock,
      },

      interventionStock: {
        oldQuantity:
          oldTransitQuantity,

        newQuantity:
          newTransitQuantity,
      },

      ticket,
    });
  } catch (error) {
    console.error(
      "Erreur retour matériel :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors du retour du matériel",
    });
  }
};

/* =========================================================
   SUPPRESSION / ANNULATION D'UNE QUANTITÉ D'INTERVENTION
========================================================= */

/**
 * DELETE /products/:ref/transit/:interventionRef
 *
 * Remet tout le matériel de cette intervention
 * dans le stock central.
 */
const deleteTransit = async (
  req,
  res
) => {
  try {
    const {
      ref,
      interventionRef,
    } = req.params;

    const product =
      await Product.findOne({
        ref,
      });

    if (!product) {
      return res.status(404).json({
        message:
          "Produit introuvable",
      });
    }

    const intervention =
      await Intervention.findOne({
        ref:
          interventionRef,
      });

    if (!intervention) {
      return res.status(404).json({
        message:
          "Intervention introuvable",
      });
    }

    const transit =
      product.enTransit.find(
        (item) =>
          item.interventionRef ===
          intervention.ref
      );

    if (!transit) {
      return res.status(404).json({
        message:
          "Ce produit n'est pas présent sur cette intervention",
      });
    }

    const returnedQuantity =
      transit.quantity;

    const oldStock =
      product.quantity;

    product.quantity +=
      returnedQuantity;

    product.enTransit =
      product.enTransit.filter(
        (item) =>
          item.interventionRef !==
          intervention.ref
      );

    await product.save();

    const ticket =
      await Ticket.create({
        type:
          "TRANSIT_RETURN",

        productRef:
          product.ref,

        productName:
          product.name,

        from:
          intervention.ref,

        to: "STOCK",

        quantity:
          returnedQuantity,

        site:
          intervention.site,

        oldStock,

        newStock:
          product.quantity,

        oldTransitQuantity:
          returnedQuantity,

        newTransitQuantity: 0,

        action:
          `Retour complet du matériel de l'intervention ${intervention.ref} vers le stock`,
      });

    res.json({
      message:
        "Matériel retourné au stock avec succès",

      intervention: {
        ref:
          intervention.ref,

        site:
          intervention.site,
      },

      product: {
        ref:
          product.ref,

        name:
          product.name,

        returnedQuantity,

        oldStock,

        newStock:
          product.quantity,
      },

      ticket,
    });
  } catch (error) {
    console.error(
      "Erreur suppression matériel intervention :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors du retour du matériel au stock",
    });
  }
};

/* =========================================================
   TICKETS
========================================================= */

/**
 * GET /tickets
 */
const getTickets = async (
  req,
  res
) => {
  try {
    const tickets =
      await Ticket.find().sort({
        createdAt: -1,
      });

    res.json(tickets);
  } catch (error) {
    console.error(
      "Erreur récupération tickets :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors de la récupération des tickets",
    });
  }
};

/**
 * GET /tickets/:id
 */
const getTicket = async (
  req,
  res
) => {
  try {
    const ticket =
      await Ticket.findById(
        req.params.id
      );

    if (!ticket) {
      return res.status(404).json({
        message:
          "Ticket introuvable",
      });
    }

    res.json(ticket);
  } catch (error) {
    console.error(
      "Erreur récupération ticket :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors de la récupération du ticket",
    });
  }
};

/* =========================================================
   PRODUIT SUR UNE INTERVENTION
========================================================= */

/**
 * GET /products/:productRef/intervention/:interventionRef
 *
 * Récupère la quantité d'un produit
 * présente sur une intervention.
 */
const getProductOnIntervention =
  async (req, res) => {
    try {
      const {
        productRef,
        interventionRef,
      } = req.params;

      const intervention =
        await Intervention.findOne({
          ref:
            interventionRef,
        });

      if (!intervention) {
        return res.status(404).json({
          message:
            "Intervention introuvable",
        });
      }

      const product =
        await Product.findOne({
          ref: productRef,
        });

      if (!product) {
        return res.status(404).json({
          message:
            "Produit introuvable",
        });
      }

      const transit =
        product.enTransit.find(
          (item) =>
            item.interventionRef ===
            intervention.ref
        );

      const quantity =
        transit
          ? transit.quantity
          : 0;

      res.json({
        intervention: {
          ref:
            intervention.ref,

          name:
            intervention.name,

          site:
            intervention.site,
        },

        product: {
          ref:
            product.ref,

          name:
            product.name,

          quantity,
        },
      });
    } catch (error) {
      console.error(
        "Erreur récupération produit intervention :",
        error
      );

      res.status(500).json({
        message:
          "Erreur lors de la récupération du produit sur l'intervention",
      });
    }
  };

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  /* Interventions */
  getInterventions,
  getIntervention,
  createIntervention,
  updateIntervention,
  closeIntervention,
  deleteIntervention,

  /* Matériel intervention */
  getInterventionProducts,
  getInterventionProduct,
  getInterventionTickets,

  /* Transfert */
  transferProduct,

  /* Products */
  getProducts,
  getProduct,
  createProduct,
  updateProduct,

  /* Stock */
  addStock,
  removeStock,

  /* Stock -> intervention */
  sendToSite,

  /* Intervention -> stock */
  returnTransit,
  deleteTransit,

  /* Produit sur intervention */
  getProductOnIntervention,

  /* Tickets */
  getTickets,
  getTicket,
};