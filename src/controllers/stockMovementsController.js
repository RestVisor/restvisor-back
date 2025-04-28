const { sql } = require('../config/db');

// Get all stock movements
const getAllStockMovements = async (req, res) => {
    try {
        const { data, error } = await sql.from('stock_movements').select('*').order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching stock movements:', error);
            return res.status(500).json({ error: error.message });
        }

        // Format data to match frontend expectations
        const formattedData = data.map((movement) => ({
            id: movement.id,
            productId: movement.product_id,
            productName: movement.product_name || 'Unknown Product', // We'll need to join with products in the future
            quantity: movement.quantity,
            type: movement.type === 'in' ? 'entrada' : 'salida',
            reason: movement.notes,
            date: movement.created_at,
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching stock movements:', error);
        res.status(500).json({ error: 'Failed to fetch stock movements' });
    }
};

// Get a single stock movement by ID
const getStockMovementById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await sql.from('stock_movements').select('*').eq('id', id).single();

        if (error) {
            console.error(`Error fetching stock movement with ID ${id}:`, error);
            return res.status(404).json({ error: 'Stock movement not found' });
        }

        res.json(data);
    } catch (error) {
        console.error(`Error fetching stock movement with ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to fetch stock movement' });
    }
};

// Create a new stock movement
const createStockMovement = async (req, res) => {
    console.log('Received stock movement data:', req.body);

    // Extract data from the request body, handle both formats
    // Frontend sends: productId, quantity, type (entrada/salida), reason, date
    // Our backend expects: product_id, quantity, type (in/out), notes

    const {
        product_id,
        quantity,
        type,
        notes, // Backend format
        productId,
        reason,
        date, // Frontend format
    } = req.body;

    // Determine which format is being used
    const actualProductId = productId || product_id;
    const actualType = type ? (type === 'entrada' ? 'in' : 'out') : req.body.type === 'entrada' ? 'in' : 'out';
    const actualNotes = notes || reason || '';

    if (!actualProductId || !quantity) {
        return res.status(400).json({ error: 'Missing required fields: product ID and quantity are required' });
    }

    try {
        // Get product info to include product name
        const { data: productData, error: productError } = await sql
            .from('products')
            .select('name')
            .eq('id', actualProductId)
            .single();

        if (productError) {
            console.error('Error fetching product information:', productError);
            return res.status(404).json({ error: 'Product not found' });
        }

        // Insert the stock movement
        const { data: stockMovement, error: insertError } = await sql
            .from('stock_movements')
            .insert([
                {
                    product_id: actualProductId,
                    product_name: productData.name,
                    quantity,
                    type: actualType,
                    notes: actualNotes,
                },
            ])
            .select();

        if (insertError) {
            console.error('Error creating stock movement:', insertError);
            return res.status(500).json({ error: insertError.message });
        }

        console.log('Stock movement created successfully:', stockMovement);

        // Update product stock based on movement type
        if (actualType === 'in') {
            const { error: updateError } = await sql.rpc('increment_stock', {
                p_product_id: actualProductId,
                p_quantity: quantity,
            });

            if (updateError) {
                console.error('Error updating product stock:', updateError);
                return res.status(500).json({ error: updateError.message });
            }
        } else if (actualType === 'out') {
            const { error: updateError } = await sql.rpc('decrement_stock', {
                p_product_id: actualProductId,
                p_quantity: quantity,
            });

            if (updateError) {
                console.error('Error updating product stock:', updateError);
                return res.status(500).json({ error: updateError.message });
            }
        }

        // Format response to match frontend expectations
        const formattedResponse = {
            id: stockMovement[0].id,
            productId: stockMovement[0].product_id,
            productName: productData.name,
            quantity: stockMovement[0].quantity,
            type: stockMovement[0].type === 'in' ? 'entrada' : 'salida',
            reason: stockMovement[0].notes,
            date: stockMovement[0].created_at,
        };

        res.status(201).json(formattedResponse);
    } catch (error) {
        console.error('Error creating stock movement:', error);
        res.status(500).json({ error: 'Failed to create stock movement' });
    }
};

// Update a stock movement
const updateStockMovement = async (req, res) => {
    const { id } = req.params;
    const { product_id, quantity, type, notes } = req.body;

    try {
        // Get the original movement to calculate stock adjustments
        const { data: originalData, error: fetchError } = await sql
            .from('stock_movements')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error(`Error fetching original stock movement with ID ${id}:`, fetchError);
            return res.status(404).json({ error: 'Stock movement not found' });
        }

        // Revert the original stock change
        if (originalData.type === 'in') {
            const { error: revertError } = await sql.rpc('decrement_stock', {
                p_product_id: originalData.product_id,
                p_quantity: originalData.quantity,
            });

            if (revertError) {
                console.error('Error reverting original stock change:', revertError);
                return res.status(500).json({ error: revertError.message });
            }
        } else if (originalData.type === 'out') {
            const { error: revertError } = await sql.rpc('increment_stock', {
                p_product_id: originalData.product_id,
                p_quantity: originalData.quantity,
            });

            if (revertError) {
                console.error('Error reverting original stock change:', revertError);
                return res.status(500).json({ error: revertError.message });
            }
        }

        // Update the movement record
        const { data: updatedData, error: updateError } = await sql
            .from('stock_movements')
            .update({ product_id, quantity, type, notes, updated_at: new Date() })
            .eq('id', id)
            .select();

        if (updateError) {
            console.error(`Error updating stock movement with ID ${id}:`, updateError);
            return res.status(500).json({ error: updateError.message });
        }

        // Apply the new stock change
        if (type === 'in') {
            const { error: applyError } = await sql.rpc('increment_stock', {
                p_product_id: product_id,
                p_quantity: quantity,
            });

            if (applyError) {
                console.error('Error applying new stock change:', applyError);
                return res.status(500).json({ error: applyError.message });
            }
        } else if (type === 'out') {
            const { error: applyError } = await sql.rpc('decrement_stock', {
                p_product_id: product_id,
                p_quantity: quantity,
            });

            if (applyError) {
                console.error('Error applying new stock change:', applyError);
                return res.status(500).json({ error: applyError.message });
            }
        }

        res.json(updatedData[0]);
    } catch (error) {
        console.error(`Error updating stock movement with ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to update stock movement' });
    }
};

// Delete a stock movement
const deleteStockMovement = async (req, res) => {
    const { id } = req.params;

    try {
        // Get the movement to revert stock changes
        const { data: originalData, error: fetchError } = await sql
            .from('stock_movements')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error(`Error fetching stock movement with ID ${id} for deletion:`, fetchError);
            return res.status(404).json({ error: 'Stock movement not found' });
        }

        // Revert the stock change
        if (originalData.type === 'in') {
            const { error: revertError } = await sql.rpc('decrement_stock', {
                p_product_id: originalData.product_id,
                p_quantity: originalData.quantity,
            });

            if (revertError) {
                console.error('Error reverting stock change for deletion:', revertError);
                return res.status(500).json({ error: revertError.message });
            }
        } else if (originalData.type === 'out') {
            const { error: revertError } = await sql.rpc('increment_stock', {
                p_product_id: originalData.product_id,
                p_quantity: originalData.quantity,
            });

            if (revertError) {
                console.error('Error reverting stock change for deletion:', revertError);
                return res.status(500).json({ error: revertError.message });
            }
        }

        // Delete the movement record
        const { error: deleteError } = await sql.from('stock_movements').delete().eq('id', id);

        if (deleteError) {
            console.error(`Error deleting stock movement with ID ${id}:`, deleteError);
            return res.status(500).json({ error: deleteError.message });
        }

        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting stock movement with ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to delete stock movement' });
    }
};

module.exports = {
    getAllStockMovements,
    getStockMovementById,
    createStockMovement,
    updateStockMovement,
    deleteStockMovement,
};
