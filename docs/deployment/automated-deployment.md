# Automated Deployment Setup

This guide shows you how to set up automated deployment to Cloudflare Workers using GitHub Actions.

## Overview

The automated deployment workflow:
- ✅ Triggers on every push to the `develop` branch
- ✅ Runs tests to ensure code quality
- ✅ Builds the project
- ✅ Deploys to Cloudflare Workers
- ✅ Can be manually triggered if needed

## Setup Steps

### 1. Configure GitHub Repository Secrets

You need to add these secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each of these:

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Workers:Edit permissions | Cloudflare Dashboard → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | Cloudflare Dashboard → Right sidebar |
| `TALLY_API_KEY` | Your Tally API key | Tally Dashboard → Settings → API |
| `AUTH_TOKEN` | Optional: Custom auth token for your MCP server | Generate your own secure token |

### 2. Creating Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use **Custom token** template
4. Configure:
   - **Token name**: `GitHub Actions - Tally MCP`
   - **Permissions**: 
     - Account: `Cloudflare Workers:Edit`
     - Zone Resources: `Include - All zones` (if using custom domains)
   - **Account Resources**: Include your account
5. Click **Continue to summary** → **Create Token**
6. Copy the token immediately (you won't see it again!)

### 3. Finding Your Cloudflare Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. In the right sidebar, you'll see **Account ID**
3. Copy this value

### 4. Test the Workflow

Once you've added all secrets:

1. Push a commit to the `develop` branch:
   ```bash
   git checkout develop
   git add .
   git commit -m "test: trigger automated deployment"
   git push origin develop
   ```

2. Watch the deployment:
   - Go to your repository on GitHub
   - Click **Actions tab**
   - You should see "Deploy to Cloudflare Workers" running

### 5. Manual Deployment (Optional)

You can also trigger deployment manually:

1. Go to **Actions tab** in your GitHub repository
2. Click **Deploy to Cloudflare Workers**
3. Click **Run workflow** → **Run workflow**

## Workflow Features

### ✅ **Quality Checks**
- Runs full test suite before deployment
- Only deploys if all tests pass
- Uses mock API during testing

### ✅ **Security**
- Uses GitHub repository secrets for sensitive data
- Secrets are encrypted and not visible in logs
- Secrets are automatically injected into Cloudflare Workers

### ✅ **Notifications**
- Success/failure notifications in workflow logs
- Easy to see deployment status in GitHub Actions tab

### ✅ **Flexibility**
- Triggers on `develop` branch pushes
- Can be manually triggered when needed
- Separate from your main CI workflow

## Troubleshooting

### Common Issues

**❌ "Invalid API token"**
- Check that your `CLOUDFLARE_API_TOKEN` has correct permissions
- Ensure the token hasn't expired

**❌ "Account ID not found"** 
- Verify `CLOUDFLARE_ACCOUNT_ID` is correct
- Make sure the API token can access this account

**❌ "Tests failing"**
- Check that `USE_MOCK_API=true` is set in test environment
- Ensure all dependencies are installed correctly

**❌ "Deployment timeout"**
- Large builds may take longer
- Check Cloudflare Workers limits for your plan

### Getting Help

1. Check the **Actions tab** for detailed logs
2. Verify all secrets are correctly set
3. Test deployment manually first: `npm run deploy:cloudflare`
4. Check Cloudflare Workers dashboard for deployment status

## Next Steps

After successful setup:
- Every push to `develop` automatically deploys
- Your production `main` branch remains stable
- You can continue developing with confidence
- Monitor deployments in GitHub Actions and Cloudflare dashboard 