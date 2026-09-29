const Product = require("../models/product");
const Ticket = require("../models/ticket");
const Intervention = require("../models/intervention");

/* =========================================================
   HELPERS
========================================================= */

const generateTransitRef = () => {
  return `TR-${Date.now().toString(36).toUpperCase()}`;
};

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
      message: "Erreur lors de la récupération des interventions",
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
      message: "Erreur lors de la récupération de l'intervention",
    });
  }
};

/**
 * POST /interventions
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

    if (!ref || !name || !client || !site || !address) {
      return res.status(400).json({
        message:
          "ref, name, client, site et address sont obligatoires",
      });
    }

    const existingIntervention =
      await Intervention.findOne({ ref });

    if (existingIntervention) {
      return res.status(409).json({
        message: "Cette référence d'intervention existe déjà",
      });
    }

    const intervention = await Intervention.create({
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
        message: "Cette référence d'intervention existe déjà",
      });
    }

    res.status(500).json({
      message: "Erreur lors de la création de l'intervention",
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
    const intervention = await Intervention.findOne({
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
      message: "Intervention modifiée avec succès",
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
    const intervention = await Intervention.findOne({
      ref: req.params.ref,
    });

    if (!intervention) {
      return res.status(404).json({
        message: "Intervention introuvable",
      });
    }

    if (intervention.status === "closed") {
      return res.status(400).json({
        message: "Cette intervention est déjà clôturée",
      });
    }

    intervention.status = "closed";

    await intervention.save();

    res.json({
      message: "Intervention clôturée avec succès",
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
    const intervention = await Intervention.findOneAndDelete({
      ref: req.params.ref,
    });

    if (!intervention) {
      return res.status(404).json({
        message: "Intervention introuvable",
      });
    }

    res.json({
      message: "Intervention supprimée avec succès",
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
 * GET /interventions/:ref/items
 *
 * Récupère tout le matériel présent sur le site
 * de l'intervention.
 *
 * On utilise intervention.site pour faire le lien
 * avec Product.location.
 */
