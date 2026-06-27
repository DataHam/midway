# Cloudflare Tunnel Configuration Guide

## Phase 05-02: Cloudflare Infrastructure Setup

This document provides step-by-step instructions for creating and configuring Cloudflare Tunnels to securely expose localhost services via `danny.tamtham.com` and `helen.tamtham.com`.

---

## Overview

Cloudflare Tunnels create a secure outbound connection from your home server to Cloudflare's edge network, eliminating the need for port forwarding or public IP addresses. This guide covers:

- Tunnel creation in Cloudflare Dashboard
- `cloudflared` installation on Linux home server
- Authentication methods (credentials.json and TUNNEL_TOKEN)
- Configuration for multiple subdomains
- Systemd service setup for persistence
- Verification and troubleshooting

---

## Section 1: Create Tunnel in Cloudflare Dashboard

### Steps

1. **Navigate to Zero Trust Dashboard**
   - Visit: https://one.dash.cloudflare.com/
   - Sign in with your Cloudflare account
   - Select your organization (if multiple)

2. **Access Tunnels Section**
   - Click **"Networks"** in left sidebar
   - Select **"Tunnels"**

3. **Create New Tunnel**
   - Click **"Create a tunnel"** button

4. **Configure Tunnel Basics**
   - **Tunnel name:** `danny-tunnel` (or `combined-tunnel` for both subdomains)
   - **Deployment method:** Select **"Manual"**
     - Manual deployment gives full control over configuration
     - Suitable for home server setups
   - Click **"Next"**

5. **Copy Credentials**
   - Cloudflare will display credentials options:
     - **Option A:** Credentials JSON file (recommended)
     - **Option B:** TUNNEL_TOKEN
   - **Copy the credentials JSON** or **TUNNEL_TOKEN** to a secure location
   - Click **"Next"**

6. **Review and Create**
   - Review tunnel configuration
   - Click **"Save Tunnel"**

---

## Section 2: Install cloudflared on Home Server

### Prerequisites

- Linux server with root/sudo access
- curl installed
- systemd service manager (most modern Linux distributions)

### Installation Steps

#### Option A: Ubuntu/Debian

```bash
# Download cloudflared binary
curl -L --output cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64

# Make executable
chmod +x cloudflared

# Move to system path
sudo mv cloudflared /usr/local/bin/

# Verify installation
cloudflared --version
```

#### Option B: CentOS/RHEL

```bash
# Download cloudflared binary
curl -L --output cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64

# Make executable
chmod +x cloudflared

# Move to system path
sudo mv cloudflared /usr/local/bin/

# Install dependencies if needed
sudo yum install -y ca-certificates

# Verify installation
cloudflared --version
```

#### Option C: Using Package Manager (Debian/Ubuntu)

```bash
# Add Cloudflare package repository
curl -L https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /etc/apt/trusted.gpg.d/cloudflare-main.gpg >/dev/null
echo "deb [signed-by=/etc/apt/trusted.gpg.d/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -s -c) main" | sudo tee /etc/apt/sources.list.d/cloudflared.list

# Install cloudflared
sudo apt-get update
sudo apt-get install cloudflared

# Verify installation
cloudflared --version
```

---

## Section 3: Authenticate Tunnel

### Option A: Using Credentials File (Recommended)

This method uses a credentials JSON file stored locally on the server.

1. **Create Cloudflare Configuration Directory**
   ```bash
   mkdir -p ~/.cloudflared
   ```

2. **Run Login Command**
   ```bash
   cloudflared tunnel login
   ```

3. **Authenticate in Browser**
   - Browser window opens automatically
   - Sign in to Cloudflare account
   - Grant permissions
   - Close browser window

4. **Verify Credentials File**
   ```bash
   ls -la ~/.cloudflared/credentials.json
   ```

   The credentials file contains:
   - Account ID
   - Tunnel ID
   - Tunnel UUID
   - Secret key (base64 encoded)

5. **Secure Credentials File**
   ```bash
   chmod 600 ~/.cloudflared/credentials.json
   ```

### Option B: Using TUNNEL_TOKEN

This method uses a token string passed as an environment variable.

1. **Get Tunnel Token**
   - In Cloudflare Dashboard → Zero Trust → Tunnels
   - Click on your tunnel name
   - Click **"Edit"** → **"Authentication"**
   - Copy the **TUNNEL_TOKEN**

2. **Set Environment Variable**
   ```bash
   export TUNNEL_TOKEN="xxx-xxx-xxx-xxx-xxx"
   ```

