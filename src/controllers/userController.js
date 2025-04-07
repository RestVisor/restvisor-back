const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });

        // Return user info and token
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error during login' });
    }
};

// Register new user
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate role
        const validRoles = ['admin', 'chef', 'waiter'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Create new user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([
                {
                    name,
                    email,
                    password: hashedPassword,
                    role,
                },
            ])
            .select('id, name, email, role')
            .single();

        if (error) throw error;

        // Generate JWT token
        const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });

        res.status(201).json({
            user: newUser,
            token,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Error during registration' });
    }
};

// Validate token
const validateToken = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// List all users
const listUsers = async (req, res) => {
    try {
        const { data: users, error } = await supabase.from('users').select('id, name, email, role').order('id');

        if (error) throw error;

        res.json(users);
    } catch (error) {
        console.error('Error listing users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
};

// Get a single user
const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Error fetching user' });
    }
};

// Create a new user
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate role
        const validRoles = ['admin', 'chef', 'waiter'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Create new user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([
                {
                    name,
                    email,
                    password: hashedPassword,
                    role,
                },
            ])
            .select('id, name, email, role')
            .single();

        if (error) throw error;

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
};

// Update a user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        // Validate role if provided
        if (role) {
            const validRoles = ['admin', 'chef', 'waiter'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ error: 'Invalid role' });
            }
        }

        // Build update object
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Update user
        const { data: updatedUser, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select('id, name, email, role')
            .single();

        if (error) throw error;
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Error updating user' });
    }
};

// Delete a user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase.from('users').delete().eq('id', id);

        if (error) throw error;

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
};

module.exports = {
    login,
    register,
    validateToken,
    listUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
};