const getInterventionProducts = async (req, res) => {
  try {
    const intervention = await Intervention.findOne({
      ref: req.params.ref,
    });

    if (!intervention) {
      return res.status(404).json({
        message: "Intervention introuvable",
      });
    }

    const products = await Product.find({
      location: intervention.site,
    }).sort({ ref: 1 });

    res.json({
      intervention: {
        ref: intervention.ref,
        site: intervention.site,
      },
      products,
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
 * GET /interventions/:ref/tickets
 *
 * Récupère tous les tickets liés à l'intervention.
 *
 * Un ticket est lié si :
 *
 * from === intervention.ref
 *
 * OU
 *
 * to === intervention.ref
 */
const getInterventionTickets = async (req, res) => {
  try {
    const intervention = await Intervention.findOne({
      ref: req.params.ref,
    });

    if (!intervention) {
      return res.status(404).json({
        message: "Intervention introuvable",
      });
    }

    const tickets = await Ticket.find({
      $or: [
        { from: intervention.ref },
        { to: intervention.ref },
      ],
    }).sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error(
      "Erreur récupération tickets intervention :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors de la récupération des tickets",
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
 *   "to": "INT-2026-002",
 *   "productRef": "P001",
 *   "quantity": 3
 * }
 *
 * Le produit est recherché avec :
 *
 * product.ref = productRef
 * product.location = site de l'intervention source
 *
 * Puis :
 *
 * source.quantity -= quantity
 *
 * destination.quantity += quantity
 *
 * Et création d'un ticket SITE_TRANSFER.
 */
const transferProduct = async (req, res) => {
  try {
    const fromRef = req.params.ref;

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
       INTERVENTION SOURCE
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
       INTERVENTION DESTINATION
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

    if (fromIntervention.status !== "open") {
      return res.status(400).json({
        message:
          "Impossible de transférer depuis une intervention clôturée",
      });
    }

    if (toIntervention.status !== "open") {
      return res.status(400).json({
        message:
          "Impossible de transférer vers une intervention clôturée",
      });
    }

    /* =========================
       PRODUIT
    ========================= */

    const product = await Product.findOne({
      ref: productRef,
    });

    if (!product) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    /* =========================
       STOCK DISPONIBLE SUR
       L'INTERVENTION SOURCE
    ========================= */

    const sourceSite =
      fromIntervention.site;

    const destinationSite =
      toIntervention.site;

    const sourceTransit =
      product.enTransit.filter(
        (transit) =>
          transit.site === sourceSite
      );

    const stockSurSite =
      sourceTransit.reduce(
        (total, transit) =>
          total + transit.quantity,
        0
      );

    if (quantity > stockSurSite) {
      return res.status(400).json({
        message:
          "Stock insuffisant sur l'intervention source",
        stockDisponible: stockSurSite,
        quantityDemandee: quantity,
        site: sourceSite,
      });
    }

    /* =========================
       RETRAIT DU SITE SOURCE
    ========================= */

    let remaining =
      quantity;

    for (
      let i = 0;
      i < product.enTransit.length &&
      remaining > 0;
      i++
    ) {
      const transit =
        product.enTransit[i];

      if (
        transit.site !== sourceSite ||
        transit.quantity <= 0
      ) {
        continue;
      }

      const removeQuantity =
        Math.min(
          transit.quantity,
          remaining
        );

      transit.quantity -=
        removeQuantity;

      remaining -=
        removeQuantity;
    }

    /* =========================
       SUPPRESSION DES TRANSITS
       VIDES
    ========================= */

    product.enTransit =
      product.enTransit.filter(
        (transit) =>
          transit.quantity > 0
      );

    /* =========================
       AJOUT AU SITE DESTINATION
    ========================= */

    product.enTransit.push({
      ref: generateTransitRef(),
      quantity,
      site: destinationSite,
    });

    await product.save();

    /* =========================
       TICKET
    ========================= */

    const ticket = await Ticket.create({
      type: "SITE_TRANSFER",

      productRef: product.ref,

      productName: product.name,

      from: fromIntervention.ref,

      to: toIntervention.ref,

      site: destinationSite,

      quantity,

      action:
        "Transfert de matériel entre interventions",
    });

    /* =========================
       RÉPONSE
    ========================= */

    res.json({
      message:
        "Transfert effectué avec succès",

      productRef: product.ref,

      from: {
        intervention:
          fromIntervention.ref,
        site: sourceSite,
        quantityTransferred:
          quantity,
      },

      to: {
        intervention:
          toIntervention.ref,
        site: destinationSite,
        quantityReceived:
          quantity,
      },

      ticket,

      product,
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
   PRODUITS / STOCK
========================================================= */

/**
 * GET /products
 */
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ ref: 1 });

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
      message:
        "Erreur lors de la récupération du produit",
    });
  }
};

/**
 * POST /products
 */
const createProduct = async (req, res) => {
  try {
    const {
      ref,
      name,
      quantity,
      location,
      enTransit,
    } = req.body;

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
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      ref,
      quantity,
      location,
      enTransit,
    } = req.body;

    const product = await Product.findOne({
      ref: req.params.ref,
    });

    if (!product) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    const oldProduct = {
      ref: product.ref,
      name: product.name,
      quantity: product.quantity,
      location: product.location,
      enTransit: product.enTransit,
    };

    if (ref && ref !== product.ref) {
      const existingProduct =
        await Product.findOne({ ref });

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
      product.quantity = quantity;
    }

    if (location !== undefined) {
      product.location = location;
    }

    if (enTransit !== undefined) {
      product.enTransit = enTransit;
    }

    await product.save();

    res.json({
      message:
        "Produit modifié avec succès",
      oldProduct,
      newProduct: product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Erreur lors de la modification du produit",
    });
  }
};

/**
 * POST /products/:ref/add
 */
const addStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        message:
          "La quantité doit être un entier supérieur à 0",
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

    /*
     * Ticket historique du mouvement.
     */
    const ticket = await Ticket.create({
      type: "STOCK_ADD",

      productRef: product.ref,

      productName: product.name,

      site: product.location,

      quantity,

      oldStock: oldQuantity,

      newStock: product.quantity,

      action: "Ajout de stock",
    });

    res.json({
      message:
        "Stock ajouté avec succès",

      ref: product.ref,

      addedQuantity: quantity,

      oldQuantity,

      newQuantity: product.quantity,

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
const removeStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        message:
          "La quantité doit être un entier supérieur à 0",
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

    /*
     * Ticket historique du mouvement.
     */
    const ticket = await Ticket.create({
      type: "STOCK_REMOVE",

      productRef: product.ref,

      productName: product.name,

      site: product.location,

      quantity,

      oldStock: oldQuantity,

      newStock: product.quantity,

      action: "Retrait de stock",
    });

    res.json({
      message:
        "Stock retiré avec succès",

      ref: product.ref,

      removedQuantity: quantity,

      oldQuantity,

      newQuantity: product.quantity,

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
   TRANSIT
========================================================= */

/**
 * POST /products/:ref/send
 */
const sendToSite = async (req, res) => {
  try {
    const { quantity, interventionRef } = req.body;

    // Vérification quantité
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: "La quantité doit être un entier supérieur à 0",
      });
    }

    // Vérification intervention
    if (!interventionRef) {
      return res.status(400).json({
        message: "La référence de l'intervention est obligatoire",
      });
    }

    const intervention = await Intervention.findOne({
      ref: interventionRef.trim(),
    });

    if (!intervention) {
      return res.status(404).json({
        message: "Intervention introuvable",
      });
    }

    // Intervention obligatoirement ouverte
    if (intervention.status !== "open") {
      return res.status(400).json({
        message: "Impossible d'envoyer du matériel vers une intervention clôturée",
      });
    }

    const product = await Product.findOne({
      ref: req.params.ref,
    });

    if (!product) {
      return res.status(404).json({
        message: "Produit introuvable",
        productRef: req.params.ref,
      });
    }

    // Stock disponible avant modification
    const oldStock = product.quantity;

    // Vérification du stock
    if (quantity > oldStock) {
      return res.status(400).json({
        message: "Stock insuffisant",
        stockDisponible: oldStock,
        quantityDemandee: quantity,
      });
    }

    const site = intervention.site;

    // Génération référence transit
    const transitRef = generateTransitRef();

    // Nouveau stock central
    const newStock = oldStock - quantity;

    // Retrait du stock central
    product.quantity = newStock;

    // Ajout du matériel sur le site
    product.enTransit.push({
      ref: transitRef,
      quantity,
      site,
    });

    await product.save();

    // Création du ticket
    const ticket = await Ticket.create({
      type: "TRANSIT_SEND",
      productRef: product.ref,
      productName: product.name,
      transitRef,
      interventionRef: intervention.ref,
      site,
      quantity,
      oldStock,
      newStock,
      action: `Envoi du produit vers l'intervention ${intervention.ref}`,
    });

    res.json({
      message: "Produit envoyé vers l'intervention avec succès",

      intervention: {
        ref: intervention.ref,
        name: intervention.name,
        site: intervention.site,
      },

      product: {
        ref: product.ref,
        name: product.name,
        oldStock,
        quantity: product.quantity,
      },

      transit: {
        ref: transitRef,
        quantity,
        site,
      },

      ticket,
    });
  } catch (error) {
    console.error(
      "Erreur envoi produit vers intervention :",
      error
    );

    res.status(500).json({
      message: "Erreur lors de l'envoi du produit vers l'intervention",
    });
  }
};
/**
 * POST /products/:ref/transit/:transitRef/return
 */
const returnTransit = async (req, res) => {
  try {
    const {
      ref,
      transitRef,
    } = req.params;

    const { quantity } = req.body;

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        message:
          "La quantité doit être un entier supérieur à 0",
      });
    }

    const product = await Product.findOne({
      ref,
    });

    if (!product) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    const transitIndex =
      product.enTransit.findIndex(
        (transit) =>
          transit.ref === transitRef
      );

    if (transitIndex === -1) {
      return res.status(404).json({
        message: "Transit introuvable",
        transitRef,
      });
    }

    const transit =
      product.enTransit[transitIndex];

    if (quantity > transit.quantity) {
      return res.status(400).json({
        message:
          "La quantité retournée dépasse la quantité en transit",

        quantityEnTransit:
          transit.quantity,

        quantityDemandee:
          quantity,
      });
    }

    const oldStock =
      product.quantity;

    const oldTransitQuantity =
      transit.quantity;

    product.quantity += quantity;

    if (
      quantity === transit.quantity
    ) {
      product.enTransit.splice(
        transitIndex,
        1
      );
    } else {
      transit.quantity -= quantity;
    }

    const newStock =
      product.quantity;

    const newTransitQuantity =
      quantity === oldTransitQuantity
        ? 0
        : transit.quantity;

    await product.save();

    const ticket =
      await Ticket.create({
        type: "TRANSIT_RETURN",

        productRef: product.ref,

        productName: product.name,

        transitRef: transit.ref,

        site: transit.site,

        quantity,

        oldStock,

        newStock,

        oldTransitQuantity,

        newTransitQuantity,

        action:
          quantity === oldTransitQuantity
            ? "Retour complet du transit vers l'entrepôt"
            : "Retour partiel du transit vers l'entrepôt",
      });

    res.json({
      message:
        quantity === oldTransitQuantity
          ? "Transit retourné entièrement en stock"
          : "Une partie du transit a été retournée en stock",

      product,

      transitRef,

      site: transit.site,

      returnedQuantity: quantity,

      oldStock,

      newStock,

      oldTransitQuantity,

      newTransitQuantity,

      ticket,
    });
  } catch (error) {
    console.error(
      "Erreur retour transit :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors du retour du transit en stock",
    });
  }
};

