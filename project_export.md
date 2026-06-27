# Calgary Stampede 2026 - Midway Food Map & PDF Showcase Project Export

This document compiles the complete plans, tasks, and codebase for the Calgary Stampede Midway Food showcase. It is designed to be fed directly to another LLM to recreate, modify, or extend the project.

---

## Part 1: Project Metadata & Workflow

### 1. Implementation Plan
```markdown
# Implementation Plan: GPS Tracking & Azure SWA Configuration

This plan details the implementation of real-time browser-based GPS tracking on the Midway Food Map and structures the project for deployment as an Azure Static Web App (SWA).

## Proposed Changes

### 1. Browser Geolocation (GPS Tracking)
We will add a geolocation control to the Leaflet map in `index.html`:
- **"Locate Me" Button**: A floating button on the map to trigger GPS tracking.
- **Pulsing Blue Dot**: A custom CSS-animated marker to show the user's real-time position.
- **Accuracy Halo**: A standard Leaflet circle around the user's location indicating GPS accuracy.
- **Distance Safety Check**: Calculate the distance from the user to Stampede Park. If the user is further than 5 km away, display a premium toast notification: *"You are X km away from Stampede Park. Auto-centering is disabled."* with a button to toggle between viewing themselves and viewing the Stampede Midway.

### 2. Azure Static Web Apps (SWA) Configuration
We will add `staticwebapp.config.json` in the root of the project:
- Configures default document to `index.html`.
- Enforces HTTPS redirection.
- Sets Cache-Control and security headers (CSP, X-Frame-Options, X-Content-Type-Options).

## Directory Structure

```
C:\Users\DannyTam-Tham\.gemini\antigravity\scratch\stampede_midway_pdf\
├── index.html                  # Standalone interactive map page with GPS tracking
├── staticwebapp.config.json    # Azure SWA configuration file
├── parse_food.py
├── download_images.py
├── create_pdf.py
├── embed_images.py
└── images/                     # Subfolder containing food images
```

## Verification Plan

### Manual Verification
- Open `index.html` in browser, verify the "Locate Me" button appears.
- Enable GPS tracking and verify that permissions are requested.
- Verify GPS location updates and that the user marker displays with a pulsing halo.
- Test the distance check using mock geolocation coordinates (simulating being outside Calgary).

```

### 2. Task Checklist
```markdown
# Tasks
- [x] Create project folder and download dependencies
- [x] Write Python parser to extract target food item details and image URLs
- [x] Run parser to extract data and download images
- [x] Implement ReportLab PDF generator script
- [x] Run PDF generator and output the final PDF document
- [x] Verify PDF contents and layout
- [x] Implement real-time GPS tracking on the interactive map
- [x] Configure for Azure Static Web Apps deployment
- [x] Export all project assets and codebases to project_export.md

```

### 3. Change Walkthrough
```markdown
# Walkthrough - Calgary Stampede 2026 Midway Food PDF Generator

We have successfully scraped the details and images for the 10 target food items from the Calgary Stampede webpage and generated a high-quality PDF document containing them.

## Files Generated
- **Showcase PDF**: [midway_food_details.pdf](file:///C:/Users/DannyTam-Tham/.gemini/antigravity/brain/5340ff15-f7e1-42af-9339-0b73c897890b/midway_food_details.pdf)
- **Interactive Map**: [index.html](file:///C:/Users/DannyTam-Tham/.gemini/antigravity/brain/5340ff15-f7e1-42af-9339-0b73c897890b/index.html) (Open in browser to see the interactive map of Stampede Park overlays!)

## PDF Layout Preview

Here is a visual preview of the generated document pages (Cover page followed by the first two food item pages):

````carousel
![Cover Page](C:/Users/DannyTam-Tham/.gemini/antigravity/brain/5340ff15-f7e1-42af-9339-0b73c897890b/page_1.png)
<!-- slide -->
![Page 2 - Buldak Stuffed Grilled Cheese](C:/Users/DannyTam-Tham/.gemini/antigravity/brain/5340ff15-f7e1-42af-9339-0b73c897890b/page_2.png)
<!-- slide -->
![Page 3 - Blue Coconut Cloud Matcha](C:/Users/DannyTam-Tham/.gemini/antigravity/brain/5340ff15-f7e1-42af-9339-0b73c897890b/page_3.png)
````

---

## Technical Details

We completed the following steps:
1. **Web Scraper & Parser (`parse_food.py`)**:
   - Downloads the Stampede New Midway Food page.
   - Extracts food items matching standard listings and special column sections.
   - Filters the parsed list of 68 items down to the 10 target food items.
   - Generates [matched_items.json](file:///C:/Users/DannyTam-Tham/.gemini/antigravity/scratch/stampede_midway_pdf/matched_items.json) with descriptions, booths, and image URLs.
2. **Image Downloader (`download_images.py`)**:
   - Downloads the high-resolution images for each target item and saves them to the local `images/` directory.
   - Keeps track of file formats (`.png`, `.jpg`) and handles request headers defensively.
3. **ReportLab PDF Compiler (`create_pdf.py`)**:
   - Creates a premium 11-page layout.
   - Features custom brand colors: **Stampede Deep Red (`#A6192E`)**, **Accent Gold (`#FFBF00`)**, and charcoal text.
   - Scales images dynamically using PIL/Pillow to maintain aspect ratio and fit standard letter margins.
   - Utilizes a custom multi-pass canvas (`NumberedCanvas`) to calculate total pages dynamically and insert headers and page numbers on non-cover pages.
4. **PDF Exporter (`convert_pdf.py`)**:
   - Copies the generated PDF into the artifact folder.
   - Uses PyMuPDF to export the first 3 pages of the document as high-resolution PNGs for embedding.
