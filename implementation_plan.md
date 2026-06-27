# Implementation Plan: Mobile Responsiveness & Collapsible Sidebar

This plan details the implementation of a responsive layout for mobile access, including a collapsible navigation sidebar, hamburger toggle button, and smooth transition animations.

## User Review Required

> [!NOTE]
> **Mobile Layout Choices:**
> - **Sidebar Size:** On screen widths <= 768px, the sidebar will adjust to a maximum width of 85% (320px) to ensure it doesn't block the entire screen, allowing the user to see the map context.
> - **Collapsible Sidebar Toggle:** A floating hamburger button on the top-left will slide the sidebar in and out.
> - **Map Controls:** Leaflet's zoom control will be moved to the top-right (under the layers control) to prevent overlap with the hamburger menu toggle.
> - **Tap-to-Dismiss Overlay:** A translucent dark overlay will cover the map when the sidebar is open on mobile. Tapping this overlay will dismiss the sidebar.

## Proposed Changes

### 1. HTML Layout Changes in [index.html](file:///c:/Users/DannyTam-Tham/OneDrive%20-%20Tam-Tham/Projects/stampede/index.html)
We will introduce:
- A `#menu-toggle` floating button with a SVG hamburger icon.
- A `#sidebar-overlay` backdrop overlay div that wraps the map container.

### 2. CSS Styling Changes
We will define responsive media queries (`@media (max-width: 768px)`):
- Set `body` to full viewport width.
- Convert `#sidebar` to `position: fixed` with a slide transition (`transform: translateX(-100%)`).
- Style `#menu-toggle` as a floating circular glassmorphism button on the top-left of the screen.
- Style `#sidebar-overlay` to transition opacity when active.
- Set `#map-container` to take up 100% width and height on mobile.

### 3. JavaScript Interaction
We will add event listeners in the script block:
- Listen to clicks on `#menu-toggle` to add/remove a `.sidebar-open` class on `#sidebar` and `.active` on `#sidebar-overlay`.
- Listen to clicks on `#sidebar-overlay` to close the sidebar.
- Automatically close the sidebar on mobile when a food card is selected (so the user is taken directly to the map marker location).

## Verification Plan

### Automated Verification
- We will run a script or check the layout using the browser subagent.
- The browser subagent will simulate a mobile device (e.g. viewport width 375px) to verify that:
  - The menu toggle is visible.
  - Clicking it slides in the sidebar.
  - Clicking a food card closes the sidebar and centers the map.

### Manual Verification
- Deploy changes to `midway.tamtham.com`.
- Open [https://midway.tamtham.com](https://midway.tamtham.com) on a mobile device or in Chrome DevTools Device Mode.
- Verify sidebar slide transitions, search functionality on mobile, and the locate control position.
