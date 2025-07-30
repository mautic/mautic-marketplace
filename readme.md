# Mautic Marketplace

The Mautic Marketplace is a robust system engineered to enhance the Mautic ecosystem, offering a scalable platform for discovering, rating and reviewing Mautic plugins and themes.

At its core, this backend leverages the [Packagist API](https://packagist.org/apidoc) for comprehensive package data acquisition, persisting it within a [Supabase](https://supabase.com) (PostgreSQL) database. This architecture is designed to overcome direct Packagist API rate limits and structural constraints, enabling real-time data synchronization, sophisticated filtering capabilities and the foundational elements for future community-driven features like ratings and reviews.

---

## 🛠️ Setup

### Prerequisites

Ensure the following tools are installed on your system:

* **Git**
* **Deno:**
    For macOS (Homebrew):
    ```bash
    brew install deno
    ```
    For other platforms (Shell Script):
    ```bash
    curl -fsSL [https://deno.land/install.sh](https://deno.land/install.sh) | sh
    ```
* **Supabase CLI:**
    For macOS (Homebrew):
    ```bash
    brew install supabase/tap/supabase
    ```
    (For other platforms, refer to the [Supabase CLI Installation Guide](https://supabase.com/docs/guides/local-development/cli/getting-started#install-the-cli).)
* **Docker Desktop:** Ensure Docker Desktop is running as it's required for Supabase Edge Function deployment and local services.

### Supabase Cloud Configuration

1.  Create a new project on [Supabase.com](https://supabase.com/). Securely note your **database password**.
2.  Retrieve your **Project ID (Reference ID)** from `Project Settings` > `General Settings`.
3.  Copy your **API Keys** (`anon public`, `service_role`) from `Project Settings` > `API`.

### Local Environment Setup

1.  Clone the repository and navigate into it:
    ```bash
    git clone https://github.com/mautic/mautic-marketplace.git
    ```
2.  Go to the project directory
    ```bash
    cd mautic-marketplace
    ```
3.  Configure local environment variables. These are crucial for local Deno execution.
    ```bash
    cp .env.dist .env
    ```
    Edit the `.env` file to set `SUPABASE_URL` (e.g., `https://your-project-id.supabase.co`) and `SUPABASE_SERVICE_ROLE_KEY`.

### Supabase CLI & Database Migration

1.  Authenticate the Supabase CLI with your account:
    ```bash
    supabase login
    ```
2.  Initialize the local Supabase project structure:
    ```bash
    supabase init
    ```
3.  Update `supabase/config.toml` by setting the `project_id` field.
4.  Link your local project to your cloud project. **Before copying, replace `YOUR_ACTUAL_PROJECT_ID` with your Supabase Project ID.**
    ```bash
    supabase link --project-ref YOUR_ACTUAL_PROJECT_ID
    ```
    Provide your database password if prompted.
5.  Deploy the `fetch_package` Edge Function to your Supabase project. **Ensure Docker Desktop is active.**
    ```bash
    supabase functions deploy fetch_package
    ```
6.  Push local database schema migrations to your remote Supabase database:
    ```bash
    supabase db push
    ```

### Automated Data Synchronization (Cron Job)

Automate the execution of your `fetch_package` Edge Function using PostgreSQL's built-in `pg_cron` extension for continuous data updates.

1.  In your Supabase Dashboard, navigate to `Database` > `Extensions` and **Enable** both `pg_cron` and `pg_net`.
2.  Retrieve your `fetch_package` **Edge Function Invoke URL** and your project's **Service Role Key**.
3.  Schedule the cron job in Supabase Dashboard > `SQL Editor`. **Before copying, ensure you replace `YOUR_EDGE_FUNCTION_URL` and `YOUR_SERVICE_ROLE_KEY` within the SQL.**
    ```sql
    -- To temporarily stop or remove the schedule:
    -- SELECT cron.unschedule('invoke-function-every-minute');

    SELECT
      cron.schedule(
        'invoke-function-every-minute',
        '* * * * *', -- Schedule: Runs every minute (adjust for production needs)
        $$
        SELECT
          net.http_post(
              url:='YOUR_EDGE_FUNCTION_URL',
              headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
              body:=concat('{"time": "', now(), '"}')::jsonb
          ) AS request_id;
        $$
      );
    ```
4.  Confirm execution by checking for new log entries under Supabase Dashboard > `Edge Functions` > `fetch_package` > `Logs`.

---

## 🚀 Usage

### Running Locally

Execute the `fetch_package` function directly on your machine for debugging or one-off data processing. **Before copying, replace `YOUR_PROJECT_ID` and `YOUR_SERVICE_ROLE_KEY` with your actual values.**

```bash
SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY" \
deno run --allow-env --allow-read --allow-net supabase/functions/fetch_package/index.ts
```

## 🧪 Testing

Run unit tests for your Deno functions. The `--no-check` flag skips TypeScript type-checking for faster execution.

> 🔧 Replace `YOUR_PROJECT_ID` and `YOUR_SERVICE_ROLE_KEY` with your actual Supabase credentials.

```bash
SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY" \
deno test --allow-env --allow-read --allow-net --no-check supabase/functions/tests/index_test.ts
```

# API Endpoints

Get the Anon key from Project Settings > API.

You can find the Database Functions under Database > Database Functions

### Get packages

`GET https://PROJECT_ID.supabase.co/rest/v1/rpc/get_view?apikey=ANON_KEY&_limit=30&_offset=0&_orderby=name&_orderdir=asc&_type=&_query=`

`GET https://PROJECT_ID.supabase.co/rest/v1/rpc/get_pack?apikey=ANON_KEY&packag_name=acquia/mc-cs-plugin-custom-objects`