5. **Interactive Map overlay (`index.html` & `match_map_locations.py`)**:
   - Fetches the Calgary Stampede interactive map page raw state (`__NEXT_DATA__` JSON payload) to retrieve coordinates and vendor details for 282 points of interest.
   - Correlates the 10 food items against the map locations by vendor name and booth number.
   - For items with missing or mismatched database entries, interpolates locations based on adjacent booth sequences.
   - Generates a standalone interactive map using Leaflet.js with layered Esri Hybrid Satellite and CartoDB Dark Matter views, featuring clickable pins, thumbnail details, search filtering, and fly-to transitions.


```

---

## Part 2: Configurations

### 1. Azure Static Web Apps (SWA) Configuration (`staticwebapp.config.json`)
```json
{
  "trailingSlash": "auto",
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif}", "/css/*", "/js/*"]
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  },
  "globalHeaders": {
    "content-security-policy": "default-src 'self' https://unpkg.com https://server.arcgisonline.com https://*.basemaps.cartocdn.com https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; img-src 'self' data: https://unpkg.com https://server.arcgisonline.com https://*.basemaps.cartocdn.com tile.openstreetmap.org; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' https://unpkg.com; frame-ancestors 'none';",
    "x-frame-options": "DENY",
    "x-content-type-options": "nosniff",
    "x-xss-protection": "1; mode=block",
    "referrer-policy": "no-referrer-when-downgrade",
    "cache-control": "public, max-age=86400"
  },
  "mimeTypes": {
    ".html": "text/html; charset=utf-8"
  }
}

```

---

## Part 3: Client-Side Interactive Map Template (`index.html`)

This HTML file integrates Leaflet.js with real-time GPS tracking (HTML5 Geolocation API), custom user pulsing dot, distance calculations, search filtering, and layered street/satellite map views.
*(Note: The `foodItems` array has been emptied in this listing. Run the `embed_images.py` build script to populate it with Base64 image data URLs).*

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calgary Stampede 2026 - Midway Food Map</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossorigin=""/>
          
    <style>
        :root {
            --primary: #A6192E; /* Stampede Red */
            --primary-light: #C4263F;
            --accent: #FFBF00; /* Stampede Gold */
            --bg-dark: #121212;
            --bg-card: rgba(28, 28, 28, 0.85);
            --bg-sidebar: rgba(18, 18, 18, 0.95);
            --text-main: #FFFFFF;
            --text-muted: #B3B3B3;
            --border: rgba(255, 255, 255, 0.1);
            --shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Outfit', sans-serif;
            -webkit-font-smoothing: antialiased;
        }

        body {
            background-color: var(--bg-dark);
            color: var(--text-main);
            height: 100vh;
            display: flex;
            overflow: hidden;
        }

        /* Sidebar Styling */
        #sidebar {
            width: 420px;
            background-color: var(--bg-sidebar);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            height: 100%;
            z-index: 1000;
            box-shadow: 5px 0 25px rgba(0,0,0,0.5);
            backdrop-filter: blur(10px);
        }

        .sidebar-header {
            padding: 24px;
            border-bottom: 1px solid var(--border);
            background: linear-gradient(135deg, rgba(166, 25, 46, 0.2) 0%, rgba(18, 18, 18, 0) 100%);
        }

        .sidebar-header h1 {
            font-family: 'Montserrat', sans-serif;
            font-weight: 800;
            font-size: 22px;
            letter-spacing: 1px;
            color: var(--text-main);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .sidebar-header h1 span {
            color: var(--primary);
        }

        .sidebar-header p {
            font-size: 13px;
            color: var(--text-muted);
            margin-top: 4px;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 600;
        }

        .gold-divider {
            height: 3px;
            background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
            margin-top: 12px;
            border-radius: 2px;
        }

        /* Search area */
        .search-container {
            padding: 16px 24px;
            border-bottom: 1px solid var(--border);
        }

        .search-box {
            width: 100%;
            padding: 12px 16px;
            background-color: rgba(255,255,255,0.05);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: white;
            font-size: 14px;
            outline: none;
            transition: all 0.3s ease;
        }

        .search-box:focus {
            border-color: var(--accent);
            background-color: rgba(255,255,255,0.08);
            box-shadow: 0 0 0 2px rgba(255, 191, 0, 0.2);
        }

        /* Item List container */
        .item-list {
            flex: 1;
            overflow-y: auto;
            padding: 16px 24px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        /* Scrollbar styling */
        .item-list::-webkit-scrollbar {
            width: 6px;
        }
        .item-list::-webkit-scrollbar-track {
            background: transparent;
        }
        .item-list::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }
        .item-list::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.25);
        }

        /* Food Card */
        .food-card {
            background-color: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 12px;
            cursor: pointer;
            display: flex;
            gap: 12px;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            overflow: hidden;
        }

        .food-card:hover {
            transform: translateY(-2px);
            border-color: rgba(255, 191, 0, 0.4);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            background-color: rgba(38, 38, 38, 0.95);
        }

        .food-card.active {
            border-color: var(--accent);
            background-color: rgba(166, 25, 46, 0.15);
            box-shadow: 0 0 15px rgba(166, 25, 46, 0.2);
        }

        .food-card.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background-color: var(--accent);
        }

        .card-img-container {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            overflow: hidden;
            flex-shrink: 0;
            background-color: #2a2a2a;
            border: 1px solid rgba(255,255,255,0.05);
        }

        .card-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }

        .food-card:hover .card-img {
            transform: scale(1.1);
        }

        .card-content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            min-width: 0;
        }

        .card-title {
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
            font-size: 14px;
            line-height: 1.3;
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .card-booth {
            font-size: 11px;
            color: var(--accent);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }

        .card-vendor {
            font-size: 12px;
            color: var(--text-muted);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* Map Container */
        #map-container {
            flex: 1;
            height: 100%;
            position: relative;
        }

        #map {
            width: 100%;
            height: 100%;
        }

        /* Leaflet Popups Custom Style */
        .leaflet-popup-content-wrapper {
            background-color: var(--bg-sidebar) !important;
            color: white !important;
            border-radius: 12px !important;
            border: 1px solid var(--border) !important;
            box-shadow: var(--shadow) !important;
            backdrop-filter: blur(8px);
            padding: 0 !important;
            overflow: hidden;
        }

        .leaflet-popup-content {
            margin: 0 !important;
            width: 280px !important;
        }

        .leaflet-popup-tip {
            background-color: var(--bg-sidebar) !important;
            border: 1px solid var(--border) !important;
        }

        .popup-header {
            padding: 12px 16px;
            background-color: rgba(166, 25, 46, 0.2);
            border-bottom: 1px solid var(--border);
        }

        .popup-header h3 {
            font-family: 'Montserrat', sans-serif;
            font-weight: 700;
            font-size: 15px;
            margin: 0;
            color: white;
        }

        .popup-header span {
            font-size: 11px;
            color: var(--accent);
            text-transform: uppercase;
            font-weight: 600;
            display: block;
            margin-top: 2px;
        }

        .popup-body {
            padding: 16px;
        }

        .popup-img {
            width: 100%;
            height: 130px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 12px;
            border: 1px solid rgba(255,255,255,0.05);
        }

        .popup-desc {
            font-size: 12px;
            color: var(--text-muted);
            line-height: 1.5;
            text-align: justify;
        }

        /* Custom SVG Marker Icon */
        .custom-marker {
            background: none;
            border: none;
        }

        .marker-icon-wrapper {
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            background: var(--primary);
            border: 2px solid white;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            transition: all 0.3s ease;
        }

        .marker-icon-wrapper:hover, .marker-icon-wrapper.active {
            background: var(--accent);
            transform: rotate(-45deg) scale(1.15);
            box-shadow: 0 6px 15px rgba(255, 191, 0, 0.4);
        }

        .marker-number {
            color: white;
            font-family: 'Montserrat', sans-serif;
            font-weight: 700;
            font-size: 12px;
            transform: rotate(45deg);
        }

        /* GPS Pulse User Marker */
        .user-location-marker {
            background: none;
            border: none;
        }
        
        .user-dot {
            width: 14px;
            height: 14px;
            background-color: #007AFF; /* Apple Blue */
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(0, 122, 255, 0.6);
            position: relative;
        }
        
        .user-dot::after {
            content: '';
            width: 30px;
            height: 30px;
            background-color: rgba(0, 122, 255, 0.3);
            border-radius: 50%;
            position: absolute;
            top: -10px;
            left: -10px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% {
                transform: scale(0.5);
                opacity: 1;
            }
            100% {
                transform: scale(1.5);
                opacity: 0;
            }
        }
        
        /* Floating Locate Button */
        #locate-btn {
            position: absolute;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            padding: 12px 20px;
            background-color: var(--primary);
            border: 2px solid white;
            border-radius: 30px;
            font-family: 'Montserrat', sans-serif;
            font-weight: 700;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        
        #locate-btn:hover {
            background-color: var(--accent);
            color: black;
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(255, 191, 0, 0.4);
        }
        
        #locate-btn.active {
            background-color: #28a745; /* Success Green */
            color: white;
        }
    </style>
