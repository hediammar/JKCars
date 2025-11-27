# Vercel Deployment Checklist

## Pre-Deployment

- [x] ✅ Client folder has its own `package.json`
- [x] ✅ Client folder has its own `vite.config.ts`
- [x] ✅ Client folder has its own `tsconfig.json`
- [x] ✅ Types moved from `shared/` to `client/src/types/`
- [x] ✅ All imports updated to use local types
- [x] ✅ `vercel.json` configured in root and client folder
- [x] ✅ Build tested and working
- [x] ✅ Environment variables documented

## Deployment Steps

### 1. Push to Git
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

**Option A: Via Dashboard (Recommended)**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. **Root Directory**: Set to `client` OR use root with `vercel.json`
4. **Framework Preset**: Vite (auto-detected)
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`

**Option B: Via CLI**
```bash
cd client
npm install -g vercel
vercel login
vercel
```

### 3. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://ljyphggzxbqwdiulmrfh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

**Important**: Add for all environments (Production, Preview, Development)

### 4. Verify Deployment

- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Car rental booking flow works
- [ ] Excursion booking flow works
- [ ] Admin panel accessible at `/admin`
- [ ] Supabase connection working
- [ ] Reservations are being saved

### 5. Post-Deployment

- [ ] Set up custom domain (optional)
- [ ] Configure Supabase RLS policies
- [ ] Create admin user in Supabase Auth
- [ ] Test admin dashboard login
- [ ] Monitor error logs in Vercel dashboard

## Files Created for Deployment

- ✅ `vercel.json` (root) - Configuration for deploying from root
- ✅ `client/vercel.json` - Configuration for deploying from client folder
- ✅ `client/package.json` - Standalone package.json for client
- ✅ `client/vite.config.ts` - Vite config for client-only build
- ✅ `client/tsconfig.json` - TypeScript config for client
- ✅ `client/src/types/schema.ts` - Local type definitions
- ✅ `VERCEL_DEPLOY.md` - Detailed deployment guide
- ✅ `.vercelignore` - Files to exclude from deployment

## Troubleshooting

**Build fails:**
- Check Node version (should be 18+)
- Verify all dependencies in `client/package.json`
- Check build logs in Vercel dashboard

**Environment variables not working:**
- Ensure variables start with `VITE_` prefix
- Redeploy after adding variables
- Check variable names match exactly

**Routes return 404:**
- Verify `vercel.json` has rewrite rules
- Check that `index.html` is in output directory

**Supabase connection fails:**
- Verify environment variables are set
- Check Supabase project is active
- Verify RLS policies allow public inserts

