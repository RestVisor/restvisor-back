// server.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import routes from "./src/routes/routes.js";
import { sql } from "./src/config/db.js";

const app = express();

app.use(express.json());
app.use(cors());

// Rutas del backend
app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});