import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

// Supabase credentials
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchPackagistData(packageName: string) {
  const response = await fetch(`https://repo.packagist.org/p2/${packageName}.json`);
  if (!response.ok) {
    throw new Error(`Error fetching data from Packagist: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

async function storeInSupabase(packageData: any) {
  if (!packageData || !packageData.packages) {
    console.error('Invalid package data structure:', packageData);
    throw new Error('Invalid package data structure.');
  }

  const packageName = Object.keys(packageData.packages)[0];
  const versions = packageData.packages[packageName];

  for (const version of versions) {
    version.name = packageName;
    //add on

    const { name, description, homepage, version: ver, version_normalized, license, authors, source, dist, type, support, funding, time, require } = version;


     // Extract the version from 'require'
     let smv = '';
     if (require && typeof require === 'object') {
       for (const key in require) {
         if (key === 'mautic/core-lib' && typeof require[key] === 'string') {
               smv = require[key];
           break; // Stop after finding 'lib'
         }
       }
     }
     let storedversions: string[] = []; // Array of arrays to store versions
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
        storedversions.push(constraint); // Single element array for non-caret constraints
      }
    }

    const { data, error } = await supabase
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
      }], { onConflict: 'name, version'});

    if (error) {
      console.error('Error inserting data:', error);
    } else {
      console.log('Data inserted successfully:', data);
    }
  }
}

// Main function to fetch data and store it in database
async function fetchPackages(url: string) {
  try {
    const packageList = await fetch(url);
    if (!packageList.ok){
      throw new Error(`Error fetching package list: ${packageList.statusText}`);
    }
    const packageNames = await packageList.json();
    for (const packageName of packageNames.packageNames){
    const packageData = await fetchPackagistData(packageName);
    await storeInSupabase(packageData);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
async function main(){
  const urls = [
    "https://packagist.org/packages/list.json?type=mautic-plugin",
      "https://packagist.org/packages/list.json?type=mautic-theme",
  ];
  for (const url of urls) {
    await fetchPackages(url);
  }
}

main();
export { fetchPackagistData, storeInSupabase }
