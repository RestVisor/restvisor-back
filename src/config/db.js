const { createClient } = require("@supabase/supabase-js");

console.log('Initializing Supabase client with:', {
    url: process.env.SUPABASE_URL,
    keyLength: process.env.SUPABASE_KEY?.length || 0
});

const sql = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Test the connection and verify table schema
(async () => {
    try {
        // First, check if we can connect and if the table exists
        const { data, error: tableError } = await sql
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (tableError) {
            console.error('Database connection test failed:', tableError);
            if (tableError.code === 'PGRST204') {
                console.error('Table "users" might not exist. Please create it with the following SQL:');
                console.error(`
                    CREATE TABLE users (
                        id SERIAL PRIMARY KEY,
                        nombre TEXT NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL,
                        rol TEXT NOT NULL CHECK (rol IN ('waiter', 'chef', 'admin'))
                    );
                `);
            }
            return;
        }

        console.log('Database connection successful, table exists');

        // Now, let's verify the table structure
        const { data: columns, error: describeError } = await sql
            .from('users')
            .select()
            .limit(0);

        if (describeError) {
            console.error('Error checking table structure:', describeError);
            return;
        }

        // Log the table structure
        console.log('Table structure verification:', {
            hasIdColumn: 'id' in (columns?.[0] || {}),
            hasNombreColumn: 'nombre' in (columns?.[0] || {}),
            hasEmailColumn: 'email' in (columns?.[0] || {}),
            hasPasswordColumn: 'password' in (columns?.[0] || {}),
            hasRolColumn: 'rol' in (columns?.[0] || {})
        });

    } catch (error) {
        console.error('Error testing database connection:', {
            message: error.message,
            details: error?.details,
            hint: error?.hint
        });
    }
})();

module.exports = { sql };
