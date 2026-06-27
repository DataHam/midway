# Tam-Tham Digital Business Card

This repository contains the code for the digital business card landing page for **tamtham.com**. It is designed to be the destination for the **V1CE card** NFC redirect, providing a mobile-optimized contact interface.

## 🎨 Brand Identity

This project adheres to the **Tam-Tham Logo Guideline (2021)**.

### Color Palette
- **Primary Blue:** `#1D3248` (Main background and text)
- **Primary Yellow:** `#F8CF1C` (Action buttons and highlights)
- **Secondary Teal:** `#7DC2B6` (Job titles and accents)
- **Secondary Grey:** `#535A60` (Secondary buttons and footer)

### Typography
- **Headings:** Montserrat Bold (700)
- **Body & Buttons:** Montserrat SemiBold (600)
- **System Fallback:** sans-serif

### Usage Rules
- **Clear Space:** Maintain a minimum clear space around branding elements equal to the width of the "M" in the logo or **0.25 inches** (approx. 24px).
- **Minimum Size:** The primary logo should not be reproduced smaller than **1 inch** in width. The alternate icon-only logo should not be smaller than **0.5 inches**.

## 🚀 Deployment

The site is hosted via **Azure Static Web Apps** with automatic CI/CD through GitHub Actions.

1. **Local Development:** Open `index.html` in any browser to preview changes.
2. **Updates:** Push changes to the `main` branch to trigger an automatic deployment to Azure.
3. **Contact Data:** The "Save Contact" button pulls from `danny.vcf`. Ensure this file is updated whenever professional details change.

## 📂 Project Structure
- `index.html`: Main landing page with responsive light/dark mode.
- `danny.vcf`: Virtual Contact File for mobile address book import.
- `logo.svg`: Brand asset (Circuit-style "T").
- `.github/workflows/`: Azure deployment automation.

## 📚 Documentation

- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/v4-beta)
- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)

## 🛠️ Development

### Prerequisites
- **Node.js >= 24**
- **Azure Static Web Apps CLI**: Install via `npm install -g @azure/static-web-apps-cli`

### Commands
- `npm run dev`: Build CSS with watch mode
- `npm run build`: Production build
- `npm run swa start`: Run the Azure SWA emulator locally
- `npm test`: Run unit tests (Vitest)
- `npm run test:e2e`: Run end-to-end tests (Playwright)

---
**Maintained by:** Danny Tam-Tham
**Location:** Calgary, AB
