import { getSupabaseClient } from './supabase_client.ts';

async function fetchPackagistData(packageName: string) {
  const response = await fetch(`https://repo.packagist.org/p2/${packageName}.json`);
  if (!response.ok) {
    throw new Error(`Error fetching data from Packagist: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

async function storeInSupabase(supabaseClient: any, packageData: any) {
  if (!packageData || !packageData.packages) {
    console.error('Invalid package data structure:', packageData);
    throw new Error('Invalid package data structure.');
  }

  const packageName = Object.keys(packageData.packages)[0];
  const versions = packageData.packages[packageName];

  // Check if 'core-lib' exists in any of the versions
  let hasCoreLib = false;
  for (const version of versions) {
    if (version.require && version.require['mautic/core-lib']) {
      hasCoreLib = true;
      break;
    }
  }

  // Skip the entire package only if 'core-lib' is not found in any version
  if (!hasCoreLib) {
    console.error('Skipping package due to missing core-lib:', packageName);
    return;
  }

  for (const version of versions) {
    version.name = packageName;

    const { name, description, homepage, version: ver, version_normalized, license, authors, source, dist, type, support, funding, time, require } = version;

    // if (!ver || !require) {
    //   console.error('Skipping package due to missing version or require:', name);
    //   continue;
    // }

    let smv = '';
    if (require && typeof require === 'object') {
      for (const key in require) {
        if (key === 'mautic/core-lib') {
          // Handle cases where 'core-lib' is an object or string
          if (typeof require[key] === 'string') {
            smv = require[key];
          } else if (typeof require[key] === 'object' && require[key]['*']) {
            smv = require[key]['*'];
          }
          break;
        }
      }
    }

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

    const { data, error } = await supabaseClient
      .from('packages')
      .upsert([{ 
        name,
        description,
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
        require,
        smv,
        storedversions
      }], { onConflict: 'name, version' });

    if (error) {
      console.error('Error inserting data:', error);
    } else {
      console.log('Data inserted successfully:', data);
    }
  }
}

async function fetchPackages(url: string, supabaseClient: any) {
  try {
    const packageList = await fetch(url);
    if (!packageList.ok){
      throw new Error(`Error fetching package list: ${packageList.statusText}`);
    }
    const packageNames = await packageList.json();
    for (const packageName of packageNames.packageNames){
      const packageData = await fetchPackagistData(packageName);
      await storeInSupabase(supabaseClient, packageData);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function main() {
  const supabaseClient = getSupabaseClient();
  const urls = [
    "https://packagist.org/packages/list.json?type=mautic-plugin",
    "https://packagist.org/packages/list.json?type=mautic-theme",
  ];
  for (const url of urls) {
    await fetchPackages(url, supabaseClient);
  }
}

if (import.meta.main) {
  main();
}

export { fetchPackagistData, storeInSupabase };