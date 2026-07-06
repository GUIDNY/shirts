import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Browser-safe client. Only ever uses the public anon key. */
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);
