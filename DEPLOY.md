# Guardian Frontend — Deploying to Vercel

Same process as the backend: create a GitHub repo, upload the code, connect
Vercel to it in the dashboard.

## 1. Create the GitHub repo

- github.com > New repository
- Name it `guardian-frontend`, set Private, don't initialize with a README
- Create repository

## 2. Get the code into the repo

- Download `guardian-frontend.zip` and unzip it (same as before — double-click
  on Mac, "Extract All" on Windows)
- On your new repo's page, click "**uploading an existing file**"
- Open the unzipped `guardian-frontend` folder, select everything inside it
  (including the `src` folder), drag it into the dashed upload box
- Wait for the file list to finish, then click "Commit changes"

## 3. Connect Vercel to the repo

- vercel.com > Add New > Project
- Select `guardian-frontend` from your GitHub repos
- Vercel auto-detects it's a Vite app — leave the build settings as default

## 4. Set environment variables

Before clicking Deploy, expand "Environment Variables" on that same Vercel
screen and add these three (values from `.env.example`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_API_BASE=https://guardian-backend-production-d28e.up.railway.app
```

The first two are the same Supabase project you already used for the
backend — grab them from Settings > API Keys again, but this time the
**Publishable key**, not the secret one. The third is the Railway URL
you already confirmed works.

Click **Deploy**.

## 5. One more step back in Supabase (needed for Google sign-in)

- Supabase dashboard > Authentication > Providers > Google > enable it,
  following Supabase's prompts to set up a Google OAuth app (this creates
  a Client ID and Secret you paste in there)
- Supabase dashboard > Authentication > URL Configuration > add your new
  Vercel URL (e.g. `https://guardian-frontend.vercel.app`) to **Redirect URLs**

Without that last step, Google sign-in will redirect but Supabase will
reject it as an untrusted URL.

## 6. Test it

Open your Vercel URL, click "Continue with Google," sign in, and you should
land on the journal screen — empty at first, with a form to record your
first entry.