3. **Create Tunnel (if not already created)**
   ```bash
   cloudflared tunnel create danny-tunnel
   ```

4. **Verify Token**
   ```bash
   cloudflared tunnel list
   ```

---

## Section 4: Configure Tunnel

### Directory Structure

```
/etc/cloudflared/
├── config.yml          # Tunnel configuration
└── credentials.json    # Auth credentials (if using Option A)
```

### Basic Configuration (Single Subdomain)

Create `/etc/cloudflared/config.yml`:

```yaml
tunnel: danny-tunnel
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: danny.tamtham.com
    service: http://localhost:8080
    path: /
  - service: http_status:404
```

**Configuration Explanation:**
- `tunnel`: Tunnel name (must match Cloudflare Dashboard)
- `credentials-file`: Path to credentials JSON file
- `ingress`: List of routing rules
  - `hostname`: Domain to route to this service
  - `service`: Backend service URL
  - `path`: URL path (optional, `/` matches all)
  - `http_status:404`: Catch-all for unmatched routes

### Combined Configuration (Both Subdomains)

For routing both `danny.tamtham.com` and `helen.tamtham.com` to the same service:

```yaml
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
```

### Advanced Configuration (Different Services)

If danny and helen run on different ports:

```yaml
tunnel: combined-tunnel
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: danny.tamtham.com
    service: http://localhost:8080
    path: /
  - hostname: helen.tamtham.com
    service: http://localhost:9090
    path: /
  - service: http_status:404
```

### Configuration with TLS Termination

For advanced setups with custom certificates:

```yaml
tunnel: combined-tunnel
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: danny.tamtham.com
    service: https://localhost:8080
    originRequest:
      noTLSVerify: false
      caCertificate: /etc/ssl/certs/custom-ca.pem
  - hostname: helen.tamtham.com
    service: https://localhost:9090
    originRequest:
      noTLSVerify: false
  - service: http_status:404
```

---

## Section 5: Run Tunnel as Systemd Service

### Create Service File

Create `/etc/systemd/system/cloudflared.service`:

```ini
[Unit]
Description=Cloudflare Tunnel
RequiresNetworkOnline.target
After=network-online.target

[Service]
Type=exec
User=www-data
Group=www-data
ExecStart=/usr/local/bin/cloudflared tunnel --config /etc/cloudflared/config.yml run
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**Service Configuration Explanation:**
- `User/Group`: Service runs as `www-data` (adjust for your system)
- `ExecStart`: Runs cloudflared with config file
- `Restart=on-failure`: Auto-restart on crashes
- `RestartSec=5`: Wait 5 seconds before restarting

### Alternative: Run as Root

If your service needs root privileges:

```ini
[Unit]
Description=Cloudflare Tunnel
RequiresNetworkOnline.target
After=network-online.target

[Service]
Type=exec
User=root
Group=root
ExecStart=/usr/local/bin/cloudflared tunnel --config /etc/cloudflared/config.yml run
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Alternative: Environment Variable Authentication

For TUNNEL_TOKEN authentication:

```ini
[Unit]
Description=Cloudflare Tunnel
RequiresNetworkOnline.target
After=network-online.target

[Service]
Type=exec
User=www-data
Group=www-data
Environment="TUNNEL_TOKEN=xxx-xxx-xxx-xxx-xxx"
ExecStart=/usr/local/bin/cloudflared tunnel run combined-tunnel
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Enable and Start Service

```bash
# Reload systemd to pick up new service
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable cloudflared

# Start the service
sudo systemctl start cloudflared

# Check service status
sudo systemctl status cloudflared

# View service logs
sudo journalctl -u cloudflared -f
```

---

## Section 6: Verification

### Check Tunnel Status

```bash
# List all tunnels
cloudflared tunnel list

# Expected output:
# NAME                 ID                                   STATUS
# combined-tunnel      xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx   connected
```

### Check Service Status

```bash
# Service status
sudo systemctl status cloudflared

# Expected output shows "active (running)"

# Service logs
sudo journalctl -u cloudflared -f

# Filter for recent logs only
sudo journalctl -u cloudflared -n 50
```

### Test Subdomain Access

```bash
# Test danny.tamtham.com
curl -I https://danny.tamtham.com

# Expected headers:
# HTTP/2 200
# server: cloudflare
# cf-ray: <ray-id>
# cf-cache-status: DYNAMIC

# Test helen.tamtham.com
curl -I https://helen.tamtham.com

