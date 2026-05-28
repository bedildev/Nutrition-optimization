const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        transport: ws,
      },
    })
  : null;

function hasSupabase() {
  return Boolean(supabase);
}

function hasAdmin() {
  return Boolean(supabase && supabase.auth && supabase.auth.admin);
}

module.exports = {
  supabase,
  hasSupabase,
  hasAdmin,
};