/**
 * DELETE /products/:ref/transit/:transitRef
 */
const deleteTransit = async (req, res) => {
  try {
    const {
      ref,
      transitRef,
    } = req.params;

    const product = await Product.findOne({
      ref,
    });

    if (!product) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    const transitIndex =
      product.enTransit.findIndex(
        (transit) =>
          transit.ref === transitRef
      );

    if (transitIndex === -1) {
      return res.status(404).json({
        message: "Transit introuvable",
        transitRef,
      });
    }

    const transit =
      product.enTransit[transitIndex];

    const oldQuantity =
      product.quantity;

    product.quantity +=
      transit.quantity;

    product.enTransit.splice(
      transitIndex,
      1
    );

    await product.save();

    const ticket =
      await Ticket.create({
        type: "TRANSIT_RETURN",

        productRef: product.ref,

        productName: product.name,

        transitRef: transit.ref,

        site: transit.site,

        quantity: transit.quantity,

        oldStock: oldQuantity,

        newStock: product.quantity,

        oldTransitQuantity:
          transit.quantity,

        newTransitQuantity: 0,

        action:
          "Suppression du transit et retour en stock",
      });

    res.json({
      message:
        `Transit ${transitRef} supprimé. ${transit.quantity} objets ont été remis en stock.`,

      ref: product.ref,

      transitRef: transit.ref,

      site: transit.site,

      returnedQuantity:
        transit.quantity,

      oldQuantity,

      newQuantity:
        product.quantity,

      remainingTransits:
        product.enTransit,

      product,

      ticket,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Erreur lors de la suppression du transit",
    });
  }
};

