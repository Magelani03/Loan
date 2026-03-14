# Deployment guide

## Deploy the customer frontend (AUNTY D) to Vercel

1. **Deploy the backend first** (e.g. Render, Railway, Fly.io) so you have a live API URL. The frontend needs this for login, applications, and data.

2. **Connect the repo to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in.
   - Click **Add New** → **Project** and import your Git repository.

3. **Set the Root Directory**
   - In the project settings, set **Root Directory** to **`frontend`** (the customer-facing app lives there).
   - Leave **Framework Preset** as Vite (auto-detected) or set it to Vite.

4. **Environment variables**
   - In the Vercel project: **Settings** → **Environment Variables**.
   - Add:
     - **`VITE_API_BASE`** = backend base URL only: `https://loan-backend-oyhr.onrender.com/api`  
       Use **two slashes** in `https://`. Do **not** add `/auth/login` or any path—the app adds paths itself.
   - Add if you use them:
     - **`VITE_OFFICE_ADDRESS`** = your office address for the “Get directions” link.

5. **Deploy**
   - Push to your main branch or click **Redeploy** in Vercel. The frontend will build and deploy.

6. **After deploy**
   - Your site will be at `https://your-project.vercel.app` (or your custom domain).
   - Ensure your backend allows requests from this origin (CORS). The backend in this repo already uses `origin: true` for development; for production you may want to set a specific origin in the backend env.

---

## Deploy the admin dashboard (optional)

The admin app is in **`admin-frontend`**. You can:

- Deploy it as a **second Vercel project**: create another project, set Root Directory to **`admin-frontend`**, and set **`VITE_API_BASE`** to the same backend API URL.
- Or run it locally and use it against your deployed backend.

---

## Backend (not on Vercel)

Vercel runs serverless functions, not a long-running Node server. Deploy the **backend** elsewhere:

- **Render**: connect the repo, set Root Directory to `backend`, use `npm install && npx prisma generate && npm run build && npm start` (or your start script). Add env vars: `DATABASE_URL`, `JWT_SECRET`, etc.
- **Railway / Fly.io**: similar — set root to `backend`, add env vars, run migrations and start the server.

Use the backend’s public URL as **`VITE_API_BASE`** in the Vercel frontend (and admin) projects.
