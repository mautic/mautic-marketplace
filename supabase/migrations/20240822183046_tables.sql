--This creat the two tables packages and versions

--packages table

CREATE TABLE packages (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    time TIMESTAMPTZ,
    maintainers JSONB,
    type TEXT,
    repository TEXT,
    github_stars INTEGER,
    github_watchers INTEGER,
    github_forks INTEGER,
    github_open_issues INTEGER,
    language TEXT,
    dependents INTEGER,
    suggesters INTEGER,
    downloads JSONB,
    favers INTEGER,
    url TEXT,
    displayname TEXT,
    isReviewed boolean,
    letest_mautic_support boolean,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- versions table

CREATE TABLE versions (
    id SERIAL PRIMARY KEY,
    package_name TEXT NOT NULL REFERENCES packages(name) ON DELETE CASCADE,
    description TEXT,
    keywords JSONB,
    homepage TEXT,
    version TEXT,
    version_normalized TEXT,
    license JSONB,
    authors JSONB,
    source JSONB,
    dist JSONB,
    type TEXT,
    support JSONB,
    funding JSONB,
    time TIMESTAMPTZ,
    extra JSONB,
    require JSONB,
    require_dev JSONB,
    smv TEXT,
    storedversions TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (package_name, version)
);
