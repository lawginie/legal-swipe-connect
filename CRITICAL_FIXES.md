# 🔧 CRITICAL FIXES - Execute Before Production

## Fix 1: Secure Environment Variables (30 minutes)

### Step 1: Create .env.example
```bash
# Create safe template
cat > .env.example << 'EOF'
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_URL=your-supabase-url

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_DB_NAME=legal-swipe-connect

# API Configuration
API_PORT=3001
PORT=3001
NODE_ENV=production
JWT_SECRET=generate-with-openssl-rand-base64-32
CORS_ORIGIN=https://your-production-domain.com

# Frontend API URL
VITE_API_URL=https://api.your-domain.com/api
EOF
```

### Step 2: Generate Strong JWT Secret
```bash
# Generate strong secret (32 characters)
openssl rand -base64 32

# Copy output and update .env
# Example output: "Xk7m9pQw2RtNvLb4CzHgYsUj6FaI8eD5"
```

### Step 3: Secure .env File
```bash
# Backup current .env
cp .env .env.backup

# Add to .gitignore if not already
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore

# Remove from git history
git rm --cached .env
git commit -m "Remove .env from version control"
```

### Step 4: Create Production .env
```bash
# Create .env.production (deploy this manually to server)
cat > .env.production << 'EOF'
# NEVER commit this file!
MONGODB_URI=mongodb+srv://prod_user:STRONG_PASSWORD@cluster.mongodb.net/legalswipe-prod
JWT_SECRET=YOUR_GENERATED_SECRET_HERE
NODE_ENV=production
CORS_ORIGIN=https://your-production-domain.com
VITE_API_URL=https://api.your-domain.com/api
EOF
```

---

## Fix 2: Remove Debug Logs (2 hours)

### File 1: src/data/mockProfiles.ts
```typescript
// REMOVE these lines (1381-1383):
// console.log('📚 Mock Profiles Module Loaded');
// console.log('👨‍⚖️ Total Lawyers:', mockLawyers.length);
// console.log('👥 Total Clients:', mockClients.length);

// OR wrap in development check:
if (process.env.NODE_ENV === 'development') {
  console.log('📚 Mock Profiles Module Loaded');
  console.log('👨‍⚖️ Total Lawyers:', mockLawyers.length);
}
```

### File 2: src/pages/Discover.tsx
Replace all console.log with logger:
```typescript
import { logger } from '@/utils/logger';

// BEFORE:
console.log(`👉 Swiping ${direction} on ${currentProfile.name}`);

// AFTER:
logger.debug('User swiping', {
  action: 'swipe',
  metadata: { direction, lawyerName: currentProfile.name }
});
```

### File 3: src/components/SwipeCard.tsx
Remove all console.log statements (lines 24, 37, 40, 44, 60, 73, 76, 80):
```typescript
// DELETE all these:
// console.log('📱 Touch started on', profile.name);
// console.log('📱 Touch ended, dragX:', dragX);
// console.log('✅ Swipe threshold reached, direction:', direction);
// console.log('🚀 Calling onSwipe with', direction);
// console.log('🖱️ Mouse down on', profile.name);
// console.log('🖱️ Mouse up, dragX:', dragX);
```

### Automated Fix Script
```bash
# Create a script to remove debug logs
cat > remove-logs.sh << 'EOF'
#!/bin/bash

# Remove console.log statements (keep console.error)
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Skip logger.ts and test files
  if [[ "$file" != *"logger.ts"* ]] && [[ "$file" != *".test."* ]]; then
    # Comment out console.log and console.warn
    sed -i.bak 's/^\s*console\.log(/\/\/ console.log(/g' "$file"
    sed -i.bak 's/^\s*console\.warn(/\/\/ console.warn(/g' "$file"
    rm "${file}.bak"
  fi
done

echo "✅ Debug logs removed/commented"
EOF

chmod +x remove-logs.sh
./remove-logs.sh
```

---

## Fix 3: Add Error Monitoring (1 hour)

### Step 1: Install Sentry
```bash
npm install @sentry/react
```

