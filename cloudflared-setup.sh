# Cloudflare Tunnel Setup Script
# Run this on your home server (Windows/Linux)

# 1. Set Tunnel Token from Doppler
export TUNNEL_TOKEN="eyJhIjoiYzhiY2EyYzkyM2MxMWNlNzY4M2MzOGRkMWRiZGY2YmYiLCJ0IjoiYjUyZmVjM0QtZmZiYS00ZDVmLTk4YjgtODRmOGZhYmJQwMjc4IiwicyI6Ik56RmlZamc0WldVdFlqVW1OeTAwT1RBd0xXRXpZemd0TkROaU9UVTNPVEV5TmpFeCJ9"

# 2. Create Tunnel
cloudflared tunnel create combined-tunnel

# 3. Authenticate (optional if using token method)
cloudflared tunnel login

# 4. Save credentials (automatic after create)
# Credentials will be in: C:\Users\DannyTam-Tham\.cloudflared\cert\combined-tunnel.json

# 5. Run tunnel
cloudflared tunnel run combined-tunnel

# OR run as service (Linux):
# sudo cloudflared service install combined-tunnel