</head>
<body>

    <!-- Sidebar -->
    <div id="sidebar">
        <div class="sidebar-header">
            <h1>CS <span>2026</span></h1>
            <p>Midway Culinary Map</p>
            <div class="gold-divider"></div>
        </div>
        
        <div class="search-container">
            <input type="text" class="search-box" id="search" placeholder="Search food items or booths...">
        </div>
        
        <div class="item-list" id="list">
            <!-- List items dynamically generated -->
        </div>
    </div>
    
    <!-- Map -->
    <div id="map-container">
        <div id="map"></div>
        <button id="locate-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
            Locate Me
        </button>
    </div>

    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            crossorigin=""></script>
            
    <script>
        // Food items placeholder (populated by build script)
        const foodItems = [
            // NOTE: This array is populated with base64 data URLs by the embed_images.py script.
            // The structure of each item in the array is as follows:
            // {
            //   "id": 1,
            //   "title": "Buldak Stuffed Grilled Cheese",
            //   "booth": "Booth #2043",
            //   "vendor": "Melt Town Grilled Cheese",
            //   "description": "Sweet, spicy...",
            //   "coords": {"lat": 51.0358827, "lng": -114.0575063},
            //   "image": "data:image/png;base64,iVBORw0KG..."
            // }
        ];

        // Initialize Map
        const map = L.map('map', {
            center: [51.0368, -114.0550],
            zoom: 17,
            minZoom: 15,
            maxZoom: 19
        });

        // Map styles
        const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });

        const darkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{y}/{x}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd'
        });

        satellite.addTo(map);

        const baseLayers = {
            "Satellite View (Hybrid)": satellite,
            "Sleek Dark Theme": darkMatter
        };
        L.control.layers(baseLayers, null, { position: 'topright' }).addTo(map);

        const markers = {};
        let activeCardId = null;

        // Render List and Markers
        function renderItems(itemsToRender) {
            const listContainer = document.getElementById('list');
            listContainer.innerHTML = '';

            for (let id in markers) {
                map.removeLayer(markers[id]);
            }

            itemsToRender.forEach((item) => {
                const card = document.createElement('div');
                card.className = `food-card ${activeCardId === item.id ? 'active' : ''}`;
                card.setAttribute('data-id', item.id);
                card.innerHTML = `
                    <div class="card-img-container">
                        <img class="card-img" src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="card-content">
                        <span class="card-booth">${item.booth}</span>
                        <h3 class="card-title">${item.title}</h3>
                        <p class="card-vendor">${item.vendor}</p>
                    </div>
                `;

                card.addEventListener('click', () => {
                    selectItem(item.id, true);
                });

                listContainer.appendChild(card);

                const customIcon = L.divIcon({
                    className: 'custom-marker',
                    html: `<div class="marker-icon-wrapper" id="marker-wrapper-${item.id}">
                             <span class="marker-number">${item.id}</span>
                           </div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                });

                const popupHTML = `
                    <div class="popup-header">
                        <span>${item.booth} &bull; ${item.vendor}</span>
                        <h3>${item.title}</h3>
                    </div>
                    <div class="popup-body">
                        <img class="popup-img" src="${item.image}" alt="${item.title}">
                        <p class="popup-desc">${item.description}</p>
                    </div>
                `;

                const marker = L.marker([item.coords.lat, item.coords.lng], { icon: customIcon })
                    .bindPopup(popupHTML)
                    .addTo(map);

                marker.on('click', () => {
                    selectItem(item.id, false);
                });

                markers[item.id] = marker;
            });
        }

        function selectItem(id, zoomTo) {
            if (activeCardId) {
                const prevActive = document.querySelector(`.food-card[data-id="${activeCardId}"]`);
                if (prevActive) prevActive.classList.remove('active');
                
                const prevMarker = document.getElementById(`marker-wrapper-${activeCardId}`);
                if (prevMarker) prevMarker.classList.remove('active');
            }

            activeCardId = id;
            
            const newActive = document.querySelector(`.food-card[data-id="${id}"]`);
            if (newActive) {
                newActive.classList.add('active');
                newActive.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            const newMarker = document.getElementById(`marker-wrapper-${id}`);
            if (newMarker) newMarker.classList.add('active');

            const item = foodItems.find(f => f.id === id);
            
            if (zoomTo && item) {
                map.setView([item.coords.lat, item.coords.lng], 18, { animate: true });
                markers[id].openPopup();
            }
        }

        const searchInput = document.getElementById('search');
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = foodItems.filter(item => 
                item.title.toLowerCase().includes(query) ||
                item.vendor.toLowerCase().includes(query) ||
                item.booth.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );
            renderItems(filtered);
        });

        // Geolocation / GPS Live Tracking System
        let userMarker = null;
        let userAccuracyCircle = null;
        let watchId = null;
        let isFollowingUser = false;

        const locateBtn = document.getElementById('locate-btn');

        locateBtn.addEventListener('click', () => {
            if (watchId !== null) {
                // Stop tracking
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
                isFollowingUser = false;
                locateBtn.classList.remove('active');
                locateBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                    Locate Me
                `;
                if (userMarker) map.removeLayer(userMarker);
                if (userAccuracyCircle) map.removeLayer(userAccuracyCircle);
                userMarker = null;
                userAccuracyCircle = null;
                showToast("GPS Tracking disabled.");
            } else {
                // Start tracking
                if (!navigator.geolocation) {
                    alert("Geolocation is not supported by your browser.");
                    return;
                }
                
                locateBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                    Tracking...
                `;
                
                watchId = navigator.geolocation.watchPosition(onLocationSuccess, onLocationError, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            }
        });

        function onLocationSuccess(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            const userCoords = L.latLng(lat, lng);
            const stampedeCenter = L.latLng(51.0368, -114.0550);
            
            // Calculate distance using Leaflet's built-in formula
            const distanceMeters = userCoords.distanceTo(stampedeCenter);
            const distanceKm = (distanceMeters / 1000).toFixed(2);
            
            locateBtn.classList.add('active');
            locateBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                Tracking On
            `;
            
            const userIcon = L.divIcon({
                className: 'user-location-marker',
                html: `<div class="user-dot"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            });
            
            if (userMarker) {
                userMarker.setLatLng(userCoords);
                userAccuracyCircle.setLatLng(userCoords).setRadius(accuracy);
            } else {
                userMarker = L.marker(userCoords, { icon: userIcon }).addTo(map)
                    .bindPopup("<b>Your Location</b><br>Accuracy: " + accuracy.toFixed(0) + "m");
                userAccuracyCircle = L.circle(userCoords, {
                    radius: accuracy,
                    color: '#007AFF',
                    fillColor: '#007AFF',
                    fillOpacity: 0.1,
                    weight: 1
                }).addTo(map);
                
                // If the user is far away (more than 5km), warn them and show bounds
                if (distanceKm > 5.0) {
                    showToast(`You are ${distanceKm} km away from Stampede Park! Auto-follow disabled to keep Midway visible.`);
                    const bounds = L.latLngBounds([userCoords, stampedeCenter]);
                    map.fitBounds(bounds, { padding: [50, 50] });
                } else {
                    showToast(`GPS Connected! You are ${distanceKm} km from the Midway foods.`);
                    map.setView(userCoords, 18, { animate: true });
                    isFollowingUser = true;
                }
            }
            
            if (isFollowingUser && distanceKm <= 5.0) {
                map.setView(userCoords, map.getZoom(), { animate: true });
            }
        }

        function onLocationError(error) {
            console.error("GPS Error: ", error);
            showToast("GPS Error: " + error.message);
            locateBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                Locate Me
            `;
            locateBtn.classList.remove('active');
            watchId = null;
        }

        // Custom Toast Notification System
        function showToast(message) {
            let toast = document.getElementById('toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'toast';
                toast.style.position = 'absolute';
                toast.style.bottom = '80px';
                toast.style.left = '50%';
                toast.style.transform = 'translateX(-50%)';
                toast.style.backgroundColor = 'rgba(18, 18, 18, 0.9)';
                toast.style.color = 'white';
                toast.style.padding = '12px 24px';
                toast.style.borderRadius = '30px';
                toast.style.fontSize = '13px';
                toast.style.fontWeight = '600';
                toast.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)';
                toast.style.border = '1px solid rgba(255,255,255,0.1)';
                toast.style.zIndex = '2000';
                toast.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                toast.style.textAlign = 'center';
                toast.style.maxWidth = '90%';
                document.body.appendChild(toast);
            }
            toast.innerText = message;
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(-50%) translateY(10px)';
            }, 5000);
        }

        // Populated dynamically on build
        renderItems(foodItems);
    </script>
</body>
</html>

```

---

## Part 4: Python Pipeline Codebase

These python scripts perform the web scraping, data extraction, image downloading, ReportLab PDF compilation, and Base64 embedding.

### 1. Concession Parser (`parse_food.py`)
```python
import json
import re
from bs4 import BeautifulSoup

# Targets to capture (case-insensitive search)
TARGETS = [
    "Buldak Stuffed Grilled Cheese",
    "Blue Coconut Cloud Matcha",
    "Amsterdam Cone Fries",
    "The Cheesy Saddle Slice",
    "Deep Fried Street Corn",
    "Dunkaroo Iced Latte",
    "Garlic Parm Twisted Pickle",
    "Maki Sushi Corn Dog",
    "Potato Sago Spiral - With Loaded Tex-Mex Edition",
    "Ramen Donut"
]

def clean_text(text):
    if not text:
        return ""
    # Normalize whitespaces
    return re.sub(r'\s+', ' ', text).strip()

def parse_html_file(file_path):
    print(f"Reading {file_path}...")
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Split content by front matter separator '---' to get raw HTML in line 9
    parts = content.split("---", 1)
    html_content = parts[1] if len(parts) > 1 else content
    
    soup = BeautifulSoup(html_content, "html.parser")
    
    parsed_items = []
    
    # 1. Parse standard listings
    listings = soup.find_all(class_="listing")
    print(f"Found {len(listings)} standard listings in HTML.")
    for listing in listings:
        title_el = listing.find(class_="listing__title")
        if not title_el:
            continue
        title = clean_text(title_el.text)
        
        tag_el = listing.find(class_="listing__tag")
        booth = clean_text(tag_el.text) if tag_el else ""
        
        desc_el = listing.find("p")
        description = clean_text(desc_el.text) if desc_el else ""
        
        # Get image source
        img_el = listing.find("img")
        img_url = img_el.get("src") if img_el else ""
        if img_url and img_url.startswith("/"):
            img_url = "https://www.calgarystampede.com" + img_url
            
        parsed_items.append({
            "title": title,
            "booth": booth,
            "description": description,
            "image_url": img_url,
            "source": "listing"
        })
        
    # 2. Parse columns-two (special features like The Cheesy Saddle Slice)
    columns_two = soup.find_all(class_=lambda x: x and "columns-two" in x)
    print(f"Found {len(columns_two)} column sections.")
    for section in columns_two:
        title_el = section.find(class_="section-title")
        if not title_el:
            continue
        title = clean_text(title_el.text)
        
        sub_el = section.find(class_="section-subheading")
        booth = clean_text(sub_el.text) if sub_el else ""
        
        # Check all paragraphs in the column with text
        # Usually description is in a sibling paragraph or in the right-hand column richtext
        richtext = section.find(class_="richtext")
        if richtext:
            p_tags = richtext.find_all("p")
            # Filter out the subheading if it's there
            desc_paras = [clean_text(p.text) for p in p_tags if "section-subheading" not in p.get("class", [])]
            description = " ".join(desc_paras)
        else:
            description = ""
            
        img_el = section.find("img")
        img_url = img_el.get("src") if img_el else ""
        if img_url and img_url.startswith("/"):
            img_url = "https://www.calgarystampede.com" + img_url
            
        parsed_items.append({
            "title": title,
            "booth": booth,
            "description": description,
            "image_url": img_url,
            "source": "column"
        })
        
    return parsed_items

def match_targets(parsed_items):
    matched_results = []
    unmatched_targets = set(TARGETS)
    
    # We will do a case-insensitive search
    for target in TARGETS:
        target_norm = clean_text(target).lower()
        # Find exact or close matches
        match = None
        for item in parsed_items:
            item_title_norm = item["title"].lower()
            if target_norm in item_title_norm or item_title_norm in target_norm:
                match = item
                break
        
        if match:
            # If loaded sago spiral tex-mex is matched, let's keep original target title if it fits
            matched_results.append({
                "target_title": target,
                "scraped_title": match["title"],
                "booth": match["booth"],
                "description": match["description"],
                "image_url": match["image_url"]
            })
            unmatched_targets.remove(target)
            
    print(f"Matched {len(matched_results)} out of {len(TARGETS)} items.")
    if unmatched_targets:
        print("Unmatched targets:")
        for t in unmatched_targets:
            print(f" - {t}")
            
    return matched_results

def main():
    content_file = "raw_page.html"
    parsed = parse_html_file(content_file)
    
    # Let's write all parsed to a temporary json to debug if needed
    with open("all_parsed_items.json", "w", encoding="utf-8") as f:
        json.dump(parsed, f, indent=2)
        
    matched = match_targets(parsed)
    with open("matched_items.json", "w", encoding="utf-8") as f:
        json.dump(matched, f, indent=2)
    print("Saved matched items to matched_items.json")

if __name__ == "__main__":
    main()

```

### 2. Image Downloader (`download_images.py`)
```python
import os
import json
import requests

def download_images():
    # Create images directory
    os.makedirs("images", exist_ok=True)
    
    with open("matched_items.json", "r", encoding="utf-8") as f:
        items = json.load(f)
        
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    print(f"Starting download of {len(items)} images...")
    
    for idx, item in enumerate(items):
        title = item["target_title"]
        url = item["image_url"]
        
        # Clean title for filename
        clean_title = "".join(c for c in title if c.isalnum() or c in (" ", "_", "-")).strip()
        clean_title = clean_title.replace(" ", "_").lower()
        
        # Get extension
        ext = ".jpg"
        if "?" in url:
            base_url = url.split("?")[0]
        else:
            base_url = url
            
        if base_url.lower().endswith(".png"):
            ext = ".png"
        elif base_url.lower().endswith(".jpeg") or base_url.lower().endswith(".jpg"):
            ext = ".jpg"
        elif base_url.lower().endswith(".gif"):
            ext = ".gif"
            
        filename = f"{clean_title}{ext}"
        filepath = os.path.join("images", filename)
        
        print(f"({idx+1}/{len(items)}) Downloading {title} from {url}...")
        try:
            response = requests.get(url, headers=headers, timeout=15)
            if response.status_code == 200:
                with open(filepath, "wb") as img_file:
                    img_file.write(response.content)
                item["local_image_path"] = filepath
                print(f"Saved to {filepath}")
            else:
                print(f"Failed to download. Status code: {response.status_code}")
                item["local_image_path"] = None
        except Exception as e:
            print(f"Error downloading {title}: {e}")
            item["local_image_path"] = None
            
    # Save back matched_items.json with local_image_path
    with open("matched_items.json", "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2)
    print("Updated matched_items.json with local image paths.")

if __name__ == "__main__":
    download_images()

```

### 3. ReportLab PDF Compiler (`create_pdf.py`)
```python
import os
import json
from datetime import datetime
from PIL import Image as PILImage

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    A canvas that enables two-pass page numbering to display
    'Page X of Y' in the footer, and draws headers/footers on non-cover pages.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_decorations(self, page_count):
        self.saveState()
        
        # We suppress headers and footers on the cover page (page 1)
        if self._pageNumber > 1:
            # Running Header
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor('#A6192E')) # Deep Stampede Red
            self.drawString(54, 750, "CALGARY STAMPEDE 2026")
            
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor('#4A4A4A'))
            self.drawRightString(612 - 54, 750, "NEW MIDWAY FOODS SHOWCASE")
            
            # Header line
            self.setStrokeColor(colors.HexColor('#D3D3D3'))
            self.setLineWidth(0.5)
            self.line(54, 742, 612 - 54, 742)
            
            # Footer line
            self.line(54, 55, 612 - 54, 55)
            
            # Footer
            self.drawString(54, 40, "Official Midway Culinary Guide")
            
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(612 - 54, 40, page_text)
            
        self.restoreState()

def get_image_flowable(local_path, max_width=450, max_height=260):
    """
    Safely opens an image and rescales it to fit the layout bounds
    without stretching, preserving the original aspect ratio.
    """
    if not local_path or not os.path.exists(local_path):
        return Paragraph(
            "<font color='red'>[Image not found]</font>", 
            ParagraphStyle("Err", fontName="Helvetica", fontSize=10)
        )
    
    try:
        with PILImage.open(local_path) as img:
            w, h = img.size
        
        aspect = w / h
        if aspect > (max_width / max_height):
            # Width limited
            width = max_width
            height = max_width / aspect
        else:
            # Height limited
            height = max_height
            width = max_height * aspect
            
        return Image(local_path, width=width, height=height)
    except Exception as e:
        print(f"Error loading image {local_path}: {e}")
        return Paragraph(
            f"<font color='red'>[Error loading image: {str(e)}]</font>", 
            ParagraphStyle("Err", fontName="Helvetica", fontSize=10)
        )

def build_pdf():
    pdf_filename = "midway_food_details.pdf"
    print(f"Generating PDF: {pdf_filename}...")
    
    # Load items data
    with open("matched_items.json", "r", encoding="utf-8") as f:
        items = json.load(f)
        
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=72,  # Give space below header
        bottomMargin=72  # Give space above footer
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        "CoverTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=32,
        leading=38,
        textColor=colors.white,
        alignment=1 # Center
    )
    
    subtitle_style = ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#FFBF00'), # Gold
        alignment=1 # Center
    )
    
    cover_desc_style = ParagraphStyle(
        "CoverDesc",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12,
        leading=18,
        textColor=colors.HexColor('#1A1A1A'),
        alignment=1 # Center
    )
    
    meta_label_style = ParagraphStyle(
        "MetaLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#4A4A4A'),
        alignment=1 # Center
    )
    
    meta_val_style = ParagraphStyle(
        "MetaVal",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1A1A1A'),
        alignment=1 # Center
    )
    
    food_title_style = ParagraphStyle(
        "FoodTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#A6192E'), # Deep Red
        alignment=0 # Left
    )
    
    food_booth_style = ParagraphStyle(
        "FoodBooth",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#4A4A4A'),
        alignment=0 # Left
    )
    
    food_desc_style = ParagraphStyle(
        "FoodDesc",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=16,
        textColor=colors.HexColor('#1A1A1A'),
        alignment=4 # Justified
    )
    
    story = []
    
    # ------------------ COVER PAGE ------------------
    story.append(Spacer(1, 40))
    
    # Header Banner block
    banner_data = [
        [Paragraph("CALGARY STAMPEDE 2026", title_style)],
        [Paragraph("NEW MIDWAY FOODS GUIDE", subtitle_style)]
    ]
    banner_table = Table(banner_data, colWidths=[504])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#A6192E')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (0,0), 30),
        ('BOTTOMPADDING', (0,0), (0,0), 5),
        ('TOPPADDING', (0,1), (0,1), 5),
        ('BOTTOMPADDING', (0,1), (0,1), 30),
        ('LEFTPADDING', (0,0), (-1,-1), 15),
        ('RIGHTPADDING', (0,0), (-1,-1), 15),
    ]))
    story.append(banner_table)
    
    # Gold separator line below banner
    gold_bar = Table([['']], colWidths=[504], rowHeights=[6])
    gold_bar.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FFBF00')),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(gold_bar)
    
    story.append(Spacer(1, 40))
    
    # Cover description text
    cover_desc_text = (
        "An exclusive culinary showcase of the most creative, bold, and delicious food items "
        "featured on the Midway for the 2026 Calgary Stampede. This guide details 10 highly-anticipated "
        "creations, from spicy fusion snacks to sweet nostalgic beverages. Prepared for guests "
        "looking to experience the absolute best of the Stampede Midway."
    )
    story.append(Paragraph(cover_desc_text, cover_desc_style))
    
    story.append(Spacer(1, 100))
    
    # Meta / Info Box at bottom of cover
    today_str = datetime.now().strftime("%B %d, %Y")
    meta_data = [
        [Paragraph("EVENT DATES", meta_label_style), Paragraph("July 3 - 12, 2026", meta_val_style)],
        [Paragraph("LOCATION", meta_label_style), Paragraph("Stampede Park, Calgary, AB", meta_val_style)],
        [Paragraph("DOCUMENT TYPE", meta_label_style), Paragraph("Official Food Showcase", meta_val_style)],
        [Paragraph("GENERATED ON", meta_label_style), Paragraph(today_str, meta_val_style)]
    ]
    meta_table = Table(meta_data, colWidths=[150, 250])
    meta_table.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,-2), 0.5, colors.HexColor('#E5E5E5')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (0,-1), 'CENTER'),
        ('ALIGN', (1,0), (1,-1), 'CENTER'),
    ]))
    
    # Center-align the table on the page
    # Since width is 400 (150+250), it fits well in 504 pt layout width
    wrapper_table = Table([[meta_table]], colWidths=[504])
    wrapper_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(wrapper_table)
    
    story.append(PageBreak())
    
    # ------------------ FOOD ITEMS PAGES ------------------
    for idx, item in enumerate(items):
        title = item["target_title"]
        booth = item["booth"]
        desc = item["description"]
        img_path = item["local_image_path"]
        
        # 1. Title
        story.append(Paragraph(title, food_title_style))
        story.append(Spacer(1, 4))
        
        # 2. Booth Info
        if not booth:
            booth = "Featured Booth / Vendor Details"
        story.append(Paragraph(booth, food_booth_style))
        story.append(Spacer(1, 6))
        
        # 3. Gold Accent line
        item_bar = Table([['']], colWidths=[504], rowHeights=[2])
        item_bar.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FFBF00')),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(item_bar)
        
        story.append(Spacer(1, 15))
        
        # 4. Image
        img_flowable = get_image_flowable(img_path)
        
        # Center-align image by putting it in a table
        img_table = Table([[img_flowable]], colWidths=[504])
        img_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(img_table)
        
        story.append(Spacer(1, 15))
        
        # 5. Description
        story.append(Paragraph(desc, food_desc_style))
        
        # Page break after every item except the last one
        if idx < len(items) - 1:
            story.append(PageBreak())
            
    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF generation complete.")