/* =========================================================
   TICKETS
========================================================= */

/**
 * GET /tickets
 *
 * Tous les tickets.
 */
const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .sort({ createdAt: -1 });

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
 *
 * Ticket unique.
 */
const getTicket = async (req, res) => {
  try {
    const ticket =
      await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket introuvable",
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
const getinterventionsProducts = async (req, res) => {
  try {
    const interventionRef = req.params.ref;

    // =========================
    // INTERVENTION
    // =========================

    const intervention = await Intervention.findOne({
      ref: interventionRef,
    });

    if (!intervention) {
      return res.status(404).json({
        message: "Intervention introuvable",
      });
    }

    const site = intervention.site;

    // =========================
    // PRODUITS
    // =========================

    const products = await Product.find({
      "enTransit.site": site,
    });

    // =========================
    // MATÉRIEL DU SITE
    // =========================

    const siteProducts = products
      .map((product) => {
        const siteTransits =
          product.enTransit.filter(
            (transit) =>
              transit.site === site
          );

        const quantity =
          siteTransits.reduce(
            (total, transit) =>
              total + transit.quantity,
            0
          );

        return {
          ref: product.ref,
          name: product.name,
          quantity,
          site,
        };
      })
      .filter(
        (product) =>
          product.quantity > 0
      );

    // =========================
    // RÉPONSE
    // =========================

    res.json({
      intervention: {
        ref: intervention.ref,
        name: intervention.name,
        client: intervention.client,
        site: intervention.site,
      },

      products: siteProducts,
    });
  } catch (error) {
    console.error(
      "Erreur récupération matériel du site :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors de la récupération du matériel du site",
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
  getInterventionProducts,
  getInterventionTickets,
  transferProduct,

  /* Products */
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  addStock,
  removeStock,
  getinterventionsProducts,
  /* Transit */
  sendToSite,
  returnTransit,
  deleteTransit,

  /* Tickets */
  getTickets,
  getTicket,
};