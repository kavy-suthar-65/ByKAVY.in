import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n  ✖ Missing Supabase credentials!');
  console.error('  → Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  console.error('  → Find them at: Supabase Dashboard → Settings → API\n');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabase;

