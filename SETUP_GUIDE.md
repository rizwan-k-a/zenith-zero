# ZENITH ZERO — Installation & Setup Guide

Complete step-by-step guide to deploy and run ZENITH ZERO locally or in production.

---

## System Requirements

### Minimum Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: v2.30.0 or higher
- **Internet Connection**: Required for Supabase cloud connectivity
- **Memory**: 4 GB RAM minimum
- **Storage**: 2 GB free disk space

### Recommended Setup
- **Node.js**: v20.0.0 LTS or higher
- **npm**: v10.0.0 or higher
- **VS Code**: Latest version with TypeScript support
- **OS**: Windows 10+, macOS 12+, or Ubuntu 20.04 LTS

---

## Quick Start (5 Minutes)

### 1. Clone Project
```bash
git clone <repository-url>
cd "zenith zero/project"
```

### 2. Install Dependencies
```bash
npm install
```

This installs all required packages including React, TypeScript, Supabase, and UI components.

### 3. Configure Environment
Create `.env.local` file in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Replace with your actual Supabase project credentials.

### 4. Start Development Server
```bash
npm run dev
```

Application loads at `http://localhost:5173`

---

## Environment Configuration

### Required Variables

#### VITE_SUPABASE_URL
- **Purpose**: Supabase PostgreSQL endpoint
- **Format**: `https://[project-id].supabase.co`
- **Source**: Supabase Dashboard → Settings → API

#### VITE_SUPABASE_ANON_KEY
- **Purpose**: Public JWT key for client authentication
- **Format**: Base64-encoded JWT
- **Source**: Supabase Dashboard → Settings → API
- **Security**: This key is public; never commit to source control

### Optional Variables
- `VITE_LOG_LEVEL=debug` — Enable verbose logging
- `VITE_API_TIMEOUT=10000` — API timeout in milliseconds

### Environment File Locations
- Development: `.env.local`
- Production: `.env.production.local`
- Testing: `.env.test`

**Note**: Never commit `.env.local` files to git repository.

---

## Dependency Installation Details

### React Ecosystem
- `react@18` — UI framework
- `react-dom@18` — DOM rendering
- `react-router-dom@6` — Client-side routing

### State Management
- `zustand@4` — Global state management
- `zustand` uses simple store pattern with reduced boilerplate

### Database
- `@supabase/supabase-js@2` — Supabase client library
- Handles PostgreSQL queries, authentication, and realtime subscriptions

### UI Components
- `shadcn-ui` — Unstyled, accessible component library
- `@radix-ui/*` — Primitive components for accessibility
- `class-variance-authority` — Type-safe CSS class management

### Visualization
- `recharts@2` — React charting library
- `reactflow@11` — Graph visualization for identity relationships

### Utilities
- `clsx` — Conditional CSS class composition
- `tailwind-merge` — Smart TailwindCSS class merging

### Development Tools
- `vite@5` — Build tool and dev server
- `typescript@5` — Type safety
- `tailwindcss@3` — Utility-first CSS
- `autoprefixer` — CSS vendor prefixing

---

## Start Development Server

### Command
```bash
npm run dev
```

### What Happens
1. Vite dev server starts on `http://localhost:5173`
2. TypeScript compilation watches all `.ts` and `.tsx` files
3. Hot Module Replacement (HMR) enabled for instant updates
4. Backend API routes through Supabase
5. Console logs appear in terminal

### Expected Output
```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### Stopping Server
Press `Ctrl+C` in terminal

---

## Production Build

### Build Command
```bash
npm run build
```

### Output
- Optimized JavaScript bundles in `dist/` directory
- Tree-shaken unused code
- Minified and compressed assets
- Source maps for debugging (optional)

### Build Output Structure
```
dist/
├── index.html           # Entry point
├── assets/
│   ├── main-xxxxx.js   # Application code
│   ├── vendor-xxxxx.js # Dependencies
│   └── style-xxxxx.css # Compiled styles
└── manifest.json       # Asset manifest
```

---

## Preview Production Build

### Preview Command
```bash
npm run preview
```

### Purpose
- Test production build locally before deployment
- Verify all optimizations and minification
- Check asset loading and CSS bundling

### Access
- Available at `http://localhost:4173`
- Press `Ctrl+C` to stop

---

## Database Verification

### Verify Supabase Connection

#### Via Dashboard
1. Open Supabase Dashboard
2. Select your project
3. Navigate to "SQL Editor"
4. Run test query:
```sql
SELECT COUNT(*) FROM employees;
```
Should return: `8500` (or your actual employee count)

#### Via Application
1. Start dev server: `npm run dev`
2. Open browser console: `F12`
3. Navigate to "Executive Dashboard"
4. Check for green "LIVE DATA" badge
5. Verify KPI metrics load (should not be 0)

#### Verify All Tables
```sql
-- Check all required tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema='public'
ORDER BY table_name;
```

Expected tables (18 total):
- employees
- platform_accounts
- permissions
- identity_relationships
- group_memberships
- service_accounts
- temporary_access
- audit_logs
- notifications
- compliance_violations
- api_tokens
- privilege_history
- offboarding_records
- cross_dep_locks
- residual_access_violations
- lifecycle_events
- revocation_requests
- security_metrics_history

---

## Common Installation Errors

### Error 1: Node Version Mismatch
```
Error: This version of npm is incompatible with node v16.x.x
```

