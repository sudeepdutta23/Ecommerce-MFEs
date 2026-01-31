# Deployment Guide: GitHub Pages + GitHub Actions

## Overview
This project uses GitHub Actions to automatically build and deploy to GitHub Pages on every push to `main` or `master` branches.

## Setup Instructions

### 1. Enable GitHub Pages
1. Go to your repository settings
2. Navigate to **Settings → Pages**
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - **Branch**: Leave as is (Actions will handle it)
4. Click Save

### 2. Configure Repository Secrets (Optional)
If you need custom deployment variables:
1. Go to **Settings → Secrets and variables → Actions**
2. Add any environment variables your build needs

### 3. Configure Next.js for Static Export (Important)

Update [packages/shell/next.config.js](../../packages/shell/next.config.js):
```javascript
const nextConfig = {
  output: 'export', // Enable static export
  images: {
    unoptimized: true, // Required for static export
  },
  // ... rest of config
}
```

Do the same for [packages/admin/next.config.js](../../packages/admin/next.config.js).

### 4. Update Vite Config for Base Path (if needed)

For packages/home, packages/product, etc., update vite.config.ts:
```typescript
export default defineConfig({
  base: '/', // Root path, or '/product' if deploying to subdirectory
  // ... rest of config
})
```

## Deployment Process

### Automatic Deployment
- Commits to `main` or `master` → Automatic build & deploy
- Pull requests → Build runs but doesn't deploy
- Manual trigger: Go to **Actions → Deploy to GitHub Pages → Run workflow**

### What Gets Deployed
1. **Home** → Root (`/`) - Landing page
2. **Product** → `/product` - Product listing
3. **Cart** → `/cart` - Shopping cart
4. **Checkout** → `/checkout` - Checkout flow
5. **Profile** → `/profile` - User profile
6. **Admin** → `/admin` - Admin dashboard

## Access Your Deployed Site

Your site will be available at:
- `https://YOUR_USERNAME.github.io/E-commerce/`
- Or custom domain if configured

## Troubleshooting

### Build Fails
- Check **Actions → Workflows → Deploy to GitHub Pages** for error logs
- Ensure Node.js 18+ is available
- Run `npm run build` locally to verify

### Pages Not Loading
- Verify GitHub Pages is enabled in repository settings
- Check that build artifact was uploaded successfully
- Clear browser cache and try incognito mode

### Module Federation Issues
- Ensure all microfrontends are accessible from the base URL
- Update federation configuration if paths change

## Environment Variables

Add environment-specific configs:
```bash
# Create .env.local for local development
VITE_API_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

These won't be deployed. For production secrets, use GitHub Secrets.

## Monitoring Deployments

1. Go to **Actions** tab in your repository
2. View workflow runs and their logs
3. Check deployment status under **Deployments → github-pages**

## Rollback

To rollback to a previous version:
1. Revert the problematic commit on main branch
2. Push the revert commit
3. GitHub Actions will automatically redeploy with previous code

## Performance Tips

- Use Turbo cache for faster builds: `npm run build`
- Optimize images and assets before committing
- Monitor workflow run times in Actions tab
- Consider splitting large microfrontends

## Next Steps

- Set up a custom domain (optional)
- Configure branch protection rules
- Add status checks before merge
- Set up notifications for failed deployments
