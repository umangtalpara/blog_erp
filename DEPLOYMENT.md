# Deployment Guide for Blog ERP on Vercel

This guide explains how to deploy the Blog ERP application to Vercel. Because this is a monorepo with a Node.js/Express backend and a React/Vite frontend, the recommended approach is to deploy them as **two separate projects** on Vercel.

## Prerequisites

1.  A [GitHub](https://github.com) account.
2.  A [Vercel](https://vercel.com) account.
3.  Your project pushed to a GitHub repository.

---

## Step 1: Deploy the Backend (Server)

1.  Log in to your Vercel dashboard.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `blog-erp` repository.
4.  **Configure the Project**:
    *   **Project Name**: e.g., `blog-erp-server`
    *   **Root Directory**: Click "Edit" and select `server`.
    *   **Framework Preset**: It should detect "Other" or "Express". If not, select "Other".
    *   **Environment Variables**: Add the following (copy from your local `.env`):
        *   `AWS_ACCESS_KEY_ID`
        *   `AWS_SECRET_ACCESS_KEY`
        *   `AWS_REGION`
        *   `JWT_SECRET`
        *   `S3_BUCKET_NAME` (if used)
5.  Click **"Deploy"**.
6.  Once deployed, copy the **Deployment URL** (e.g., `https://blog-erp-server.vercel.app`). You will need this for the frontend.

---

## Step 2: Deploy the Frontend (Client)

1.  Go back to your Vercel dashboard.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import the **same** `blog-erp` repository again.
4.  **Configure the Project**:
    *   **Project Name**: e.g., `blog-erp-client`
    *   **Root Directory**: Click "Edit" and select `client`.
    *   **Framework Preset**: It should automatically detect **Vite**.
    *   **Environment Variables**:
        *   `VITE_API_URL`: Paste the Backend URL from Step 1 (e.g., `https://blog-erp-server.vercel.app`). **Important**: Do not add a trailing slash.
        *   `VITE_APP_URL`: Enter the expected domain of this frontend (e.g., `https://blog-erp-client.vercel.app`). You can update this later if the URL changes.
5.  Click **"Deploy"**.

---

## Step 3: Final Configuration

1.  After the frontend is deployed, verify that `VITE_APP_URL` matches the actual deployed URL.
2.  If it's different, go to the Frontend Project Settings -> Environment Variables, update `VITE_APP_URL`, and **Redeploy** (go to Deployments -> Redeploy) for the changes to take effect.

## Troubleshooting

*   **CORS Errors**: The backend is configured to allow all origins (`cors()`). If you face issues, check the Network tab in your browser developer tools.
*   **404 on Refresh**: Vercel's Vite preset usually handles this, but if you get 404s on refresh, ensure you have a `vercel.json` in the `client` folder with rewrites to `index.html` (Vite usually handles this automatically).
