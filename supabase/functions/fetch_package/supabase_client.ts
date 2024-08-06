import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import "jsr:@std/dotenv/load";

// Supabase credentials
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_KEY = Deno.env.get("SUPABASE_KEY") as string;

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export function getSupabaseClient() {
  return supabase;
}
