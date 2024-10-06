import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import "jsr:@std/dotenv/load";

// Supabase credentials
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;

export function getSupabaseClient(token: string) {
  // const SUPABASE_KEY = Deno.env.get("SUPABASE_KEY") as string;
  return createClient(SUPABASE_URL, token, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
