import { getSupabaseClient } from './supabase_client.ts';

const token = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = getSupabaseClient(token);

async function fetchJson(url: string) {
  const response = await fetch(url);
  return await response.json();
}

async function updateDatabase(packageName: string) {
  const { data, error } = await supabase
    .from('packages') 
    .update({ isreviewed: true })
    .eq('name', packageName); 

  if (error) {
    console.error('Error updating the isReviewd column:', packageName, error);
  } else {
    console.log('isReviewed updated successfully for package:', packageName);
  }
}

export async function main() {
  const url1 = "https://raw.githubusercontent.com/mautic/marketplace-allowlist/main/allowlist.json"; 

  const data1 = await fetchJson(url1);

  const listPackages = data1.allowlist.map((item: { package: string }) => item.package); 
  for (const packageName of listPackages) {
      await updateDatabase(packageName); 
  }
}

main().catch(console.error);
