# Cloudflare Tunnel Setup Script (Windows PowerShell)
# Run this on your home server

$env:TUNNEL_TOKEN = "eyJhIjoiYzhiY2EyYzkyM2MxMWNlNzY4M2MzOGRkMWRiZGY2YmYiLCJ0IjoiYjUyZmVjM0QtZmZiYS00ZDVmLTk4YjgtODRmOGZhYmJQwMjc4IiwicyI6Ik56RmlZamc0WldVdFlqVW1OeTAwT1RBd0xXRXpZemd0TkROaU9UVTNPVEV5TmpFeCJ9"

# Create tunnel
cloudflared tunnel create combined-tunnel

# Run tunnel
cloudflared tunnel run combined-tunnel
