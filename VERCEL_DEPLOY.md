# Vercel Deployment Guide

This guide will help you deploy the TunisiaDriveX client to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your Supabase credentials

## Quick Start

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - **Important**: Set the **Root Directory** to `client` in project settings
   - Or use the `vercel.json` configuration (already set up)

3. **Configure Build Settings**
   Vercel should auto-detect, but verify:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (runs from client folder)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Configure Environment Variables**
   In Vercel dashboard, go to **Settings → Environment Variables** and add:
   ```
   VITE_SUPABASE_URL=https://ljyphggzxbqwdiulmrfh.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeXBoZ2d6eGJxd2RpdWxtcmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDM5NzQsImV4cCI6MjA3OTgxOTk3NH0.MapXx0hrsijoItkN4C22cCYhR4bmGuWKE900HsBFP3o
   ```
   **Important**: Add these for **Production**, **Preview**, and **Development** environments.

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your app

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Navigate to client folder**
   ```bash
   cd client
   ```

3. **Login to Vercel**
   ```bash
   vercel login
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   When prompted:
   - Set up and deploy? **Yes**
   - Which scope? Select your account
   - Link to existing project? **No** (first time) or **Yes** (subsequent)
   - Project name? `tunisiadrivex` (or your choice)
   - Directory? `./` (current directory)
   - Override settings? **No**

5. **Set Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL production
   # Paste: https://ljyphggzxbqwdiulmrfh.supabase.co
   
   vercel env add VITE_SUPABASE_ANON_KEY production
   # Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeXBoZ2d6eGJxd2RpdWxtcmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDM5NzQsImV4cCI6MjA3OTgxOTk3NH0.MapXx0hrsijoItkN4C22cCYhR4bmGuWKE900HsBFP3o
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Build Configuration

The project is configured with:
- **Framework**: Vite
- **Root Directory**: `client` (if deploying from root) or `.` (if deploying client folder directly)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 20.x (auto-detected by Vercel)

### Deploying from Root vs Client Folder

**Option A: Deploy from Root (Recommended)**
- Use the `vercel.json` in the root directory
- It's configured to build from the `client` folder
- All project files stay together

**Option B: Deploy Client Folder Only**
- Set Root Directory to `client` in Vercel dashboard
- Or deploy directly from the `client` folder using CLI
- Simpler but requires maintaining separate configs

## Environment Variables

Make sure to set these in Vercel dashboard:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Post-Deployment

1. **Test the deployment**
   - Visit your Vercel URL
   - Test the booking flow
   - Test the admin panel at `/admin`

2. **Set up Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add your custom domain

3. **Configure Supabase RLS**
   - Make sure your Supabase tables are created (run `supabase_schema.sql`)
   - Verify RLS policies are set correctly

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node version (should be 18+)
- Check build logs in Vercel dashboard

### Environment Variables Not Working
- Ensure variables start with `VITE_` prefix
- Redeploy after adding new variables
- Check variable names match exactly

### Routes Not Working
- The `vercel.json` includes a rewrite rule for SPA routing
- All routes should redirect to `index.html`

## Notes

- The admin panel (`/admin`) requires Supabase authentication
- Make sure to create admin users in Supabase Auth dashboard
- Static assets are cached for 1 year for performance

