// types.ts

export interface PackageData {
    name: string;
    description: string;
    time: string;
    maintainers: Maintainer[];
    versions: Record<string, VersionData>;
    type: string;
    repository: string;
    github_stars: number;
    github_watchers: number;
    github_forks: number;
    github_open_issues: number;
    language: string;
    dependents: number;
    suggesters: number;
    downloads: Downloads;
    favers: number;
  }
  
  export interface Maintainer {
    name: string;
    avatar_url: string;
  }
  
  export interface VersionData {
    description: string;
    keywords: string[];
    homepage: string;
    version: string;
    version_normalized: string;
    license: string[];
    authors: Author[];
    source: Source;
    dist: Dist;
    support: Support;
    time: string;
    'default-branch': boolean;
    require: Record<string, string>;
  }
  
  export interface Author {
    name: string;
    email: string;
  }
  
  export interface Source {
    type: string;
    url: string;
    reference: string;
  }
  
  export interface Dist {
    type: string;
    url: string;
    reference: string;
    shasum: string;
  }
  
  export interface Support {
    source: string;
    issues: string;
  }
  
  export interface Downloads {
    total: number;
    monthly: number;
    daily: number;
  }
  