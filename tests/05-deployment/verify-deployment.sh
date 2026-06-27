#!/bin/bash
# Deployment Verification Script
# Tests all 10 deployment requirements (DEPLOY-01 to DEPLOY-05, CLOUD-01 to CLOUD-05)

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0

# Helper functions
pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL++))
}

section() {
    echo ""
    echo -e "${YELLOW}=== $1 ===${NC}"
}

# ============================================
# DEPLOY-01: GitHub Actions workflow exists
# ============================================
section "DEPLOY-01: GitHub Actions workflow exists"

if test -f .github/workflows/azure-static-web-apps.yml; then
    pass "Workflow file exists at .github/workflows/azure-static-web-apps.yml"
else
    fail "Workflow file not found at .github/workflows/azure-static-web-apps.yml"
fi

# Check if workflow is enabled on GitHub (requires authentication)
if command -v gh &> /dev/null; then
    if gh workflow list 2>/dev/null | grep -q "azure-static-web-apps"; then
        pass "GitHub workflow 'azure-static-web-apps' is enabled"
    else
        fail "GitHub workflow 'azure-static-web-apps' not found or not accessible"
    fi
else
    echo -e "${YELLOW}⚠ GitHub CLI not installed, skipping workflow enablement check${NC}"
fi

# ============================================
# DEPLOY-02: Doppler integration present
# ============================================
section "DEPLOY-02: Doppler integration present"

if grep -q "dopplerhq/action" .github/workflows/azure-static-web-apps.yml 2>/dev/null; then
    pass "Doppler action found in workflow"
else
    fail "Doppler action not found in workflow"
fi

# ============================================
# DEPLOY-03: Action versions pinned
# ============================================
section "DEPLOY-03: Action versions pinned"

PINNED_COUNT=$(grep -E "@v[0-9]+" .github/workflows/azure-static-web-apps.yml 2>/dev/null | wc -l)
if [ "$PINNED_COUNT" -gt 0 ]; then
    pass "Found $PINNED_COUNT pinned action versions"
else
    fail "No pinned action versions found"
fi

# ============================================
# DEPLOY-04: Deploy on push to main
# ============================================
section "DEPLOY-04: Deploy on push to main"

if grep -q "push:" .github/workflows/azure-static-web-apps.yml 2>/dev/null; then
    pass "Push trigger found in workflow"
else
    fail "Push trigger not found in workflow"
fi

if grep -q "branches:" .github/workflows/azure-static-web-apps.yml 2>/dev/null; then
    pass "Branches configuration found"
else
    fail "Branches configuration not found"
fi

if grep -q "main" .github/workflows/azure-static-web-apps.yml 2>/dev/null; then
    pass "Main branch configured for deployment"
else
    fail "Main branch not configured"
fi

# ============================================
# DEPLOY-05: Build command configured
# ============================================
section "DEPLOY-05: Build command configured"

if grep -q "app_build_command" .github/workflows/azure-static-web-apps.yml 2>/dev/null; then
    pass "app_build_command configuration found"
else
    fail "app_build_command not found"
fi

if grep -q "npm run build" .github/workflows/azure-static-web-apps.yml 2>/dev/null; then
    pass "Build command 'npm run build' configured"
else
    fail "Build command 'npm run build' not found"
fi

# ============================================
# CLOUD-01: DNS resolves to Azure SWA
# ============================================
section "CLOUD-01: DNS resolves to Azure SWA"

# Check if DNS resolution works (requires network)
if command -v dig &> /dev/null; then
    DNS_RESULT=$(dig +short tamtham.com 2>/dev/null || echo "")
    if echo "$DNS_RESULT" | grep -q "azurestaticapps.net"; then
        pass "DNS resolves to Azure Static Web Apps"
    else
        fail "DNS does not resolve to Azure Static Web Apps (got: $DNS_RESULT)"
    fi
elif command -v nslookup &> /dev/null; then
    DNS_RESULT=$(nslookup tamtham.com 2>/dev/null | grep -i "azurestaticapps.net" || echo "")
    if [ -n "$DNS_RESULT" ]; then
        pass "DNS resolves to Azure Static Web Apps"
    else
        fail "DNS does not resolve to Azure Static Web Apps"
    fi
else
    echo -e "${YELLOW}⚠ Neither dig nor nslookup available, skipping DNS check${NC}"
fi

# ============================================
# CLOUD-02: danny.tamtham.com accessible
# ============================================
section "CLOUD-02: danny.tamtham.com accessible"

HTTP_CODE=$(curl -I -s -o /dev/null -w "%{http_code}" https://danny.tamtham.com 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    pass "danny.tamtham.com accessible (HTTP $HTTP_CODE)"
else
    fail "danny.tamtham.com not accessible (HTTP $HTTP_CODE)"
fi

# ============================================
# CLOUD-03: helen.tamtham.com accessible
# ============================================
section "CLOUD-03: helen.tamtham.com accessible"

HTTP_CODE=$(curl -I -s -o /dev/null -w "%{http_code}" https://helen.tamtham.com 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    pass "helen.tamtham.com accessible (HTTP $HTTP_CODE)"
else
    fail "helen.tamtham.com not accessible (HTTP $HTTP_CODE)"
fi

# ============================================
# CLOUD-04: Bot Fight Mode enabled
# ============================================
section "CLOUD-04: Bot Fight Mode enabled"

echo -e "${YELLOW}⚠ Manual verification required${NC}"
echo "Verify in Cloudflare Dashboard -> Security -> WAF -> Bot Fight Mode"
echo "Expected: Bot Fight Mode should be enabled"

# Note: This requires Cloudflare API access which needs authentication
echo -e "${YELLOW}ℹ To verify via API, run:${NC}"
echo "  curl -s -X GET \"https://api.cloudflare.com/client/v4/zones/$(curl -s -X GET \"https://api.cloudflare.com/client/v4/zones?name=tamtham.com\" -H \"Authorization: Bearer \$CLOUDFLARE_API_KEY\" | jq -r .result[0].id)/settings/bot_fight_mode\" \\"
echo "    -H \"Authorization: Bearer \$CLOUDFLARE_API_KEY\" | jq .result.value\""

# ============================================
# CLOUD-05: Cache Rules configured
# ============================================
section "CLOUD-05: Cache Rules configured"

echo -e "${YELLOW}⚠ Manual verification required${NC}"
echo "Verify in Cloudflare Dashboard -> Caching -> Cache Rules"
echo "Expected: Cache rules should be configured for tamtham.com"

# Note: This requires Cloudflare API access which needs authentication
echo -e "${YELLOW}ℹ To verify via API, run:${NC}"
echo "  curl -s -X GET \"https://api.cloudflare.com/client/v4/zones/$(curl -s -X GET \"https://api.cloudflare.com/client/v4/zones?name=tamtham.com\" -H \"Authorization: Bearer \$CLOUDFLARE_API_KEY\" | jq -r .result[0].id)/cache/rules\" \\"
echo "    -H \"Authorization: Bearer \$CLOUDFLARE_API_KEY\" | jq .result\""

# ============================================
# Summary
# ============================================
section "VERIFICATION SUMMARY"

TOTAL=$((PASS + FAIL))
echo "Total: $TOTAL | Passed: $PASS | Failed: $FAIL"

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}All automated checks passed!${NC}"
    echo -e "${YELLOW}Note: CLOUD-04 and CLOUD-05 require manual verification in Cloudflare Dashboard${NC}"
    exit 0
else
    echo -e "${RED}Some checks failed. Please review the output above.${NC}"
    exit 1
fi
