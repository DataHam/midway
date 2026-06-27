# Cloudflare Tunnel Setup

## Overview

This document describes the Cloudflare Tunnel configuration for the tamtham.com infrastructure.

## Credentials (from Doppler)

- **Project:** `tamtham-com`
- **Config:** `prd`
- **Token:** `TUNNEL_TOKEN`

## Tunnel Configuration

### Combined Tunnel

A single tunnel serves both subdomains:
- `danny.tamtham.com` → `http://localhost:8080`
- `helen.tamtham.com` → `http://localhost:8080`

### Config File

Location: `cloudflared-config.yml`

```yaml
tunnel: combined-tunnel
credentials-file: C:\Users\DannyTam-Tham\.cloudflared\cert\combined-tunnel.json

ingress:
  - hostname: danny.tamtham.com
    service: http://localhost:8080
    path: /
  - hostname: helen.tamtham.com
    service: http://localhost:8080
    path: /
  - service: http_status:404
```

## Setup Instructions

### Windows

1. **Install cloudflared:**
   ```powershell
   winget install cloudflare.cloudflared
   ```

2. **Set Tunnel Token:**
   ```powershell
   $env:TUNNEL_TOKEN = "<value-from-doppler>"
   ```

3. **Create Tunnel:**
   ```powershell
   cloudflared tunnel create combined-tunnel
   ```

4. **Run Tunnel:**
   ```powershell
   cloudflared tunnel run combined-tunnel
   ```

### Linux

1. **Install cloudflared:**
   ```bash
   curl -L --output cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
   chmod +x cloudflared
   sudo mv cloudflared /usr/local/bin/
   ```

2. **Create config file:**
   ```bash
   sudo mkdir -p /etc/cloudflared
   sudo tee /etc/cloudflared/config.yml > /dev/null << 'EOF'
tunnel: combined-tunnel
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: danny.tamtham.com
    service: http://localhost:8080
    path: /
  - hostname: helen.tamtham.com
    service: http://localhost:8080
    path: /
  - service: http_status:404
EOF
   ```

3. **Authenticate and run:**
   ```bash
   cloudflared tunnel login
   cloudflared tunnel run combined-tunnel
   ```

4. **Run as systemd service:**
   ```bash
   sudo cloudflared service install combined-tunnel
   sudo systemctl status cloudflared
   ```

## Verification

1. **Check tunnel status:**
   ```bash
   cloudflared tunnel list
   ```

2. **Check logs:**
   ```bash
   journalctl -u cloudflared -f
   # or on Windows:
   cloudflared tunnel logs combined-tunnel
   ```

3. **Test access:**
   ```bash
   curl -I https://danny.tamtham.com
   curl -I https://helen.tamtham.com
   ```

## Cloudflare Dashboard Configuration

1. **Navigate to:** Cloudflare Dashboard → Zero Trust → Tunnels
2. **Verify:** Tunnel `combined-tunnel` shows "Connected" status
3. **DNS:** Verify CNAME records are proxied (orange cloud)

## Troubleshooting

### Tunnel not connecting
- Verify `TUNNEL_TOKEN` is correct
- Check credentials file exists: `~/.cloudflared/cert/combined-tunnel.json`
- Ensure port `8080` is accessible on localhost

### DNS not resolving
- Verify nameservers are updated at domain registrar
- Wait for DNS propagation (5-30 minutes)
- Check Cloudflare Dashboard → DNS records

### 404 errors
- Verify ingress rules in config.yml
- Check tunnel is running and connected
- Review Cloudflare Workers logs
