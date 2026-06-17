# Cloud sync setup (Vercel KV + password)

The app works fully offline using `localStorage`. To sync your data across
devices, connect a Vercel KV (Upstash Redis) store and set one password.

## 1. Deploy to Vercel

1. Push this project to GitHub.
2. In Vercel → **Add New… → Project** → import the repo.
3. Vercel auto-detects **Vite** (build `vite build`, output `dist`). The
   `api/` folder is deployed as a serverless function automatically. Deploy.

## 2. Add a KV store

1. In your Vercel project → **Storage** tab → **Create / Connect Database** →
   choose a **Redis (Upstash)** / **KV** store → connect it to the project.
2. This automatically adds the env vars the API needs — either
   `KV_REST_API_URL` + `KV_REST_API_TOKEN` **or**
   `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`. The function accepts
   both naming schemes, so nothing else to configure here.

## 3. Set your sync password

1. Project → **Settings → Environment Variables**.
2. Add `SYNC_PASSWORD` = a password you choose (applies to all environments).
3. **Redeploy** so the new env vars take effect.

## 4. Connect a device

1. Open the deployed app. Top-right shows **“Local only”**.
2. Click it → enter your `SYNC_PASSWORD` → **Connect**.
3. The dot turns green (**Synced**). Your data now saves to the cloud and loads
   on any device that connects with the same password.

The header dot tells you the state: gray = local only, amber = syncing,
green = synced, red = sync error.

## How it resolves conflicts

Single user, last-write-wins by timestamp. On load, the device pulls the cloud
copy and adopts it if it's newer than the local copy; otherwise it pushes the
local copy up. Edits then push automatically (debounced).

## Notes

- **Local dev:** `npm run dev` (Vite) doesn't run the `/api` function, so sync
  stays "Local only" locally. To test sync locally, run `vercel dev` instead.
- **Images:** chart screenshots are stored inline (base64) in the synced blob.
  A few are fine; if you stockpile many large screenshots you could hit KV
  size limits — at that point we'd move images to Vercel Blob storage.
- **Security:** the password is the only gate, so use a strong one. Anyone with
  the URL **and** the password can read/write your data.