**Solution**:
```bash
# Check current version
node --version
npm --version

# Update Node.js via nvm (recommended)
nvm install 20
nvm use 20

# Or download from nodejs.org
```

### Error 2: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5173
```

**Solution**:
```bash
# Kill process using port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9

# Or use different port:
npm run dev -- --port 5174
```

### Error 3: Missing Environment Variables
```
TypeError: Cannot read property 'supabaseUrl' of undefined
```

**Solution**:
```bash
# Verify .env.local exists in project root
ls .env.local  # or dir .env.local on Windows

# Recreate if missing:
echo "VITE_SUPABASE_URL=https://your-project.supabase.co" > .env.local
echo "VITE_SUPABASE_ANON_KEY=your-key" >> .env.local
```

### Error 4: Supabase Connection Failed
```
Error: Failed to connect to Supabase: Network request failed
```

**Solutions**:
1. Verify internet connection
2. Check Supabase project is active (not paused)
3. Verify VITE_SUPABASE_URL format: `https://[id].supabase.co`
4. Check firewall/VPN not blocking Supabase domain
5. Verify API keys are correct (copy-paste from Supabase dashboard)

### Error 5: Dependency Conflicts
```
npm ERR! peer dep missing: [package]@^x.y.z
```

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lockfile
rm -rf node_modules package-lock.json

# Fresh install
npm install
```

### Error 6: TypeScript Compilation Error
```
error TS7053: Element implicitly has an 'any' type because index expression is not of type 'number'
```

**Solution**: This is a type safety check. Fix requires adding type annotations or using `as` casts.

### Error 7: Build Fails with Memory Error
```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed
```

**Solution**:
```bash
# Increase Node heap size
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

---

## Database Troubleshooting

### Issue: Tables Empty
```sql
-- Check row counts
SELECT 'employees' as table_name, COUNT(*) as count FROM employees
UNION ALL
SELECT 'platform_accounts', COUNT(*) FROM platform_accounts
UNION ALL
SELECT 'permissions', COUNT(*) FROM permissions;
```

If counts are 0, run seed scripts:
```bash
# Python seed script
python backend/seed_data.py

# Or use Supabase SQL files
# Navigate to SQL Editor in Supabase Dashboard
# Run schema/create_tables.sql
# Run seed scripts from supabase/migrations/
```

### Issue: Authentication Fails
```
Error: Invalid login credentials
```

**Solutions**:
1. Verify credentials are for correct Supabase project
2. Check RLS policies allow anonymous/authenticated access
3. Verify auth is enabled in Supabase project settings
4. Check user exists in auth_users table

### Issue: RLS Policy Violations
```
Error: new row violates row-level security policy
```

**Solution**: Verify RLS policies allow INSERT/UPDATE/DELETE for your role:
```sql
-- View active RLS policies
SELECT * FROM pg_policies WHERE tablename = 'table_name';
```

---

## Advanced Setup Options

### Using Custom Node Version
```bash
# Install specific Node version
nvm install 20.10.0
nvm use 20.10.0
nvm default 20.10.0
```

### Using Docker (Optional)
```bash
# Build Docker image
docker build -t zenith-zero:latest .

# Run container
docker run -p 5173:5173 zenith-zero:latest npm run dev
```

### Using Package Manager Alternative
```bash
# Using yarn instead of npm
npm install -g yarn
yarn install
yarn dev

# Using pnpm
npm install -g pnpm
pnpm install
pnpm dev
```

---

## Verification Checklist

- [ ] Node.js v18+ installed
- [ ] npm v9+ installed  
- [ ] Git installed and configured
- [ ] Project cloned successfully
- [ ] npm install completed without errors
- [ ] .env.local created with valid credentials
- [ ] npm run dev starts without errors
- [ ] Dashboard loads at localhost:5173
- [ ] "LIVE DATA" badge appears on dashboard
- [ ] KPI metrics show non-zero values
- [ ] Supabase connection verified

---

## Getting Help

### Check Logs
```bash
# Terminal logs during dev
npm run dev  # Shows errors in real-time

# Browser console
F12 → Console tab → Look for red errors
```

### Verify Installation
```bash
# Check Node and npm versions
node --version  # Should be v18+
npm --version   # Should be v9+

# Check dependencies installed
npm list react  # Should show react@18+

# Test Supabase connection
node -e "require('@supabase/supabase-js')"  # Should run without error
```

### Manual Testing
1. Start dev server: `npm run dev`
2. Open dashboard: `http://localhost:5173/dashboard`
3. Check browser DevTools (F12)
4. Look for network requests to Supabase
5. Verify data loads in tables

---

## Next Steps After Installation

1. **Review README.md** for system architecture
2. **Check PROJECT_OVERVIEW.md** for demo walkthrough
3. **Login** with credentials (admin/admin or as provided)
4. **Explore Dashboard** to verify live data
5. **Visit Remediation Engine** to see active issues
6. **Test Compliance Center** to understand detection engines
7. **Try Identity Graph** to visualize relationships

---

## Support & Documentation

- **README.md**: Architecture and features
- **PROJECT_OVERVIEW.md**: Demo walkthrough and evaluation criteria
- **src/**: TypeScript source code with extensive comments
- **supabase/**: Database schema and migration files
- **backend/**: Python seed data generators (reference)

---

**Last Updated**: 2026-06-21
**Version**: 1.0.0
