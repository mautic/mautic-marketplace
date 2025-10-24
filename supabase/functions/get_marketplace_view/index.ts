import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import "jsr:@std/dotenv/load";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main(req: Request) {
    try {
        const url = new URL(req.url);
        
        // Extract query parameters for the get_view RPC
        const _query = url.searchParams.get('query');
        const _type = url.searchParams.get('type');
        const _orderby = url.searchParams.get('orderby') || 'name';
        const _orderdir = url.searchParams.get('orderdir') || 'ASC';
        const _limit = parseInt(url.searchParams.get('limit') || '20', 10);
        const _offset = parseInt(url.searchParams.get('offset') || '0', 10);

        // Call the PostgreSQL RPC function
        const { data, error } = await supabase.rpc('get_view', {
            _query,
            _type,
            _orderby,
            _orderdir: _orderdir.toUpperCase(),
            _limit,
            _offset,
        });

        if (error) {
            console.error('Error executing get_view:', error);
            return new Response(JSON.stringify({ 
                error: 'Database query failed in get_view', 
                details: error.message 
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('General Error in get_marketplace_view:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

Deno.serve(main);