if __name__ == "__main__":
    build_pdf()

```

### 4. Base64 Embedding Builder (`embed_images.py`)
```python
import os
import base64
from PIL import Image as PILImage

def compress_and_get_base64(filepath, max_width=600):
    try:
        # Determine image format
        ext = os.path.splitext(filepath)[1].lower()
        mime = "image/jpeg"
        save_format = "JPEG"
        if ext in (".png", ".gif"):
            mime = f"image/{ext[1:]}"
            save_format = ext[1:].upper()
            
        with PILImage.open(filepath) as img:
            # Convert RGBA to RGB if saving as JPEG
            if save_format == "JPEG" and img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
                
            w, h = img.size
            if w > max_width:
                # Resize keeping aspect ratio
                new_h = int((max_width / w) * h)
                print(f"Resizing {filepath} from {w}x{h} to {max_width}x{new_h}...")
                img = img.resize((max_width, new_h), PILImage.Resampling.LANCZOS)
            
            # Save to a temporary buffer
            import io
            buf = io.BytesIO()
            if save_format == "JPEG":
                img.save(buf, format=save_format, quality=80)
            else:
                img.save(buf, format=save_format)
                
            img_bytes = buf.getvalue()
            b64_str = base64.b64encode(img_bytes).decode("utf-8")
            print(f"File {filepath}: original size {os.path.getsize(filepath)} bytes, compressed b64 size {len(b64_str)} chars.")
            return f"data:{mime};base64,{b64_str}"
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return ""

