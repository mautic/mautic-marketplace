import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PackageData, VersionData } from './types.ts';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANONKEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchPackagistData(packageName: string) {
    const response = await fetch(`https://packagist.org/packages/${packageName}.json`);
    if (!response.ok) {
        throw new Error(`Error fetching data from Packagist: ${response.statusText}`);
    }
    const data = await response.json();
    return data.package;
}

async function storeInSupabase(packageData: PackageData) {
    for (const [versionName, versionData] of Object.entries<VersionData>(packageData.versions)) {
        const { error } = await supabase.from('packages').upsert([
            {
                package_name: packageData.name,
                package_description: packageData.description,
                package_time: packageData.time,
                maintainer_name: packageData.maintainers[0]?.name || '',
                maintainer_avatar_url: packageData.maintainers[0]?.avatar_url || '',
                version_name: versionName,
                version_description: versionData.description,
                version_keywords: versionData.keywords || [],
                version_homepage: versionData.homepage,
                version_version: versionData.version,
                version_version_normalized: versionData.version_normalized,
                version_license: versionData.license || [],
                author_name: versionData.authors[0]?.name || '',
                author_email: versionData.authors[0]?.email || '',
                source_type: versionData.source?.type || '',
                source_url: versionData.source?.url || '',
                source_reference: versionData.source?.reference || '',
                dist_type: versionData.dist?.type || '',
                dist_url: versionData.dist?.url || '',
                dist_reference: versionData.dist?.reference || '',
                dist_shasum: versionData.dist?.shasum || '',
                support_source: versionData.support?.source || '',
                support_issues: versionData.support?.issues || '',
                version_time: versionData.time,
                default_branch: versionData['default-branch'] || false,
                version_requirements: versionData.require || {},
                type: packageData.type || '',
                repository: packageData.repository || '',
                github_stars: packageData.github_stars,
                github_watchers: packageData.github_watchers,
                github_forks: packageData.github_forks,
                github_open_issues: packageData.github_open_issues,
                language: packageData.language,
                dependents: packageData.dependents,
                suggesters: packageData.suggesters,
                total_downloads: packageData.downloads.total,
                monthly_downloads: packageData.downloads.monthly,
                daily_downloads: packageData.downloads.daily,
                favers: packageData.favers
            }
        ]);

        if (error) {
            console.error('Error inserting data into Supabase:', error.message);
        } else {
            console.log(`Successfully inserted version ${versionName} of ${packageData.name}`);
        }
    }
}


export { fetchPackagistData, storeInSupabase };

