# GitHub Actions Setup for Auto-Deploy

## ✅ Workflow Created
The GitHub Action workflow is ready at `.github/workflows/firebase-hosting-deploy.yml`

## 🔐 Required GitHub Secrets

You need to add these secrets to your GitHub repository:

### 1. Go to your repo settings:
https://github.com/tomcat65/philly-wings/settings/secrets/actions

### 2. Add these secrets (click "New repository secret" for each):

#### Firebase Config Secrets:
- `VITE_FIREBASE_API_KEY` - Your Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - philly-wings.firebaseapp.com
- `VITE_FIREBASE_PROJECT_ID` - philly-wings
- `VITE_FIREBASE_STORAGE_BUCKET` - philly-wings.firebasestorage.app
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Your sender ID
- `VITE_FIREBASE_APP_ID` - Your app ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Your measurement ID

#### Service Account Secret:
- `FIREBASE_SERVICE_ACCOUNT` - (See instructions below)

## 🔑 Generate Firebase Service Account

1. Go to Firebase Console:
   https://console.firebase.google.com/project/philly-wings/settings/serviceaccounts/adminsdk

2. Click "Generate new private key"

3. Download the JSON file

4. Copy the ENTIRE contents of the JSON file

5. Create a new secret named `FIREBASE_SERVICE_ACCOUNT` and paste the JSON content

## 🚀 How It Works

- **Push to main** → Deploys to production
- **Pull Request** → Creates preview deployment (expires in 7 days)
- **Build fails** → Deployment cancelled

## 📝 Test Your Setup

1. Make a small change to any file
2. Commit and push to main
3. Check Actions tab: https://github.com/tomcat65/philly-wings/actions
4. Watch your site auto-deploy!

## 🎯 Benefits

- No manual deployments needed
- Preview URLs for PRs
- Automatic rollback on failures
- Build logs visible in GitHub