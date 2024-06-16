import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchPackagistData, storeInSupabase } from './fetch_packagist.ts';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANONKEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("Server running on http://localhost:8000");

const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);

    if (url.pathname === "/api/packages" && req.method === "GET") {
        const { data, error } = await supabase.from('packages').select('*');
        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        } else {
            return new Response(JSON.stringify(data), { status: 200 });
        }
    } else if (url.pathname.startsWith("/api/packages/") && req.method === "GET") {
        const id = url.pathname.split("/")[3];
        const { data, error } = await supabase.from('packages').select('*').eq('id', id);
        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        } else if (data.length) {
            return new Response(JSON.stringify(data[0]), { status: 200 });
        } else {
            return new Response(JSON.stringify({ error: "Package not found" }), { status: 404 });
        }
    } else if (url.pathname === "/api/packages" && req.method === "POST") {
        const body = await req.json();
        const {
          package_name, package_description, package_time, maintainer_name, maintainer_avatar_url,
          version_name, version_description, version_keywords, version_homepage, version_version,
          version_version_normalized, version_license, author_name, author_email, source_type,
          source_url, source_reference, dist_type, dist_url, dist_reference, dist_shasum,
          support_source, support_issues, version_time, default_branch, version_requirements,
          type, repository, github_stars, github_watchers, github_forks, github_open_issues,
          language, dependents, suggesters, total_downloads, monthly_downloads, daily_downloads,
          favers
        } = body;

        const { data, error } = await supabase.from('packages').upsert([
            {
              package_name, package_description, package_time, maintainer_name, maintainer_avatar_url,
              version_name, version_description, version_keywords, version_homepage, version_version,
              version_version_normalized, version_license, author_name, author_email, source_type,
              source_url, source_reference, dist_type, dist_url, dist_reference, dist_shasum,
              support_source, support_issues, version_time, default_branch, version_requirements,
              type, repository, github_stars, github_watchers, github_forks, github_open_issues,
              language, dependents, suggesters, total_downloads, monthly_downloads, daily_downloads,
              favers
            }
        ]);

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        } else {
            return new Response(JSON.stringify({ message: "Package created", data }), { status: 201 });
        }
    } else if (url.pathname.startsWith("/api/packages/") && req.method === "PUT") {
        const id = url.pathname.split("/")[3];
        const body = await req.json();
        const {
          package_name, package_description, package_time, maintainer_name, maintainer_avatar_url,
          version_name, version_description, version_keywords, version_homepage, version_version,
          version_version_normalized, version_license, author_name, author_email, source_type,
          source_url, source_reference, dist_type, dist_url, dist_reference, dist_shasum,
          support_source, support_issues, version_time, default_branch, version_requirements,
          type, repository, github_stars, github_watchers, github_forks, github_open_issues,
          language, dependents, suggesters, total_downloads, monthly_downloads, daily_downloads,
          favers
        } = body;

        const { data, error } = await supabase.from('packages').update({
          package_name, package_description, package_time, maintainer_name, maintainer_avatar_url,
          version_name, version_description, version_keywords, version_homepage, version_version,
          version_version_normalized, version_license, author_name, author_email, source_type,
          source_url, source_reference, dist_type, dist_url, dist_reference, dist_shasum,
          support_source, support_issues, version_time, default_branch, version_requirements,
          type, repository, github_stars, github_watchers, github_forks, github_open_issues,
          language, dependents, suggesters, total_downloads, monthly_downloads, daily_downloads,
          favers
        }).eq('id', id);

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        } else {
            return new Response(JSON.stringify({ message: "Package updated", data }), { status: 200 });
        }
    } else if (url.pathname.startsWith("/api/packages/") && req.method === "DELETE") {
        const id = url.pathname.split("/")[3];
        const { error } = await supabase.from('packages').delete().eq('id', id);

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        } else {
            return new Response(null, { status: 204 });
        }
    } else if (url.pathname === "/api/fetch-from-packagist" && req.method === "POST") {
        // Endpoint to trigger fetching data from Packagist
        try {
            const { package_name } = await req.json();
            const packagistData = await fetchPackagistData(package_name);
            await storeInSupabase(packagistData);
            return new Response(JSON.stringify({ message: "Data fetched from Packagist and stored in Supabase" }), { status: 200 });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
    } else {
        return new Response(JSON.stringify({ error: "Not Found" }), { status: 404 });
    }
};

serve(handler, { port: 8000 });
