<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1H6hSJyhDnJ187cOHbpsSMA5fzM2i039y

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env` file (or copy `.env.example`):
   `cp .env.example .env`
3. Set your API key in `.env`:
   `VITE_GEMINI_API_KEY=your_google_gemini_api_key`
4. Run the app:
   `npm run dev`

## Deploy to Vercel

1. Deploy the app using Vercel CLI or Dashboard.
2. Add the Environment Variable in Vercel Project Settings:
   - **Name**: `VITE_GEMINI_API_KEY`
   - **Value**: Your Gemini API Key
