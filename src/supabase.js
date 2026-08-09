const SUPABASE_URL =
  'https://lhwbnfjtywdsafiumity.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_AwgRJVy5fJmT160MBB-skw_zCXDrSOQ';

export const supabase =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        experimental: {
          passkey: true,
        },
      },
    }
  );