def main():
    # Source images path
    images_dir = "images"
    
    with open("matched_items.json", "r", encoding="utf-8") as f:
        import json
        items = json.load(f)
        
    base64_images = {}
    for item in items:
        title = item["target_title"]
        path = item["local_image_path"]
        if path and os.path.exists(path):
            b64 = compress_and_get_base64(path)
            base64_images[title] = b64
        else:
            print(f"Warning: Image path not found for {title}")
            base64_images[title] = ""
            
    # Now let's read the template/original index.html and update the data array with base64 strings
    # We will overwrite the 'image' field for each food item with the base64 string
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()
        
    # We can rebuild the foodItems array in javascript dynamically or replace the file contents
    # Let's inspect the foodItems definition in index.html and replace it
    # E.g. let's rebuild the javascript foodItems array and insert it
    
    js_food_items = []
    
    # Matching details
    details_map = {
        "Buldak Stuffed Grilled Cheese": {
            "id": 1,
            "booth": "Booth #2043",
            "vendor": "Melt Town Grilled Cheese",
            "coords": {"lat": 51.0358827, "lng": -114.0575063}
        },
        "Blue Coconut Cloud Matcha": {
            "id": 2,
            "booth": "Booth #FM006",
            "vendor": "Covet Sips + Sweets",
            "coords": {"lat": 51.0386616, "lng": -114.0566612}
        },
        "Amsterdam Cone Fries": {
            "id": 3,
            "booth": "Booth #2007",
            "vendor": "The Poutine King",
            "coords": {"lat": 51.036940, "lng": -114.055500}
        },
        "The Cheesy Saddle Slice": {
            "id": 4,
            "booth": "Booth #2021",
            "vendor": "Pizza 73",
            "coords": {"lat": 51.036875, "lng": -114.054700}
        },
        "Deep Fried Street Corn": {
            "id": 5,
            "booth": "Booth #2049",
            "vendor": "Drink a Fruit",
            "coords": {"lat": 51.0368470, "lng": -114.0562874}
        },
        "Dunkaroo Iced Latte": {
            "id": 6,
            "booth": "Booth #FM006",
            "vendor": "Covet Sips + Sweets",
            "coords": {"lat": 51.0386616, "lng": -114.0566612}
        },
        "Garlic Parm Twisted Pickle": {
            "id": 7,
            "booth": "Booth #1003",
            "vendor": "Twisted Pickles",
            "coords": {"lat": 51.0371391, "lng": -114.0540141}
        },
        "Maki Sushi Corn Dog": {
            "id": 8,
            "booth": "Booth #3010",
            "vendor": "Drink a Fruit",
            "coords": {"lat": 51.034540, "lng": -114.056380}
        },
        "Potato Sago Spiral - With Loaded Tex-Mex Edition": {
            "id": 9,
            "booth": "Booth #2050",
            "vendor": "Freakk Fries",
            "coords": {"lat": 51.0368480, "lng": -114.056150}
        },
        "Ramen Donut": {
            "id": 10,
            "booth": "Booth #2027",
            "vendor": "Wok This Way",
            "coords": {"lat": 51.0369718, "lng": -114.0554023}
        }
    }
    
    for item in items:
        title = item["target_title"]
        details = details_map.get(title, {})
        if not details:
            # Clean up target title to match slightly different naming
            for k in details_map:
                if k.lower() in title.lower() or title.lower() in k.lower():
                    details = details_map[k]
                    break
        
        if details:
            js_food_items.append({
                "id": details["id"],
                "title": title.replace(" - With Loaded Tex-Mex Edition", " - With Loaded Tex-Mex"), # Shorten if needed
                "booth": details["booth"],
                "vendor": details["vendor"],
                "description": item["description"],
                "coords": details["coords"],
                "image": base64_images.get(title, "")
            })
            
    # Sort js_food_items by id
    js_food_items.sort(key=lambda x: x["id"])
    
    # We will replace the foodItems script in the index.html
    # Let's find the start and end of the foodItems array in index.html
    # We can do a string replacement
    
    import re
    
    # Let's format the array as a beautiful javascript string
    js_array_str = "const foodItems = " + json.dumps(js_food_items, indent=12) + ";"
    
    # Let's find the start and end of the foodItems array in index.html
    # We can do a string replacement using simple index splicing
    start_marker = "const foodItems = ["
    end_marker = "];"
    
    start_idx = html.find(start_marker)
    if start_idx != -1:
        end_idx = html.find(end_marker, start_idx)
        if end_idx != -1:
            modified_html = html[:start_idx] + js_array_str + html[end_idx + len(end_marker):]
            print("Successfully replaced foodItems array in index.html using markers!")
            count = 1
        else:
            print("Error: Could not find end marker ];")
            count = 0
    else:
        print("Error: Could not find start marker const foodItems = [")
        count = 0
                
    if count > 0:
        with open("index.html", "w", encoding="utf-8") as f:
            f.write(modified_html)
        print("Saved updated index.html")
        
        # Also copy it to the artifact directory!
        artifact_path = r"C:\Users\DannyTam-Tham\.gemini\antigravity\brain\5340ff15-f7e1-42af-9339-0b73c897890b\index.html"
        with open(artifact_path, "w", encoding="utf-8") as f:
            f.write(modified_html)
        print(f"Copied updated index.html to {artifact_path}")
    else:
        print("Error: Could not locate foodItems array in index.html to replace.")

