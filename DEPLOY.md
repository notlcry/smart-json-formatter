# Deploy to Vercel

This project is ready to be deployed to Vercel.

## Option 1: Deploy via Vercel CLI (Recommended)

1.  **Install Vercel CLI** (if you haven't already):
    ```bash
    npm i -g vercel
    ```

2.  **Login to Vercel**:
    ```bash
    vercel login
    ```

3.  **Deploy**:
    Run the following command in the project root:
    ```bash
    vercel
    ```
    - Follow the prompts (accept defaults).
    - It will detect `vite` and `dist` automatically.

4.  **Production Deploy**:
    Once you are happy with the preview:
    ```bash
    vercel --prod
    ```

## Option 2: Deploy via Vercel Dashboard (Git Integration)

1.  Push this code to a GitHub/GitLab/Bitbucket repository.
2.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
3.  Click **"Add New..."** -> **"Project"**.
4.  Import your repository.
5.  Vercel will automatically detect the **Vite** framework.
6.  Click **Deploy**.

## Environment Variables

If you plan to use the **AI Fix** feature in production, you need to set the `VITE_GEMINI_API_KEY` environment variable in Vercel.

1.  Go to your Project Settings on Vercel.
2.  Go to **Environment Variables**.
3.  Add `VITE_GEMINI_API_KEY` with your Google Gemini API Key.
