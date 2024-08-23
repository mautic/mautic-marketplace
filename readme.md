
# Project Title

Mautic Marketplace: Enhancing the marketplace!

## Project description

This project will expand enable the marketer to interact more smoothly with those plugins and themes available in the Marketplace and also rate and reviews plugins they use!

Hello, here is the step by step guide to set you up with the project!
The project is using [Packagist API](https://packagist.org/apidoc) and [Supabase](https://supabase.com) basically it downloads the packages data from Packagist to Supabase because the Packagist has some limitations!


## Installation

Follow the steps to setup it in your local!

1. Go to the [Supabase](https://supabase.com) website than click on "Start your project", and signup for a new account.

2. Click on new project after signup.

3. Name your project, generate and safely store your password. Select your region select free plan. Create a new project.

## Run Locally

Clone the project
    
```bash
git clone https://github.com/mautic/mautic-marketplace.git
```

Go to the project directory

```bash
cd mautic-marketplace
```

Install dependencies

for mac os
```bash
brew install deno
```
with shell
```bash
curl -fsSL https://deno.land/install.sh | sh
```
enable these [VS Code](https://code.visualstudio.com) extensions.

Denoland and JavaScript and TypeScript Nightly by microsoft
![deno extension](https://github.com/user-attachments/assets/3fed8c9b-813d-42db-b488-0f38b905af5c)
![image](https://github.com/user-attachments/assets/721c1afc-fda0-49e9-b249-90e199bcfcc3)

REPLACE YOUR URL AND ANON KEY IN INDEX.TS. Find them in your Supabase project at Settings > API)

4. Install the SUPABASE CLI 

for mac os you can run 

```bash
brew install supabase/tap/supabase
```
after installing it 

```bash
supabase login
```
```bash
supabase init
```
than go to the config.toml and change the db port and your project ID that you can find on project settings > DATABASE.

after that you can link your local project to the supabase
```bash
supabase link --project-ref refrence id
```
deploy your project in supabase cli 

for that you have to open your docker in background 
```bash
supabase functions deploy your_function_name
```
you will see your deployd function on your supabase account>edge function

## Setting Up the Database Schema

```bash
supabase db push
```

This will creat the tables and run other functions.

run the project

```bash
deno run --allow-env --allow-read --allow-net supabase/functions/fetch_package/index.ts
```
for testing run 
```bash
deno test --allow-env --allow-read supabase/functions/tests/index_test.ts
```