# Expected same headers
```

### Verify SSL/TLS

```bash
# Check SSL certificate details
curl -vI https://danny.tamtham.com 2>&1 | grep -E "(subject|issuer|SSL)"

# Should show Cloudflare SSL certificate
# issuer: C=US, O=Cloudflare, Inc.
```

### Monitor Tunnel Health

```bash
# Check tunnel metrics (if metrics enabled)
curl http://localhost:8080/metrics

# View tunnel events
cloudflared tunnel events combined-tunnel
```

---

## Section 7: Troubleshooting

### Tunnel Not Connecting

**Issue:** Tunnel shows "disconnected" in dashboard

**Solutions:**
1. Check credentials file path matches config
2. Verify credentials file permissions (600)
3. Check firewall allows outbound HTTPS (port 443)
4. Verify tunnel name matches Cloudflare Dashboard
5. Check cloudflared logs: `sudo journalctl -u cloudflared -n 100`

### Service Won't Start

**Issue:** cloudflared service fails to start

**Solutions:**
1. Check config file syntax: `cat /etc/cloudflared/config.yml`
2. Verify credentials file exists: `ls -la ~/.cloudflared/credentials.json`
3. Test cloudflared manually: `sudo cloudflared tunnel run combined-tunnel`
4. Check systemd logs: `sudo journalctl -u cloudflared -xe`

### 502 Bad Gateway

**Issue:** Subdomain returns 502 error

**Solutions:**
1. Verify backend service is running on localhost:8080
2. Check service is accessible: `curl http://localhost:8080`
3. Verify ingress configuration matches backend port
4. Check firewall allows localhost connections

### Subdomain Not Resolving

**Issue:** DNS lookup fails for subdomain

**Solutions:**
1. Verify CNAME record exists in Cloudflare DNS
2. Check tunnel is "connected" in Cloudflare Dashboard
3. Wait for DNS propagation (typically minutes)
4. Test DNS: `nslookup danny.tamtham.com`

---

## Section 8: Security Best Practices

### Credentials Security

```bash
# Set restrictive permissions on credentials file
chmod 600 /etc/cloudflared/credentials.json
chown root:root /etc/cloudflared/credentials.json

# Or use environment variable instead of file
# Add to systemd service: Environment="TUNNEL_TOKEN=xxx"
```

### Network Security

1. **Firewall Configuration**
   ```bash
   # Only allow outbound HTTPS for cloudflared
   sudo ufw allow out 443/tcp
   sudo ufw allow out 80/tcp
   ```

2. **Service User**
   - Run cloudflared as non-root user
   - Use dedicated service account (www-data, cloudflared)

3. **TLS Configuration**
   - Use Cloudflare's managed certificates (default)
   - Enable HTTP/2 for better performance
   - Disable HTTP (force HTTPS)

### Monitoring

1. **Enable Metrics**
   ```yaml
   # Add to config.yml
   metrics:
     address: 127.0.0.1:8080
   ```

2. **Set Up Alerts**
   - Monitor Cloudflare Dashboard → Analytics → Tunnels
   - Set up uptime monitoring (UptimeRobot, StatusCake)
   - Configure email alerts for tunnel downtime

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `cloudflared tunnel list` | List all tunnels |
| `cloudflared tunnel login` | Authenticate with Cloudflare |
| `cloudflared tunnel run <name>` | Run tunnel manually |
| `systemctl status cloudflared` | Check service status |
| `journalctl -u cloudflared -f` | View live logs |
| `cloudflared tunnel create <name>` | Create new tunnel |

| Configuration | Value |
|---------------|-------|
| Tunnel Name | `danny-tunnel` or `combined-tunnel` |
| Credentials Path | `/etc/cloudflared/credentials.json` |
| Config Path | `/etc/cloudflared/config.yml` |
| Service Name | `cloudflared` |
| Service User | `www-data` or `root` |

---

## Next Steps

After tunnel configuration:

1. **Test Backend Services**
   - Ensure localhost:8080 is running your application
   - Verify services respond to HTTP requests

2. **Configure SSL**
   - Cloudflare handles SSL automatically
   - Verify HTTPS works: `curl -I https://danny.tamtham.com`

3. **Set Up Monitoring**
   - Configure uptime monitoring
   - Set up alerting for tunnel downtime

4. **Document Credentials**
   - Store credentials securely
   - Document tunnel configuration for team members

---

## Related Documentation

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [cloudflared GitHub Repository](https://github.com/cloudflare/cloudflared)
- [Systemd Service Guide](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
- [Cloudflare Zero Trust](https://www.cloudflare.com/zero-trust/)
