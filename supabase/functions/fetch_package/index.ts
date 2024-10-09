import { getSupabaseClient } from './supabase_client.ts';
import { main as updateAllowlist } from './isReviewed.ts';

async function fetchPackagistData(packageName: string) {
  const response = await fetch(`https://packagist.org/packages/${packageName}.json`);
  if (!response.ok) {
    throw new Error(`Error fetching data from Packagist: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

async function storeInSupabase(supabaseClient: any, packageData: any) {
  if (!packageData || !packageData.package) {
    console.error('Invalid package data structure:', packageData);
    throw new Error('Invalid package data structure.');
  }

  const { name, description, time, maintainers, type, repository, github_stars, github_watchers, github_forks, github_open_issues, language, dependents, suggesters, downloads, favers, versions } = packageData.package;

  if (!versions) {
    console.error('No versions found for package:', name);
    return;
  }

  // Filter out versions without the required dependency
  const validVersions = Object.entries(versions).filter(([_, version]) => version.require && version.require['mautic/core-lib']);

  if (validVersions.length === 0) {
    console.error('No valid versions found with mautic/core-lib dependency for package:', name);
    return;
  }

  // Insert into packages table first
  const { data: packageDataResponse, error: packageError } = await supabaseClient
    .from('packages')
    .upsert([{
      name,
      description,
      time,
      maintainers,
      type,
      repository,
      github_stars,
      github_watchers,
      github_forks,
      github_open_issues,
      language,
      dependents,
      suggesters,
      downloads,
      favers,
    }], { onConflict: 'name' });

  if (packageError) {
    console.error('Error inserting package data:', packageError);
    return;
  }

  // Now insert into versions table
  for (const [versionKey, version] of validVersions) {
    const smv = version.require['mautic/core-lib'];

    let storedversions: string[] = [];
    const constraints = smv.split('|');
    for (const constraint of constraints) {
      if (constraint.startsWith('^')) {
        const [major, minor] = constraint.substring(1).split('.');
        const patchVersions = [];
        for (let patch = 0; patch <= 20; patch++) {
          patchVersions.push(`${major}.${minor}.${patch}`);
        }
        storedversions.push(...patchVersions);
      } else {
        storedversions.push(constraint);
      }
    }

    const { description, keywords, homepage, version: ver, version_normalized, license, authors, source, dist, type, support, funding, time, extra } = version as any;

    const { data: versionDataResponse, error: versionError } = await supabaseClient
      .from('versions')
      .upsert([{
        package_name: name,
        description,
        keywords,
        homepage,
        version: ver,
        version_normalized,
        license,
        authors,
        source,
        dist,
        type,
        support,
        funding,
        time,
        extra,
        require: version.require,
        smv,
        storedversions
      }], { onConflict: ['package_name', 'version'] });

    if (versionError) {
      console.error('Error inserting version data:', versionError);
    } else {
      console.log('Version data inserted successfully:', versionDataResponse);
    }
  }
}

async function fetchPackages(url: string, supabaseClient: any) {
  try {
    const packageList = await fetch(url);
    if (!packageList.ok) {
      throw new Error(`Error fetching package list: ${packageList.statusText}`);
    }
    const packageNames = await packageList.json();
    for (const packageName of packageNames.packageNames) {
      const packageData = await fetchPackagistData(packageName);
      await storeInSupabase(supabaseClient, packageData);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function main(req: Request) {
  const authHeader = req.headers.get('Authorization');

  console.log('Authorization Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');

  const supabaseClient = getSupabaseClient(token);
  const urls = [
    "https://packagist.org/packages/list.json?type=mautic-plugin",
    "https://packagist.org/packages/list.json?type=mautic-theme",
  ];
  for (const url of urls) {
    await fetchPackages(url, supabaseClient);
  }

  await updateAllowlist();

  return new Response('Success', { status: 200 });
}

Deno.serve(main);

export { fetchPackagistData, storeInSupabase };

