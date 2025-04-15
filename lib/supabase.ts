import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Debug log to see if environment variables are properly set
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables are missing:', {
    urlExists: !!supabaseUrl,
    keyExists: !!supabaseKey
  });
}

export const supabase = createClient(supabaseUrl, supabaseKey);