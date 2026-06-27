#!/bin/bash

# Cloudflare Setup Script for Tam-Tham Website

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[⚠]${NC} $1"; }

check_prerequisites() {
    log_info "Checking prerequisites..."
    if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
        log_error "CLOUDFLARE_API_TOKEN not set"
        echo "export CLOUDFLARE_API_TOKEN=\"your-token-here\""
        exit 1
    fi
    log_success "API token is set"
}

get_zone_id() {
    log_info "Getting zone ID..."
    ZONE_ID=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        "https://api.cloudflare.com/client/v4/zones" | \
        jq -r '.result[] | select(.name=="tamtham.com") | .id')
    if [ -z "$ZONE_ID" ]; then
        log_error "Could not find zone ID"
        exit 1
    fi
    log_success "Zone ID: $ZONE_ID"
}

check_dns_records() {
    log_info "Checking DNS records..."
    local records=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json")
    
    log_info "Current records:"
    echo "$records" | jq -r '.result[] | select(.name | contains("tamtham.com")) | "  \(.type) \(.name) -> \(.content) (\(.proxied))"'
    
    if echo "$records" | jq -r '.result[] | select(.name=="danny.tamtham.com") | .type' | grep -q "CNAME"; then
        log_success "Danny DNS record exists"
    else
        log_warn "Danny DNS record missing"
    fi
    
    if echo "$records" | jq -r '.result[] | select(.name=="helen.tamtham.com") | .type' | grep -q "CNAME"; then
        log_success "Helen DNS record exists"
    else
        log_warn "Helen DNS record missing"
    fi
}

create_dns_records() {
    log_info "Creating DNS records..."
    
    log_info "Creating danny.tamtham.com..."
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" \
        -d '{"type":"CNAME","name":"danny.tamtham.com","content":"tamtham-verify-danny.workers.dev","proxied":true,"ttl":1}' | \
        jq -r '.success' | grep -q "true" && log_success "Danny DNS created" || log_warn "Danny DNS may exist"
    
    log_info "Creating helen.tamtham.com..."
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" \
        -d '{"type":"CNAME","name":"helen.tamtham.com","content":"tamtham-verify-helen.workers.dev","proxied":true,"ttl":1}' | \
        jq -r '.success' | grep -q "true" && log_success "Helen DNS created" || log_warn "Helen DNS may exist"
}

check_workers() {
    log_info "Checking Workers..."
    
    if curl -s --max-time 5 "https://tamtham-verify-danny.workers.dev" > /dev/null 2>&1; then
        log_success "Danny Worker accessible"
    else
        log_warn "Danny Worker not accessible"
    fi
    
    if curl -s --max-time 5 "https://tamtham-verify-helen.workers.dev" > /dev/null 2>&1; then
        log_success "Helen Worker accessible"
    else
        log_warn "Helen Worker not accessible"
    fi
}

deploy_workers() {
    log_info "Deploying Workers..."
    
    cd src/api/verify-danny
    if command -v wrangler &> /dev/null; then
        npx wrangler deploy 2>&1 | tail -3
        log_success "Danny Worker deployed"
    else
        log_warn "Wrangler not installed: npm install -D wrangler"
    fi
    cd ../..
    
    cd src/api/verify-helen
    if command -v wrangler &> /dev/null; then
        npx wrangler deploy 2>&1 | tail -3
        log_success "Helen Worker deployed"
    else
        log_warn "Wrangler not installed: npm install -D wrangler"
    fi
    cd ../..
}

configure_routes() {
    log_info "Configuring routes..."
    
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/workers/routes" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" \
        -d '{"pattern":"danny.tamtham.com/*","script":"tamtham-verify-danny"}' | \
        jq -r '.success' | grep -q "true" && log_success "Danny route added" || log_warn "Danny route may exist"
    
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/workers/routes" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" \
        -d '{"pattern":"helen.tamtham.com/*","script":"tamtham-verify-helen"}' | \
        jq -r '.success' | grep -q "true" && log_success "Helen route added" || log_warn "Helen route may exist"
}

test_setup() {
    log_info "Testing setup..."
    
    local danny_ip=$(dig +short danny.tamtham.com 2>/dev/null | head -1)
    if [ -n "$danny_ip" ]; then
        log_success "danny.tamtham.com -> $danny_ip"
    else
        log_warn "danny.tamtham.com not resolved yet"
    fi
    
    local helen_ip=$(dig +short helen.tamtham.com 2>/dev/null | head -1)
    if [ -n "$helen_ip" ]; then
        log_success "helen.tamtham.com -> $helen_ip"
    else
        log_warn "helen.tamtham.com not resolved yet"
    fi
    
    if curl -s --max-time 5 "https://tamtham-verify-danny.workers.dev" > /dev/null 2>&1; then
        log_success "Danny Worker OK"
    else
        log_error "Danny Worker NOT accessible"
    fi
    
    if curl -s --max-time 5 "https://tamtham-verify-helen.workers.dev" > /dev/null 2>&1; then
        log_success "Helen Worker OK"
    else
        log_error "Helen Worker NOT accessible"
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  CLOUDFLARE SETUP TOOL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_prerequisites
get_zone_id
check_dns_records
check_workers

echo ""
echo "Options:"
echo "  1. Create DNS records"
echo "  2. Deploy Workers"
echo "  3. Configure routes"
echo "  4. Test setup"
echo "  5. Run all"
read -p "Select (1-5, default 5): " opt
opt=${opt:-5}

case $opt in
    1) create_dns_records ;;
    2) deploy_workers ;;
    3) configure_routes ;;
    4) test_setup ;;
    5)
        create_dns_records
        deploy_workers
        configure_routes
        test_setup
        ;;
    *) log_error "Invalid option" ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
