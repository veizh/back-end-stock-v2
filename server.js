require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./db/mongoDB");
const productRoutes = require("./routes/product");
const interventionRoutes = require("./routes/intervention");
const ticketRoutes = require("./routes/ticket");


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Stock API OK",
  });
});
app.use("/api/interventions", interventionRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API démarrée sur http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erreur MongoDB :", error);
  });