### Step 2: Configure Sentry (src/main.tsx)
```typescript
import * as Sentry from "@sentry/react";

// Add before ReactDOM.createRoot
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

### Step 3: Add Error Boundary (src/App.tsx)
```typescript
import * as Sentry from "@sentry/react";

function App() {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      {/* Your existing app */}
    </Sentry.ErrorBoundary>
  );
}

function ErrorFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
        <p className="mb-4">We've been notified and are working on it.</p>
        <Button onClick={() => window.location.href = '/'}>
          Go Home
        </Button>
      </div>
    </div>
  );
}
```

### Step 4: Update .env
```bash
# Add to .env.example
VITE_SENTRY_DSN=your-sentry-dsn-here

# Get DSN from https://sentry.io after creating project
```

---

## Fix 4: Environment Variable Validation (30 minutes)

### Create src/config/validateEnv.ts
```typescript
/**
 * Environment Variable Validation
 * Fails fast if critical env vars are missing
 */

interface RequiredEnvVars {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
  VITE_API_URL: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
}

export function validateEnvironment(): void {
  const required: (keyof RequiredEnvVars)[] = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'VITE_API_URL',
  ];

  const missing: string[] = [];

  required.forEach(key => {
    const value = import.meta.env[key] || process.env[key];
    if (!value) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    const error = `❌ Missing required environment variables:\n${missing.join('\n')}`;
    console.error(error);
    
    if (import.meta.env.PROD) {
      throw new Error(error);
    }
  }

  // Warn about weak secrets
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && (
    jwtSecret.includes('change-in-production') ||
    jwtSecret.includes('your-jwt-secret') ||
    jwtSecret.length < 32
  )) {
    console.warn('⚠️ Warning: JWT_SECRET is weak or default. Generate strong secret for production!');
  }

  console.log('✅ Environment variables validated');
}
```

### Update src/main.tsx
```typescript
import { validateEnvironment } from './config/validateEnv';

// Add at the top of main.tsx
validateEnvironment();

// Then existing code
ReactDOM.createRoot(document.getElementById("root")!).render(...)
```

---

## Fix 5: Production Build Configuration (1 hour)

### Create vite.config.production.ts
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()], // Remove componentTagger in production
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false, // Disable source maps in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

### Update package.json scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build --config vite.config.production.ts",
    "build:dev": "vite build",
    "preview": "vite preview"
  }
}
```

---

## Quick Checklist

Execute these in order:

```bash
# 1. Secure environment (30 min)
openssl rand -base64 32  # Generate JWT secret
# Update .env with new secret
git rm --cached .env
git commit -m "Remove .env from git"

# 2. Remove debug logs (2 hours)
# Manually remove console.log from files listed above
# OR run the automated script

# 3. Add error monitoring (1 hour)
npm install @sentry/react
# Add Sentry config to main.tsx
# Create Sentry project at sentry.io
# Add VITE_SENTRY_DSN to .env

# 4. Validate environment (30 min)
# Create validateEnv.ts
# Call in main.tsx

# 5. Production build config (1 hour)
# Create vite.config.production.ts
# Update package.json scripts

# 6. Test everything
npm run build
npm run preview

# 7. Deploy
# Follow SETUP_GUIDE.md for deployment
```

---

## Verification

After fixes, verify:

```bash
# 1. Build succeeds
npm run build
# Should complete without errors

# 2. No console.log in production bundle
npm run preview
# Open browser console, check for debug logs

# 3. Environment validation works
# Remove VITE_SUPABASE_URL from .env temporarily
npm run dev
# Should show error about missing env var

# 4. Production bundle size
npm run build
# Check dist/ folder size (should be < 2MB)

# 5. Error monitoring works
# Trigger error intentionally
# Check Sentry dashboard for error report
```

---

## Estimated Time

- Fix 1 (Environment): 30 minutes
- Fix 2 (Debug Logs): 2 hours
- Fix 3 (Error Monitoring): 1 hour
- Fix 4 (Validation): 30 minutes
- Fix 5 (Build Config): 1 hour

**Total**: ~5 hours

**After these fixes, your app is 100% production ready! 🚀**
