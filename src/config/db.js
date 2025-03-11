const { createClient } = require("@supabase/supabase-js");

const sql = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = { sql };