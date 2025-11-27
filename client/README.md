# TunisiaDriveX Client

This is the client application for TunisiaDriveX - a premium car rental and excursion booking platform.

## Quick Deploy to Vercel

### Method 1: Deploy from Client Folder (Simplest)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set environment variables in Vercel**
   - Go to your Vercel project settings
   - Add these environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

3. **Deploy**
   ```bash
   vercel
   ```

### Method 2: Deploy from Root

If deploying from the project root, use the `vercel.json` in the root directory.

## Local Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

The build output will be in the `dist` folder.

## Environment Variables

Create a `.env` file in this directory:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
client/
├── src/
│   ├── components/    # React components
│   ├── pages/         # Page components
│   ├── lib/           # Utilities and Supabase client
│   ├── locales/       # Translation files
│   └── data/          # Static data (cars, excursions)
├── assets/            # Images and media files
└── index.html         # Entry HTML file
```

