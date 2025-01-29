
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
enable these [VS Code](https://code.visualstudio.com) extensions if the above command doesn't work.

Denoland
[deno extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)
JavaScript and TypeScript Nightly by microsoft
[typescript extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next)

Copy the `.env.dist` file and name it just `.env`. Fill in the `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` values. This is required just for local development. In production this will be done in the cron job.

4. Install the SUPABASE [CLI] (https://www.bing.com/ck/a?!&&p=969504c469e64707f60850f54acb230cf4b5959a00b4d760742eff0f1cf8352bJmltdHM9MTczODEwODgwMA&ptn=3&ver=2&hsh=4&fclid=17c9cfc5-ca7b-6d48-2c8a-db1ccb7c6caa&psq=supabase+cli+install&u=a1aHR0cHM6Ly9zdXBhYmFzZS5jb20vZG9jcy9ndWlkZXMvbG9jYWwtZGV2ZWxvcG1lbnQvY2xpL2dldHRpbmctc3RhcnRlZA&ntb=1) 

for mac os you can run 

```bash
brew install supabase/tap/supabase
```
after installing it 

```bash
supabase login
```
If this fails, make sure you have just 1 organization.
```bash
supabase init
```
As the command suggests, go to `.vscode/settings.json` and enable deno: `"deno.enable": true`.

than go to the `supabase/config.toml` and change the API `port` from Supabase UI > Project Settings > DATABASE and your `project_id` from Supabase UI > Project Settings that you can find on project .

after that you can link your local project to the supabase
```bash
supabase link --project-ref refrence_id
```
Replace the `refrence_id` with the actual reference ID. deploy your project in supabase cli. You can skip the DB password step

Run `supabase projects list` to confirm you can see your project linked.

Now deploy the supabase function for that you have to open your docker in background 
```bash
supabase functions deploy fetch_package
```
you will see your deployd function on your supabase account>edge function

## Setting Up the Database Schema

```bash
supabase db push
```

Go to Database > Extensions. Search for "pg_cron" and "pg_net" and enable the extensions

Open the SQL editor in your remote supabase project, paste below code and run.
note : (If you doesn't want to enable the cron than you can skip this part of pasting the SQL code. you can directly run it by the deno commands)

```sql
-- SELECT cron.unschedule('invoke-function-every-minute');
select
  cron.schedule(
    'invoke-function-every-minute',
    '* * * * *', -- every minute (Change to 0 0 * * * for production)
    $$
    select
      net.http_post(
          url:='https://pmlsoukklacrbkqoyqmh.supabase.co/functions/v1/fetch_package',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb,
          body:=concat('{"time": "', now(), '"}')::jsonb
      ) as request_id;
    $$
  );
```
1. Replace the `url` with your edge function URL. Find it in the Supabase UI > Edge Functions.
2. Replace the `SERVICE_ROLE_KEY` with the key from Project Settings > API

Go to Edge Functions > Select your function > Logs to confirm the cron is running.

This will creat the tables and run other functions.

run the project

```bash
deno run --allow-env --allow-read --allow-net supabase/functions/fetch_package/index.ts
```
for testing run 
```bash
deno test --allow-env --allow-read supabase/functions/tests/index_test.ts
```

## API

Get the Anon key from Project Settings > API.

You can find the Database Functions under Database > Database Functions

### Get packages

`GET https://PROJECT_ID.supabase.co/rest/v1/rpc/get_view?apikey=ANON_KEY&_limit=30&_offset=0&_orderby=name&_orderdir=asc&_type=&_query=`

`GET https://PROJECT_ID.supabase.co/rest/v1/rpc/get_pack?apikey=ANON_KEY&packag_name=acquia/mc-cs-plugin-custom-objects`
