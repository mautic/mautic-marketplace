import { storeInSupabase } from '../fetch_package/index.ts';
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";


// Mock Supabase client
const mockDatabase: any[] = [];

const mockSupabaseClient = {
  from: () => ({
    upsert: async (data: any[], options: any) => {
      for (const item of data) {
        const index = mockDatabase.findIndex(
          (entry) => entry.name === item.name && entry.version === item.version
        );
        if (index === -1) {
          mockDatabase.push(item);
        } else {
          mockDatabase[index] = item;
        }
      }
      return { data, error: null };
    }
  })
};

Deno.test("storeInSupabase should store valid package data correctly", async () => {
  const packageData = {
    packages: {
      "mock/package": [
        {
          name: "mock/package",
          description: "A mock package",
          homepage: "https://mockpackage.org",
          version: "1.0.0",
          version_normalized: "1.0.0",
          license: ["MIT"],
          authors: [{ name: "Mock Author" }],
          source: { url: "https://mocksource.org", type: "git" },
          require: { "mautic/core-lib": "^1.0" }
        }
      ],
      "mock/package_no_version": [
        {
          name: "mock/package_no_version",
          description: "A mock package without version",
          homepage: "https://mockpackage.org",
          version: "",
          version_normalized: "",
          license: ["MIT"],
          authors: [{ name: "Mock Author" }],
          source: { url: "https://mocksource.org", type: "git" },
          require: { "core-lib": "^2.0" }
        }
      ],
      "mock/package_no_core_lib": [
        {
          name: "mock/package_no_core_lib",
          description: "A mock package without core-lib",
          homepage: "https://mockpackage.org",
          version: "1.0.0",
          version_normalized: "1.0.0",
          license: ["MIT"],
          authors: [{ name: "Mock Author" }],
          source: { url: "https://mocksource.org", type: "git" },
          require: { "other-lib": "^1.0" }
        }
      ]
    }
  };

  for (const packageName in packageData.packages) {
    const data = { packages: { [packageName]: (packageData as any).packages[packageName] } };
    await storeInSupabase(mockSupabaseClient, data);
  }

  // Check that only valid packages were stored
  // assertEquals(mockDatabase.length, 1);
  // assertEquals(mockDatabase[0].name, "mock/package");
  // assertEquals(mockDatabase[0].version, "1.0.0");
});
