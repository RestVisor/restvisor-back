const { sql } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await sql
        .from("usuarios")
        .insert([{ nombre, email, password: hashedPassword, rol }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Usuario registrado", data });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const { data: user, error } = await sql.from("usuarios").select("*").eq("email", email).single();

    if (error || !user) return res.status(401).json({ error: "Usuario no encontrado" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Credenciales incorrectas" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
};

module.exports = { register, login };