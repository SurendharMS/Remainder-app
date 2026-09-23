# Supabase & GitHub OAuth Setup Guide

## 1. Execute SQL Migration
1. Log into your [Supabase Dashboard](https://app.supabase.com).
2. Select your project and navigate to the **SQL Editor**.
3. Copy the entire contents of [`schema.sql`](file:///d:/All%20Projects/Remainder%20app/supabase/schema.sql) and paste it into the editor.
4. Click **Run**. This will:
   - Create the `task_recurrence` and `task_status` ENUM types.
   - Create `public.tasks` and `public.important_dates` tables with proper indexes.
   - Enable Row Level Security (RLS) on both tables.
   - Create RLS policies ensuring only GitHub username `Surendhar2252` can read, insert, update, or delete data.

---

## 2. Configure GitHub OAuth Provider in Supabase
1. Go to **GitHub Settings** -> **Developer Settings** -> [OAuth Apps](https://github.com/settings/developers).
2. Click **New OAuth App**:
   - **Application Name**: `Reminder App`
   - **Homepage URL**: `http://localhost:5173` (or your production frontend URL)
   - **Authorization callback URL**: In Supabase, go to **Authentication** -> **Providers** -> **GitHub**. Copy the **Callback URL (for OAuth)** (e.g., `https://<project-id>.supabase.co/auth/v1/callback`) and paste it here.
3. Generate a new client secret on GitHub and copy the **Client ID** and **Client Secret**.
4. In Supabase Dashboard -> **Authentication** -> **Providers** -> **GitHub**:
   - Enable the toggle **GitHub enabled**.
   - Paste **Client ID** and **Client Secret**.
   - Click **Save**.

---

## 3. Disable Public Email Signups
1. In Supabase Dashboard, navigate to **Authentication** -> **Providers** -> **Email**.
2. Toggle off **Enable Email provider**.
3. Under **Authentication** -> **Sign In / Up**, turn off **Enable Email signups**.
4. This ensures GitHub OAuth is the **only** authentication pathway.

---

## 4. Environment Variables Setup
Populate `backend/.env` and `frontend/.env` using the respective `.env.example` templates:
- `SUPABASE_URL`: Found under Project Settings -> API -> Project URL.
- `SUPABASE_ANON_KEY`: Found under Project Settings -> API -> Project API Keys (`anon` public).
- `SUPABASE_SERVICE_ROLE_KEY`: Found under Project Settings -> API -> Project API Keys (`service_role` secret).
- `SUPABASE_JWT_SECRET`: Found under Project Settings -> API -> JWT Settings (JWT Secret).
