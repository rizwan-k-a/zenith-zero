#!/usr/bin/env bash

##############################################################################
# ZENITH ZERO — Advanced Bootstrap Setup Script
# 
# Purpose: Complete development environment setup with validation
# Features:
#   - Dependency version checking
#   - Git configuration
#   - Environment file validation
#   - Database connection testing
#   - Node version management (nvm support)
#   - Graceful error handling
#
# Usage: chmod +x bootstrap.sh && ./bootstrap.sh
##############################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         ZENITH ZERO — Advanced Bootstrap Setup              ║"
echo "║              Enterprise Setup with Validation              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

##############################################################################
# SECTION 1: Dependency Checks
##############################################################################

echo ""
echo -e "${BLUE}[1/6] Checking System Dependencies${NC}"

# Check Node.js
echo -n "  Checking Node.js... "
if ! command -v node &> /dev/null; then
    echo -e "${RED}FAILED${NC}"
    echo -e "    ${RED}✗ Node.js not installed${NC}"
    echo -e "    ${YELLOW}Install from: https://nodejs.org (v18+ required)${NC}"
    echo ""
    echo "    Or use nvm (recommended):"
    echo "      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "      nvm install 20"
    echo "      nvm use 20"
    exit 1
fi
NODE_VER=$(node --version)
NODE_MAJOR=$(echo $NODE_VER | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo -e "${RED}FAILED${NC}"
    echo -e "    ${RED}✗ Node.js v18+ required, found: $NODE_VER${NC}"
    exit 1
fi
echo -e "${GREEN}OK${NC} ($NODE_VER)"

# Check npm
echo -n "  Checking npm... "
if ! command -v npm &> /dev/null; then
    echo -e "${RED}FAILED${NC}"
    echo -e "    ${RED}✗ npm not installed (should come with Node.js)${NC}"
    exit 1
fi
NPM_VER=$(npm --version)
echo -e "${GREEN}OK${NC} (v$NPM_VER)"

# Check Git
echo -n "  Checking git... "
if ! command -v git &> /dev/null; then
    echo -e "${RED}FAILED${NC}"
    echo -e "    ${RED}✗ git not installed${NC}"
    echo -e "    ${YELLOW}Install from: https://git-scm.com/download${NC}"
    exit 1
fi
GIT_VER=$(git --version | awk '{print $3}')
echo -e "${GREEN}OK${NC} (v$GIT_VER)"

##############################################################################
# SECTION 2: Environment Configuration
##############################################################################

echo ""
echo -e "${BLUE}[2/6] Checking Environment Configuration${NC}"

if [ ! -f ".env.local" ]; then
    echo -e "  ${YELLOW}⚠ .env.local not found${NC}"
    echo ""
    echo "  Create .env.local with Supabase credentials:"
    echo ""
    echo "    1. Visit: https://supabase.com/dashboard"
    echo "    2. Select your project"
    echo "    3. Go to: Settings → API → Exposed schemas"
    echo "    4. Copy: Project URL and anon public key"
    echo ""
    echo "  Then create file with:"
    cat << 'EOF'
    
    cat > .env.local << 'ENVEOF'
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
    ENVEOF
    
EOF
    
    read -p "  Create .env.local now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "  Enter SUPABASE_URL: " SUPABASE_URL
        read -p "  Enter SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
        
        cat > .env.local << EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF
        echo -e "  ${GREEN}✓ .env.local created${NC}"
    else
        echo -e "  ${RED}✗ .env.local required to continue${NC}"
        exit 1
    fi
else
    echo -e "  ${GREEN}✓ .env.local found${NC}"
    
    # Validate environment file
    if ! grep -q "VITE_SUPABASE_URL" .env.local; then
        echo -e "  ${RED}✗ Missing VITE_SUPABASE_URL in .env.local${NC}"
        exit 1
    fi
    if ! grep -q "VITE_SUPABASE_ANON_KEY" .env.local; then
        echo -e "  ${RED}✗ Missing VITE_SUPABASE_ANON_KEY in .env.local${NC}"
        exit 1
    fi
    echo -e "  ${GREEN}✓ Environment variables valid${NC}"
fi

##############################################################################
# SECTION 3: Dependency Installation
##############################################################################

echo ""
echo -e "${BLUE}[3/6] Installing Dependencies${NC}"

if [ -d "node_modules" ]; then
    echo "  Checking existing node_modules..."
    if [ ! -f "package-lock.json" ] || [ -z "$(find node_modules -name 'react' 2>/dev/null)" ]; then
        echo -e "  ${YELLOW}⚠ Stale or incomplete node_modules detected${NC}"
        read -p "  Reinstall dependencies? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "  Cleaning..."
            rm -rf node_modules package-lock.json
            echo "  Installing..."
            npm install --legacy-peer-deps
        fi
    else
        echo -e "  ${GREEN}✓ Dependencies appear valid${NC}"
    fi
else
    echo "  Installing dependencies (this may take 2-3 minutes)..."
    npm install --legacy-peer-deps
fi

##############################################################################
# SECTION 4: Build Verification
##############################################################################

echo ""
echo -e "${BLUE}[4/6] Verifying TypeScript Compilation${NC}"

echo "  Running tsc check..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ TypeScript compilation OK${NC}"
else
    echo -e "  ${YELLOW}⚠ TypeScript has errors (non-fatal)${NC}"
    echo "    Run 'npm run dev' to see details"
fi

##############################################################################
# SECTION 5: Git Configuration
##############################################################################

echo ""
echo -e "${BLUE}[5/6] Git Configuration${NC}"

GIT_CONFIGURED=true
GIT_USER=$(git config --global user.name)
if [ -z "$GIT_USER" ]; then
    GIT_CONFIGURED=false
    echo -e "  ${YELLOW}⚠ Git user not configured${NC}"
    read -p "  Enter your name: " GIT_NAME
    read -p "  Enter your email: " GIT_EMAIL
    git config --global user.name "$GIT_NAME"
    git config --global user.email "$GIT_EMAIL"
    echo -e "  ${GREEN}✓ Git configured${NC}"
else
    echo -e "  ${GREEN}✓ Git user: $GIT_USER${NC}"
fi

if [ ! -d ".git" ]; then
    echo "  Initializing git repository..."
    git init > /dev/null
    echo -e "  ${GREEN}✓ Git repository initialized${NC}"
fi

##############################################################################
# SECTION 6: Database Connection Test (Optional)
##############################################################################

echo ""
echo -e "${BLUE}[6/6] Database Connection Test${NC}"

if command -v curl &> /dev/null; then
    SUPABASE_URL=$(grep "VITE_SUPABASE_URL" .env.local | cut -d'=' -f2 | tr -d ' ')
    if [ ! -z "$SUPABASE_URL" ]; then
        echo "  Testing Supabase connection..."
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" 2>/dev/null || echo "000")
        
        if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "401" ]; then
            echo -e "  ${GREEN}✓ Supabase accessible${NC}"
        else
            echo -e "  ${YELLOW}⚠ Cannot reach Supabase (HTTP $HTTP_CODE)${NC}"
            echo "    Check: 1. Internet connection"
            echo "           2. VITE_SUPABASE_URL is correct"
            echo "           3. Firewall settings"
        fi
    fi
else
    echo -e "  ${YELLOW}⚠ curl not available, skipping connection test${NC}"
fi

##############################################################################
# SUMMARY
##############################################################################

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ✓ Setup Complete — Ready to Run                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "Next steps:"
echo ""
echo "  1. Start development server:"
echo "     ${BLUE}npm run dev${NC}"
echo ""
echo "  2. Open in browser:"
echo "     ${BLUE}http://localhost:5173${NC}"
echo ""
echo "  3. Or use the one-click runner:"
echo "     ${BLUE}./run.sh${NC} (or run.bat on Windows)"
echo ""
echo "Documentation:"
echo "  - README.md        — Architecture and features"
echo "  - SETUP_GUIDE.md   — Detailed setup instructions"
echo "  - PROJECT_OVERVIEW.md — Demo walkthrough for evaluators"
echo ""

exit 0
