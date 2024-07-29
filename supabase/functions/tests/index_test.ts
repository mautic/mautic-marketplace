import { assert, assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";

// Define the structure for a package version
interface PackageVersion {
    name: string;
    version: string;
    require?: {
        [key: string]: string; // This allows any string key
    };
}

// Mock API response
const mockApi = {
    "packages": {
        "dennisameling/helloworld-bundle": [] as PackageVersion[],
  },
};

// Mock Supabase Client
class MockSupabaseClient {
    data: any[] = []; 
    from(tableName: string) {
        return {
            upsert: async (data: any[]) => {
              console.log("Upserting data:", data);
                // Simulate upsert logic
                this.data.push(...data);
                console.log("Mock upsert called with:", data);
                return { data: this.data, error: null };
            },
        };
    }
}

// Function to upsert packages using mock data
async function upsertPackages(upsertFunction: (data: { name: string; version: string }) => Promise<void>): Promise<void> {
    for (const [packageName, versions] of Object.entries(mockApi.packages)) {
        // Check if the package has at least one version
        
        assert(versions.length > 0, `Expected package ${packageName} to have versions.`);

        // Check if the package includes "core-lib"
        
        let hasCoreLib = false;
        for (const version of versions) {
            if (version.require && typeof version.require === 'object'&& "mautic/core-lib" in version.require) {
                hasCoreLib = true;
                {
                    await upsertFunction({ name: version.name, version: version.version }); // Call the injected upsert function
                } 
                break;
            }
        }

        assert(hasCoreLib, `Expected package ${packageName} to include "mautic/core-lib".`);
            continue; // Skip this package
        
        //Process each version of the package
        //         for (const version of versions) {
        //             // Ensure that name and version are defined
        //             if (version.name && version.version) {
        //                 // Check for "core-lib" *inside* the loop
        //                 if (version.require && "mautic/core-lib" in version.require) 
        //                 // else {
        //                 //     console.log(`Skipping version: "core-lib" is missing for package ${packageName}, version ${version.version}.`);
        //                 // }
        //                     }
                
        //     //         else {
        //     //             console.log(`Skipping version: missing name or version for package ${packageName}.`);
        //     // }
        // }
    }
}

// Test case
Deno.test("upsertPackages calls upsert function with correct format", async () => {
    const mockSupabase = new MockSupabaseClient(); 

    const upsertSpy = async (data: { name: string; version: string }) => {
        // Assertions to verify the data being upserted
        assertEquals(data.name, "acquia/mc-cs-plugin-custom-objects");
        assertEquals(data.version, "1.0.0");

        // Upsert data into the mock database
        const { data: upsertedData, error } = await mockSupabase
            .from("packages")
            .upsert([{ name: data.name, version: data.version }]);

        if (error) {
            console.error("Error upserting data:", error);
        } else {
            // Verify data in the mock database
            assertEquals(upsertedData[0].name, "acquia/mc-cs-plugin-custom-objects");
            assertEquals(upsertedData[0].version, "1.0.0");
        }
    };

    // Call the function with the mock upsert function
    await upsertPackages(upsertSpy);

});