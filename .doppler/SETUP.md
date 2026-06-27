# Doppler Setup Guide

This guide provides step-by-step instructions for setting up Doppler secrets management for the Tam-Tham website CI/CD pipeline.

---

## Section 1: Create Doppler Account

### 1.1 Sign Up
1. Visit [https://doppler.com](https://doppler.com)
2. Click "Get Started" or "Sign Up"
3. Create your account using GitHub, Google, or email

### 1.2 Create Workplace
1. After logging in, click **"Create Workplace"**
2. Name: `tamtham-website`
3. Description: (Optional) "CI/CD secrets for Tam-Tham website"
4. Click **"Create Workplace"**

### 1.3 Create Project
1. Inside your workplace, click **"Create Project"**
2. Name: `tamtham-website`
3. Click **"Create Project"**

### 1.4 Create Config
1. Inside your project, click **"Create Config"**
2. Name: `production`
3. Click **"Create Config"**

---

## Section 2: Add Secrets

Add the following secrets to your `production` config:

### Required Secrets

| Secret Name | Description | Where to Get It |
|-------------|-------------|-----------------|
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key | Cloudflare Dashboard → Turnstile → Your Site |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID | Azure Portal → Subscriptions → [Your Subscription] → Subscription ID |
| `AZURE_TENANT_ID` | Azure AD tenant ID | Azure Portal → Azure Active Directory → Directory (tenant) ID |
| `AZURE_CLIENT_ID` | Azure AD application client ID | Azure Portal → Azure Active Directory → App Registrations → [Your App] → Application (client) ID |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Azure SWA API token | Azure Portal → Static Web Apps → [Your App] → Deployment credentials |

### How to Add Secrets

1. Navigate to: **Workplaces → tamtham-website → tamtham-website → production**
2. Click the **"Add Secret"** button (top right)
3. For each secret:
   - **Name**: Enter the secret name from the table above
   - **Value**: Enter the secret value
   - Click **"Add Secret"**
4. Repeat for all 5 required secrets

---

## Section 3: Generate Service Token

### 3.1 Navigate to API Tokens
1. Go to: **Workplaces → tamtham-website → Settings → API Tokens**
2. Click **"Create Service Token"**

### 3.2 Configure Token
1. **Name**: `CI/CD Pipeline` (or any descriptive name)
2. **Permissions**: Select **"Read"** (CI/CD only needs read access to inject secrets)
3. Click **"Create Service Token"**

### 3.3 Copy Token
1. **Immediately copy the token** - it will only be shown once
2. Save it securely (you'll need it for GitHub Actions)
3. Format: `dop-s-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Section 4: GitHub Actions Secret Setup

### 4.1 Navigate to GitHub Secrets
1. Go to your GitHub repository
2. Click **"Settings"** → **"Secrets and variables"** → **"Actions"**
3. Click **"New repository secret"**

### 4.2 Add DOPPLER_TOKEN
1. **Name**: `DOPPLER_TOKEN`
2. **Value**: Paste the service token from Section 3
3. Click **"Add secret"**

### 4.3 Add AZURE_STATIC_WEB_APPS_API_TOKEN
1. Click **"New repository secret"** again
2. **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
3. **Value**: Paste your Azure SWA API token from Section 2
4. Click **"Add secret"**

### 4.4 Verify Secrets
Your GitHub Actions secrets should now include:
- ✅ `DOPPLER_TOKEN`
- ✅ `AZURE_STATIC_WEB_APPS_API_TOKEN`

---

## Section 5: Verification

### 5.1 Manual Workflow Trigger
Test your setup by running the workflow manually:

```bash
gh workflow run azure-static-web-apps.yml --ref main
```

### 5.2 Check Workflow Logs
1. Go to: **GitHub Repository → Actions → azure-static-web-apps**
2. Click on the latest workflow run
3. Look for the **"Setup Doppler"** step
4. Verify it shows:
   - ✅ "Doppler Setup" completed successfully
   - ✅ No authentication errors
   - ✅ Secrets injected (check environment variables)

### 5.3 Expected Workflow Steps
Your workflow should complete these steps successfully:
1. ✅ Checkout code
2. ✅ Install OIDC Client Dependencies
3. ✅ Get OIDC Token
4. ✅ Setup Doppler (injects secrets)
5. ✅ Build And Deploy

---

## Troubleshooting

### Common Issues

#### "Authentication failed" during Doppler setup
- **Cause**: Invalid or expired DOPPLER_TOKEN
- **Fix**: Regenerate service token in Doppler and update GitHub secret

#### "Secret not found" errors
- **Cause**: Secret name mismatch between Doppler and workflow
- **Fix**: Verify secret names match exactly (case-sensitive)

#### "Access denied" for Azure deployment
- **Cause**: Invalid AZURE_STATIC_WEB_APPS_API_TOKEN
- **Fix**: Regenerate token in Azure Portal → Static Web Apps → Deployment credentials

### Getting Help
- Doppler Docs: [https://docs.doppler.com](https://docs.doppler.com)
- Azure SWA Docs: [https://docs.microsoft.com/azure/static-web-apps/overview](https://docs.microsoft.com/azure/static-web-apps/overview)

---

## Next Steps

After completing this setup:
1. Push your code to the `main` branch
2. Monitor the GitHub Actions workflow
3. Verify deployment in Azure Portal
4. Test the live site at the Azure SWA staging URL

---

**Last Updated**: 2026-03-13
