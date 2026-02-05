# Complete Deployment Guide for GitHub Pages

This guide walks you through deploying your Task & Habit Planner Dashboard to GitHub Pages with a custom repository name.

## 📋 Prerequisites

- GitHub account
- Git installed on your computer
- Node.js 18+ installed
- Your project files (the ZIP download from Figma Make)

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Project

1. **Extract the ZIP file** you downloaded from Figma Make
2. **Open Terminal/Command Prompt** and navigate to the project folder:
   ```bash
   cd path/to/Task_Rounak
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Test the build locally**:
   ```bash
   npm run build
   ```
   This creates a `/dist` folder with your production files.

### Step 2: Create GitHub Repository

1. **Go to GitHub.com** and sign in
2. **Click the "+" icon** in the top right → "New repository"
3. **Repository settings**:
   - Name: `Task_Rounak` (or your preferred name)
   - Description: "Modern Task & Habit Planner Dashboard"
   - Public or Private (your choice)
   - **Do NOT** initialize with README, .gitignore, or license
4. **Click "Create repository"**

### Step 3: Update Base Path (If Needed)

If you named your repository something other than `Task_Rounak`:

1. **Open `vite.config.ts`**
2. **Find this line**:
   ```typescript
   base: process.env.NODE_ENV === 'production' ? '/Task_Rounak/' : '/',
   ```
3. **Change `/Task_Rounak/`** to match your repository name:
   ```typescript
   base: process.env.NODE_ENV === 'production' ? '/YourRepoName/' : '/',
   ```
4. **Save the file**

### Step 4: Initialize Git and Push

1. **Initialize Git** (if not already):
   ```bash
   git init
   ```

2. **Add all files**:
   ```bash
   git add .
   ```

3. **Commit**:
   ```bash
   git commit -m "Initial commit: Task & Habit Planner Dashboard"
   ```

4. **Add remote** (replace `YOUR_USERNAME` and `YOUR_REPO_NAME`):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```

5. **Push to GitHub**:
   ```bash
   git branch -M main
   git push -u origin main
   ```

### Step 5: Build for Production

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Force add the dist folder** (it's normally gitignored):
   ```bash
   git add dist -f
   ```

3. **Commit the build**:
   ```bash
   git commit -m "Add production build"
   ```

4. **Push**:
   ```bash
   git push origin main
   ```

### Step 6: Configure GitHub Pages

1. **Go to your repository** on GitHub.com
2. **Click "Settings"** (top navigation)
3. **Click "Pages"** (left sidebar)
4. **Source**: Select "Deploy from a branch"
5. **Branch**: 
   - Select: `main`
   - Folder: `/dist` (not `/root`)
6. **Click "Save"**

### Step 7: Wait for Deployment

1. **GitHub Actions** will automatically deploy your site
2. **Wait 1-2 minutes** for the first deployment
3. **Refresh the Pages settings page** to see your URL
4. **Your site will be live at**: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## ✅ Verify Deployment

1. **Visit your GitHub Pages URL**
2. **You should see the login page**
3. **Create an account** and test the app
4. **Open on mobile** to test responsive design
5. **Check dark mode** works properly

## 🔄 Updating Your Deployed App

Whenever you make changes:

1. **Make your changes** to the source code
2. **Build**:
   ```bash
   npm run build
   ```
3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Describe your changes"
   git add dist -f
   git commit -m "Update build"
   git push origin main
   ```
4. **GitHub Pages** will automatically redeploy

## 🤖 Automated Deployment with GitHub Actions (Recommended)

For automatic deployments on every push:

### Step 1: Create GitHub Actions Workflow

1. **Create folders**:
   ```bash
   mkdir -p .github/workflows
   ```

2. **Create file** `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]
     workflow_dispatch:

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: "pages"
     cancel-in-progress: false

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4
           
         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: '18'
             cache: 'npm'
             
         - name: Install dependencies
           run: npm ci
           
         - name: Build
           run: npm run build
           env:
             NODE_ENV: production
           
         - name: Setup Pages
           uses: actions/configure-pages@v4
           
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: './dist'

     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       needs: build
       steps:
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

