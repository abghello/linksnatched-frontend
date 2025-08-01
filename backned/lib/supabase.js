const { createClient } = require('@supabase/supabase-js');
const supabaseConfig = require('../config/supabase.config');

const getSupabaseClient = () => {
  return createClient(
    supabaseConfig.SUPABASE_URL,
    supabaseConfig.SUPABASE_ANON_KEY
  );
};

module.exports = {
  getSupabaseClient,
};
