#!/bin/bash

# DNS Diagnostic Script for Tam-Tham Website

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DNS DIAGNOSTIC TOOL FOR TAM-THAM WEBSITE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

echo ""
echo "1. CHECKING DNS PROPAGATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "Testing DNS resolution for danny.tamtham.com..."
if dig +short danny.tamtham.com 2>/dev/null | grep -q "workers.dev"; then
    log_success "DNS resolving to Cloudflare Workers"
    dig +short danny.tamtham.com
else
    log_error "DNS not resolving to Workers yet"
    echo "Current DNS response:"
    dig +short danny.tamtham.com 2>/dev/null || echo "No response"
fi

echo ""
echo "Testing DNS resolution for helen.tamtham.com..."
if dig +short helen.tamtham.com 2>/dev/null | grep -q "workers.dev"; then
    log_success "DNS resolving to Cloudflare Workers"
    dig +short helen.tamtham.com
else
    log_error "DNS not resolving to Workers yet"
    echo "Current DNS response:"
    dig +short helen.tamtham.com 2>/dev/null || echo "No response"
fi

echo ""
echo "2. CHECKING CLOUDFLARE DNS RECORDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    log_info "Checking Cloudflare DNS records..."
    curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" | \
        jq -r '.result[] | select(.name | contains("tamtham.com")) | "  \(.type) \(.name) -> \(.content) (\(.proxied))"' 2>/dev/null || \
        echo "  Could not fetch records (check API token)"
else
    log_warn "CLOUDFLARE_API_TOKEN not set. Install Cloudflare CLI or check dashboard manually."
fi

echo ""
echo "3. CHECKING CLOUDFLARE WORKERS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
log_info "Checking if Workers are deployed..."

# Check Danny Worker
echo "  Danny Worker (tamtham-verify-danny):"
if curl -s --max-time 5 "https://tamtham-verify-danny.workers.dev" > /dev/null 2>&1; then
    log_success "  Worker is accessible directly"
else
    log_error "  Worker not accessible directly"
fi

# Check Helen Worker
echo "  Helen Worker (tamtham-verify-helen):"
if curl -s --max-time 5 "https://tamtham-verify-helen.workers.dev" > /dev/null 2>&1; then
    log_success "  Worker is accessible directly"
else
    log_error "  Worker not accessible directly"
fi

echo ""
echo "4. CHECKING MAIN SITE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
log_info "Checking main site (tamtham.com)..."
if curl -s --max-time 10 "https://tamtham.com" > /dev/null 2>&1; then
    log_success "  Main site is accessible"
else
    log_error "  Main site not accessible"
fi

echo ""
echo "5. RECOMMENDED ACTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
log_info "Based on the diagnostics above:"

# Check DNS resolution
if dig +short danny.tamtham.com 2>/dev/null | grep -q "workers.dev"; then
    log_success "DNS is propagating - try accessing https://danny.tamtham.com in browser"
else
    log_warn "DNS has not propagated yet"
    echo ""
    echo "  Options:"
    echo "  1. Wait 5-10 minutes and try again"
    echo "  2. Clear your DNS cache:"
    echo "     - Windows: ipconfig /flushdns"
    echo "     - Mac: sudo dscacheutil -flushcache"
    echo "     - Linux: sudo systemd-resolve --flush-caches"
    echo "  3. Verify DNS records in Cloudflare Dashboard:"
    echo "     https://dash.cloudflare.com/to/your-zone/dns"
    echo "  4. Check if proxy is enabled (orange cloud must be ON)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DIAGNOSTIC COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