3. **Update `.gitignore`** to exclude dist:
   ```
   # Ensure dist is NOT in .gitignore when using Actions
   # dist
   ```

4. **Commit and push**:
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Actions deployment"
   git push origin main
   ```

### Step 2: Update GitHub Pages Settings

1. **Go to Settings → Pages**
2. **Source**: Change to "GitHub Actions"
3. **Save**

Now every push to `main` automatically rebuilds and deploys! 🎉

## 🐛 Common Issues & Solutions

### Issue: 404 Page Not Found

**Solution**: 
- Check that `base` in `vite.config.ts` matches your repository name
- Ensure you selected `/dist` folder in GitHub Pages settings
- Verify the build completed successfully

### Issue: Blank Page After Deploy

**Solution**:
- Open browser console (F12) and check for errors
- Verify `base` path is correct
- Clear browser cache
- Check that all assets are loading (Network tab)

### Issue: Styles Not Loading

**Solution**:
- Rebuild: `npm run build`
- Check `dist` folder was committed and pushed
- Verify Tailwind CSS is processing correctly

### Issue: Authentication Not Working

**Solution**:
- Check Supabase credentials in `/utils/supabase/info.tsx`
- Verify Supabase Edge Functions are deployed
- Check browser console for specific auth errors
- Ensure Supabase project allows your GitHub Pages URL as an origin

### Issue: GitHub Actions Failing

**Solution**:
- Check the Actions tab for error logs
- Verify `package.json` dependencies are correct
- Ensure Node version in workflow matches local version
- Clear GitHub Actions cache

## 📊 Monitoring Your Deployment

### Check Build Status
1. Go to your repository
2. Click "Actions" tab
3. View latest workflow run
4. Check logs for any errors

### Check Live Site
1. Visit your GitHub Pages URL
2. Open browser DevTools (F12)
3. Check Console tab for errors
4. Check Network tab for failed requests

### View Analytics
GitHub doesn't provide built-in analytics, but you can add:
- Google Analytics
- Plausible Analytics
- Umami Analytics

## 🎯 Next Steps

After successful deployment:

1. ✅ **Test thoroughly** on different devices
2. ✅ **Share your URL** with friends/testers
3. ✅ **Monitor Supabase** dashboard for errors
4. ✅ **Set up custom domain** (optional)
5. ✅ **Enable Google Analytics** (optional)

## 🌐 Custom Domain (Optional)

To use a custom domain like `habits.yourdomain.com`:

1. **Buy a domain** (Namecheap, Google Domains, etc.)
2. **Add CNAME record** pointing to `YOUR_USERNAME.github.io`
3. **In GitHub Pages settings**:
   - Enter your custom domain
   - Enable "Enforce HTTPS"
4. **Wait for DNS propagation** (up to 24 hours)

## 🔒 Security Best Practices

1. **Never commit** sensitive API keys to public repos
2. **Use environment variables** for secrets (though Supabase handles this)
3. **Enable branch protection** on `main` branch
4. **Review** pull requests before merging
5. **Keep dependencies updated**: `npm audit fix`

## 📱 PWA Setup (Progressive Web App)

To make your app installable on mobile:

1. Create `public/manifest.json`
2. Add service worker
3. Add icons in various sizes
4. Update `index.html` to reference manifest

(Advanced - not covered in this guide)

## ✨ Performance Optimization

Your app is already optimized with:
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ Lazy loading
- ✅ Optimized images

To further improve:
- Use Lighthouse in Chrome DevTools
- Optimize images with WebP format
- Add compression at hosting level

## 🎓 Learning Resources

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Documentation](https://supabase.com/docs)
- [React Best Practices](https://react.dev/learn)

## 🆘 Getting Help

If you're stuck:

1. **Check the console** for error messages
2. **Review GitHub Actions logs**
3. **Check Supabase logs** in your project dashboard
4. **Search existing issues** on GitHub
5. **Ask in community forums** (Stack Overflow, Reddit)

---

**Congratulations!** 🎉 Your app is now live and accessible to anyone with the URL.

Remember: Your Supabase backend handles authentication and data storage automatically, so users can create accounts and their data will be securely stored and synced across devices.

**Happy habit tracking!** 📊✨
