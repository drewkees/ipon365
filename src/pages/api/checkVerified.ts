import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase setup (service role key)
const SUPABASE_URL = 'https://dhmzeevajtwjhhmcglob.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXplZXZhanR3amhobWNnbG9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0MjAwMiwiZXhwIjoyMDgzMTE4MDAyfQ.JmMKNriCjky31T953l_9AYRk42OJwefcB6PSHl9Dv6M';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  console.log('checkVerified API hit');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Call the SQL function
    const { data, error } = await supabase.rpc('get_verified_users');

    console.log('RPC data:', data);
    console.log('RPC error:', error);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Always return JSON
    return res.status(200).json({
      verifiedUsers: Array.isArray(data) ? data : [],
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({
      error: err.message || 'Internal server error',
    });
  }
}
