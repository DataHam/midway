#!/bin/bash

# Cloudflare DNS Setup Script
# Configures subdomains to route to Cloudflare Workers

set -e

# Configuration
ZONE_ID="" # Get from: curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" https://api.cloudflare.com/client/v4/zones | jq -r '.result[] | select(.name=="tamtham.com") | .id'
API_TOKEN="" # Cloudflare API Token with Zone:Edit permissions
WORKER_DANNY="tamtham-verify-danny.workers.dev"
WORKER_HELEN="tamtham-verify-helen.workers.dev"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
        log_error "CLOUDFLARE_API_TOKEN environment variable not set"
        exit 1
    fi
    
    if [ -z "$ZONE_ID" ]; then
        log_error "ZONE_ID environment variable not set"
        exit 1
    fi
    
    # Test API connection
    log_info "Testing Cloudflare API connection..."
    if ! curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        "https://api.cloudflare.com/client/v4/zones/$ZONE_ID" > /dev/null; then
        log_error "Failed to authenticate with Cloudflare API"
        exit 1
    fi
    
    log_info "API connection successful"
}

# Get zone ID if not provided
get_zone_id() {
    log_info "Getting zone ID for tamtham.com..."
    ZONE_ID=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        "https://api.cloudflare.com/client/v4/zones" | \
        jq -r '.result[] | select(.name=="tamtham.com") | .id')
    
    if [ -z "$ZONE_ID" ]; then
        log_error "Could not find zone ID for tamtham.com"
        exit 1
    fi
    
    log_info "Zone ID: $ZONE_ID"
}

# Create CNAME record
create_dns_record() {
    local subdomain=$1
    local target=$2
    local record_type="CNAME"
    
    log_info "Creating $record_type record: $subdomain -> $target"
    
    local response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"type\": \"$record_type\",
            \"name\": \"$subdomain.tamtham.com\",
            \"content\": \"$target\",
            \"proxied\": true,
            \"ttl\": 1
        }")
    
    if echo "$response" | jq -r '.success' | grep -q "true"; then
        log_info "Successfully created DNS record for $subdomain.tamtham.com"
    else
        log_warn "Could not create DNS record: $response"
        log_warn "This may be because the record already exists"
    fi
}

# Delete existing record if it exists
delete_dns_record() {
    local subdomain=$1
    
    log_info "Checking for existing record: $subdomain.tamtham.com"
    
    local record_id=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" | \
        jq -r ".result[] | select(.name==\"$subdomain.tamtham.com\") | .id")
    
    if [ -n "$record_id" ] && [ "$record_id" != "null" ]; then
        log_info "Found existing record ID: $record_id"
        log_info "Deleting existing record..."
        
        curl -s -X DELETE "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$record_id" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" > /dev/null
        
        log_info "Deleted existing record"
    else
        log_info "No existing record found"
    fi
}

# Verify DNS record
verify_dns_record() {
    local subdomain=$1
    local expected_target=$2
    
    log_info "Verifying DNS record: $subdomain.tamtham.com"
    
    local record=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" | \
        jq -r ".result[] | select(.name==\"$subdomain.tamtham.com\")")
    
    if [ -z "$record" ] || [ "$record" == "null" ]; then
        log_error "DNS record not found for $subdomain.tamtham.com"
        return 1
    fi
    
    local actual_target=$(echo "$record" | jq -r '.content')
    
    if [ "$actual_target" == "$expected_target" ]; then
        log_info "DNS record verified: $subdomain.tamtham.com -> $actual_target"
        return 0
    else
        log_error "DNS record mismatch: expected $expected_target, got $actual_target"
        return 1
    fi
}

# Test Worker endpoint
test_worker() {
    local subdomain=$1
    local worker_url="https://${subdomain}.tamtham.com"
    
    log_info "Testing Worker endpoint: $worker_url"
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$worker_url")
    
    if [ "$response" == "200" ] || [ "$response" == "302" ]; then
        log_info "Worker responded with status: $response"
    else
        log_warn "Worker responded with status: $response (may take a moment to propagate)"
    fi
}

# Main execution
main() {
    log_info "Starting Cloudflare DNS setup for tamtham.com"
    
    # Get zone ID if not provided
    if [ -z "$ZONE_ID" ]; then
        get_zone_id
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Configure Danny subdomain
    log_info "=== Configuring danny.tamtham.com ==="
    delete_dns_record "danny"
    create_dns_record "danny" "$WORKER_DANNY"
    verify_dns_record "danny" "$WORKER_DANNY"
    test_worker "danny"
    
    # Configure Helen subdomain
    log_info "=== Configuring helen.tamtham.com ==="
    delete_dns_record "helen"
    create_dns_record "helen" "$WORKER_HELEN"
    verify_dns_record "helen" "$WORKER_HELEN"
    test_worker "helen"
    
    log_info "=== DNS Configuration Complete ==="
    log_info "DNS propagation may take up to 5 minutes"
    log_info "Test your subdomains:"
    log_info "  - https://danny.tamtham.com"
    log_info "  - https://helen.tamtham.com"
}

# Run main function
main "$@"
