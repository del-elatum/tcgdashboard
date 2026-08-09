import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'PASTE_PROJECT_URL_HERE';
const supabaseKey = 'PASTE_PUBLISHABLE_KEY_HERE';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
