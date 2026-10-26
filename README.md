# SOLDX – Classifieds Marketplace

India's modern classifieds marketplace to buy and sell used cars, smartphones, electronics, bikes, furniture, and real estate.

## Local Development

```bash
npm install
npm run dev
```

App runs on `http://localhost:3000`.

## Deploy to Cloudflare Pages via GitHub

1. Push all files in this folder to a new GitHub repository (e.g. `soldx-marketplace`).
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **Workers & Pages** -> **Create** -> **Pages** -> **Connect to Git**.
3. Select your `soldx-marketplace` repository and set:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Click **Save and Deploy**.

### Optional: Connecting External Backend API
If hosting `server.ts` separately (e.g., on Render or Railway), add an environment variable in Cloudflare Pages:
- `VITE_API_URL` = `https://your-backend-url.onrender.com`
