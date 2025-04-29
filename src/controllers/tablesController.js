const { sql } = require("../config/db");

const getMesas = async (req, res) => {
    const { data, error } = await sql.from("tables").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

const updateMesa = async (req, res) => {
    const { id, estado } = req.body;
    const { data, error } = await sql.from("tables").update({ estado }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

const changeEstadoMesa = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar que el nuevo estado sea válido
    const estadosValidos = ['disponible', 'ocupada', 'reservada'];
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ 
            error: 'Estado inválido', 
            mensaje: `El estado debe ser uno de: ${estadosValidos.join(', ')}`
        });
    }

    try {
        const { data, error } = await sql
            .from("tables")
            .update({ estado })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        
        if (!data) {
            return res.status(404).json({ 
                error: 'Mesa no encontrada',
                mensaje: `No se encontró una mesa con el ID ${id}`
            });
        }

        console.log(`[${new Date().toISOString()}] Estado de mesa actualizado - Mesa ID: ${id}, Nuevo estado: ${estado}`);

        res.json({ 
            mensaje: 'Estado de mesa actualizado exitosamente',
            mesa: data
        });
    } catch (error) {
        console.error('Error al cambiar estado de mesa:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            mensaje: 'No se pudo actualizar el estado de la mesa'
        });
    }
};

// Agregar una nueva mesa
const createMesa = async (req, res) => {
    const { numero, estado } = req.body;

    if (!numero || !estado) {
        return res.status(400).json({ error: "El número y estado de la mesa son obligatorios" });
    }

    const { data, error } = await sql
        .from("tables")
        .insert([{ numero, estado }])
        .select()
        .single();

    if (error) {
        console.error("Error al crear mesa:", error.message);
        return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Mesa creada con éxito", mesa: data });
};

module.exports = { getMesas, updateMesa, createMesa, changeEstadoMesa };