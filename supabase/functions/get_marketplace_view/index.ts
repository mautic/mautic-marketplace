import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;

// The RPC endpoint is the actual working API!!
const BASE_POSTGREST_URL = `${SUPABASE_URL}/rest/v1/rpc/get_view`;

async function main(req: Request) {
    // Check if the required envs are set
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error("SUPABASE_URL or SUPABASE_ANON_KEY environment variables are missing.");
        return new Response(
            JSON.stringify({ error: 'Server configuration error: Missing environment variables' }), 
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
    
    try {
        const url = new URL(req.url);
        
        // --- 1. Construct the PostgREST URL with all the query parameters ---
        const queryString = url.search;
        const targetUrl = `${BASE_POSTGREST_URL}${queryString}`;

        // --- 2. Make the request to PostgREST using the Anon Key ---
        const postgrestResponse = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                // IMPORTANT: Authenticate the proxied request..
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        // --- 3. Return the EXACT response from PostgREST ---
        return new Response(postgrestResponse.body, {
            status: postgrestResponse.status,
            headers: postgrestResponse.headers,
        });

    } catch (error) {
        console.error('Edge Function Proxy Error:', error);
        return new Response(
            JSON.stringify({ error: 'Proxy failed to execute the request to the database layer.' }), 
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

serve(main);

