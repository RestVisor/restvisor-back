const { sql } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        console.log('Registration attempt - Request body:', {
            ...req.body,
            password: '[REDACTED]' // Don't log the actual password
        });

        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            console.log('Registration failed - Missing required fields:', {
                hasName: !!name,
                hasEmail: !!email,
                hasPassword: !!password,
                hasRole: !!role
            });
            return res.status(400).json({ error: "All fields are required" });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Registration failed - Invalid email format:', email);
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Validate password length
        if (password.length < 6) {
            console.log('Registration failed - Password too short');
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        // Validate role
        const validRoles = ['waiter', 'chef', 'admin'];
        if (!validRoles.includes(role)) {
            console.log('Registration failed - Invalid role:', role);
            return res.status(400).json({ error: "Invalid role" });
        }

        console.log('Checking for existing user with email:', email);
        // Check if user already exists
        const { data: existingUser, error: existingUserError } = await sql
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (existingUserError) {
            console.error('Error checking existing user:', existingUserError);
        }

        if (existingUser) {
            console.log('Registration failed - Email already exists:', email);
            return res.status(400).json({ error: "Email already registered" });
        }

        // Hash password
        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        console.log('Attempting to insert new user:', {
            name,
            email,
            role,
            hashedPassword: '[REDACTED]'
        });

        const { data: newUser, error: insertError } = await sql
            .from("users")
            .insert([{ 
                name, 
                email, 
                password: hashedPassword, 
                role 
            }])
            .select()
            .single();

        if (insertError) {
            console.error('Registration error - Database insert failed:', {
                error: insertError,
                errorMessage: insertError.message,
                errorDetails: insertError.details,
                hint: insertError.hint,
                code: insertError.code
            });
            return res.status(500).json({ error: "Error creating user" });
        }

        if (!newUser) {
            console.error('Registration error - User was not created (no error but no user returned)');
            return res.status(500).json({ error: "Error creating user - No user data returned" });
        }

        console.log('User created successfully:', {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role
        });

        // Create JWT token
        console.log('Generating JWT token...');
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Return success without password
        const { password: _, ...userData } = newUser;
        console.log('Registration complete - Sending response');
        res.status(201).json({
            message: "User registered successfully",
            user: userData,
            token
        });
    } catch (error) {
        console.error('Unexpected registration error:', {
            error: error,
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ error: "Internal server error" });
    }
};

const login = async (req, res) => {
    try {
        console.log('Login attempt:', { email: req.body.email });
        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Login failed - Missing credentials');
            return res.status(400).json({ error: "Email and password are required" });
        }

        const { data: user, error: userError } = await sql
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (userError) {
            console.error('Login error - Database query failed:', userError);
        }

        if (!user) {
            console.log('Login failed - User not found:', email);
            return res.status(401).json({ error: "User not found" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            console.log('Login failed - Invalid password for user:', email);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        console.log('Login successful:', { email: user.email, role: user.role });
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Return user data without password
        const { password: _, ...userData } = user;
        res.json({
            user: userData,
            token
        });
    } catch (error) {
        console.error('Unexpected login error:', {
            error: error,
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ error: "Internal server error" });
    }
};

const validateToken = async (req, res) => {
    try {
        // The token is already validated by the authMiddleware
        // We just need to return the user data
        const userId = req.user.id;
        
        const { data: user, error: userError } = await sql
            .from("users")
            .select("id, name, email, role")
            .eq("id", userId)
            .single();
            
        if (userError || !user) {
            console.error('Token validation error - User not found:', userError);
            return res.status(401).json({ error: "User not found" });
        }
        
        res.json({ user });
    } catch (error) {
        console.error('Unexpected token validation error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { register, login, validateToken };
