# Montserrat Font Files

## Instructions

Add the following WOFF2 font files to this directory for self-hosted font delivery:

### Required Files

- `Montserrat-Regular.woff2` - Regular weight (font-weight: 400)
- `Montserrat-SemiBold.woff2` - SemiBold weight (font-weight: 600)
- `Montserrat-Bold.woff2` - Bold weight (font-weight: 700)

## Self-Hosted Only

**DO NOT** use Google Fonts CDN. All fonts must be self-hosted for:

- Privacy compliance (no third-party requests)
- Performance (faster load times)
- Reliability (no external dependencies)

## Installation

1. Download Montserrat font files from [Google Fonts](https://fonts.google.com/specimen/Montserrat)
2. Convert to WOFF2 format (if needed) using [Font Squirrel Webfont Generator](https://www.fontsquirrel.com/tools/webfont-generator)
3. Place the three required files in this directory
4. Verify the files are present before proceeding

## CSS Usage

Once installed, the fonts will be available via Tailwind CSS configuration:

```css
@font-face {
  font-family: 'Montserrat';
  src: url('/assets/fonts/Montserrat/Montserrat-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Montserrat';
  src: url('/assets/fonts/Montserrat/Montserrat-SemiBold.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Montserrat';
  src: url('/assets/fonts/Montserrat/Montserrat-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

## Verification

After adding the files, verify they are present:

```bash
ls -la assets/fonts/Montserrat/
```

Expected output:
```
Montserrat-Regular.woff2
Montserrat-SemiBold.woff2
Montserrat-Bold.woff2
```
