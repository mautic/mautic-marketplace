
# Project Title

Mautic Marketplace: Enhancing the marketplace!


## Project description

This project will expand enable the marketer to interact more smoothly with those plugins and themes available in the Marketplace and also rate and reviews plugins they use!

Hello, here is the step by step guide to set you up with the project!
The project is using packagist and supabase basically it migate the packages data from packagist to supabase because the packagist has some limitations!


## Installation

so follow the steps to setup it in your local!

1. So first you have to go to the [supabase](https://supabase.com/) website than click on start your project, and signup for a new account.

2. click on new project after signup!

3. name your project and generate password rember to keep you password! select your region select free plan! create a new project!

wait while it setting up the project!

5. now go to the sql editor of supabase and paste this query and run!

  ```bash

  CREATE TABLE packages (
    id SERIAL PRIMARY KEY,
    name TEXT,
    description TEXT,
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
    require JSONB,
    smv TEXT,
    storedVersions TEXT[],
    UNIQUE(name, version)
);

```

   there is a table created with required column! you can see it in your table editor!


## Run Locally

Clone the project
    
```bash
  git clone https://github.com/mautic/mautic-marketplace.git
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

for mac os
```bash
  brew install deno
```
enable this vs code extensions!

Denoland and JavaScript and TypeScript Nightly by microsoft
![deno extension](https://github.com/user-attachments/assets/3fed8c9b-813d-42db-b488-0f38b905af5c)
![image](https://github.com/user-attachments/assets/721c1afc-fda0-49e9-b249-90e199bcfcc3)


REPLACE YOUR URL AND ANON KEY IN INDEX.TS.(you will find on your supabase project settings/API)

run the project

```bash
  deno run --allow-net index.ts
```
for testing run 
```bash
  deno test index_test.ts
```
