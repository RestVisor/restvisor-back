require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const routes = require("./src/routes");

app.use(express.json());
app.use(cors());

app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});