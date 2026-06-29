---
name: Calgary Stampede 2026 - Midway Food Map
description: Interactive map to discover and locate midway food vendors at the 2026 Calgary Stampede.
colors:
  primary: "#A6192E"
  primary-light: "#C4263F"
  accent: "#FFBF00"
  bg-dark: "#121212"
  bg-card: "rgba(28, 28, 28, 0.85)"
  bg-sidebar: "rgba(18, 18, 18, 0.95)"
  text-main: "#FFFFFF"
  text-muted: "#D4D4D4"
  border: "rgba(255, 255, 255, 0.1)"
typography:
  display:
    fontFamily: "'Montserrat', sans-serif"
    fontWeight: 800
  body:
    fontFamily: "'Outfit', sans-serif"
    fontWeight: 400
rounded:
  sm: "8px"
  md: "12px"
spacing:
  sm: "12px"
  md: "16px"
  lg: "24px"
components:
  food-card:
    backgroundColor: "{colors.bg-card}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  food-card-hover:
    backgroundColor: "rgba(38, 38, 38, 0.95)"
  food-card-active:
    backgroundColor: "rgba(166, 25, 46, 0.2)"
---

# Design System: Calgary Stampede 2026 - Midway Food Map

## 1. Overview

**Creative North Star: "The Neon Rodeo"**

A high-contrast, modern, dark-mode map interface that puts the energy of the midway right in your hands. It embraces a bold festival vibe with deep darks illuminated by vibrant Stampede Red and Gold accents. We explicitly reject the look of generic, dense corporate directories and uninspired white-background maps.

**Key Characteristics:**
- Mobile-first, utility-focused interaction
- High contrast for outdoor daylight legibility
- Map as the hero element
- Immersive dark mode with glassmorphic layers

## 2. Colors

A deep dark base lit by energetic brand colors.

### Primary
- **Stampede Red** (#A6192E): The core brand identity, used for active states, highlights, and primary markers.
- **Stampede Light Red** (#C4263F): A lighter variation for hover states or layered accents.

### Secondary
- **Stampede Gold** (#FFBF00): The energetic accent color, used for the 'Locate Me' button, active highlights, and dividers.

### Neutral
- **Deep Background** (#121212): The foundational base color.
- **Surface Layer** (rgba(18, 18, 18, 0.95)): Used for the sidebar and main panels.
- **Card Surface** (rgba(28, 28, 28, 0.85)): Slightly lighter surfaces for interactive elements like food cards.
- **Main Text** (#FFFFFF): High contrast body and headings.
- **Muted Text** (#D4D4D4): Secondary information like vendor names.
- **Subtle Border** (rgba(255, 255, 255, 0.1)): Gentle dividers between sections and cards.

## 3. Typography

**Display Font:** 'Montserrat', sans-serif
**Body Font:** 'Outfit', sans-serif

**Character:** A pairing of a bold, structural geometric display font (Montserrat) with a clean, highly legible body font (Outfit).

### Hierarchy
- **Display** (800, 24px): For main titles like the sidebar header.
- **Title** (600, 15px, 1.3): Used for food item names inside the cards.
- **Body** (400, 14px): Standard text like search inputs.
- **Label** (600, 13px, uppercase, 2px spacing): For section headers and metadata.

## 4. Elevation

The system uses a combination of subtle shadows and glassmorphic blurs (`backdrop-filter`) to create depth without overwhelming the map.

### Shadow Vocabulary
- **Panel Shadow** (`0 8px 32px 0 rgba(0, 0, 0, 0.37)`): Used for large floating panels like the sidebar.
- **Card Hover Shadow** (`0 6px 20px rgba(0,0,0,0.3)`): Used when interacting with food cards.
- **Button Shadow** (`0 4px 15px rgba(0,0,0,0.3)`): Lifts the primary action buttons off the map.

## 5. Components

### Food Cards
- **Shape:** 12px border radius
- **Base:** Card surface color, subtle border
- **Hover:** Darker surface (`rgba(38, 38, 38, 0.95)`), gold border tint, elevated shadow.
- **Active:** Tinted red background (`rgba(166, 25, 46, 0.2)`), gold border, with a solid red left accent bar.

### Action Buttons (Locate Me, Map Controls)
- **Shape:** Round (50% radius) or gently rounded squares
- **Primary (Locate Me):** Stampede Gold background, dark icon, prominent drop shadow.

## 6. Do's and Don'ts

- **Do** rely on the map as the primary navigation tool.
- **Don't** clutter the sidebar with long, unformatted paragraphs.
- **Do** ensure all interactive areas have a clear hover and active state.
- **Don't** use light mode colors or white backgrounds; stick to the dark theme for contrast.
- **Do** truncate long titles using `line-clamp` instead of letting them break awkwardly.