if __name__ == "__main__":
    main()

```

### 5. PDF to Image Exporter (`convert_pdf.py`)
```python
import os
import shutil
import fitz  # PyMuPDF

def main():
    pdf_path = "midway_food_details.pdf"
    artifact_dir = r"C:\Users\DannyTam-Tham\.gemini\antigravity\brain\5340ff15-f7e1-42af-9339-0b73c897890b"
    
    # 1. Copy PDF to artifact directory
    target_pdf = os.path.join(artifact_dir, "midway_food_details.pdf")
    print(f"Copying {pdf_path} to {target_pdf}...")
    shutil.copy2(pdf_path, target_pdf)
    
    # 2. Render first 3 pages of PDF to PNG images
    doc = fitz.open(pdf_path)
    print(f"Total pages in PDF: {len(doc)}")
    
    # Render cover page (page 1) and first two food items (pages 2, 3)
    pages_to_render = min(3, len(doc))
    for page_num in range(pages_to_render):
        page = doc.load_page(page_num)
        # Scale up resolution for high-quality images
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        
        filename = f"page_{page_num + 1}.png"
        target_path = os.path.join(artifact_dir, filename)
        print(f"Rendering page {page_num + 1} to {target_path}...")
        pix.save(target_path)
        
    print("PDF conversion and copying complete.")

if __name__ == "__main__":
    main()

```
