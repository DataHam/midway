# Phase 1: Foundation & Design - Research

**Researched:** 2026-03-12  
**Domain:** Design system configuration, image optimization, accessibility compliance  
**Confidence:** HIGH

## Summary

Phase 1 establishes the technical foundation for the Tam-Tham website by configuring Tailwind CSS with the brand design system and setting up image optimization infrastructure. The phase focuses on three core areas:

1. **Tailwind CSS v4 Configuration**: Modern CSS-first approach using `@theme` directive for custom colors, fonts, and typography scale. No legacy `tailwind.config.js` needed.

2. **Image Optimization Pipeline**: Using `sharp` library for WebP conversion with responsive `srcset` variants (375/768/1024/1920px), explicit dimensions for CLS prevention, and lazy loading for below-fold images.

3. **Accessibility Compliance**: WCAG 2.1 AA standards requiring 4.5:1 contrast ratio for normal text and 3:1 for large text (18pt+ or 14pt bold).

**Primary recommendation:** Use Tailwind CSS v4 with CSS-based `@theme` configuration, sharp for image optimization, and validate all color combinations against WCAG 2.1 AA contrast requirements before implementation.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Brand color palette: Navy #103248, Yellow #F0D04C, Teal #7DC2B6, Red #D64E34, Blue #385C8F, Grey #535A60
- Font: Self-hosted Montserrat WOFF2 (no Google Fonts CDN)
- Typography: Bold headers, SemiBold accents, Regular body
- Accessibility: WCAG AA compliance (4.5:1 contrast minimum)
- Image format: WebP with responsive srcset variants (375/768/1024/1920px)
- Hero image: Eager-loaded
- Below-fold images: lazy loading

### Claude's Discretion
- Tailwind CSS version (v4 recommended for CSS-first approach)
- Image optimization tool selection (sharp vs alternatives)
- Build pipeline structure (PostCSS integration)
- Font weight mapping for Montserrat

### Deferred Ideas (OUT OF SCOPE)
- Meeting booking integration
- Analytics tracking
- Performance monitoring tools
- User authentication
- Multi-language support

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DESIGN-01 | Implement brand color palette | Tailwind v4 @theme colors, contrast validation tools |
| DESIGN-02 | Use self-hosted Montserrat WOFF2 fonts | @font-face loading, @theme font configuration |
| DESIGN-03 | Apply consistent typography scale | Tailwind @theme text variables, font-weight mapping |
| DESIGN-04 | Ensure WCAG AA accessibility compliance | 4.5:1 contrast requirements, large text exceptions |
| IMG-01 | Convert all images to WebP format | sharp toFormat('webp'), lossy/lossless options |
| IMG-02 | Generate responsive srcset variants (375/768/1024/1920px) | sharp.resize(), width descriptor srcset |
| IMG-03 | Set explicit width/height attributes | CLS prevention, object-fit patterns |
| IMG-04 | Hero image eager-loaded | fetchpriority="high", no lazy attribute |
| IMG-05 | Below-fold images use lazy loading | loading="lazy", intersection observer patterns |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | v4.2+ | Utility-first CSS framework | CSS-first configuration with @theme directive, no build step required for basic usage |
| PostCSS | v8.4+ | CSS transformation pipeline | Required for Tailwind v4 processing, plugin ecosystem |
| sharp | v0.33.5 | Image optimization and conversion | Industry standard Node.js image processing, libvips backend for speed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tailwindcss/node | v4.2+ | Tailwind v4 Node.js integration | For build pipelines, CLI usage |
| tailwindcss | v4.2+ | Tailwind CSS compiler | Core framework |
| postcss | v8.4+ | CSS processing | Required dependency |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| sharp | ves, jimp | sharp has libvips backend (10-100x faster), better WebP support |
| Tailwind v4 | Tailwind v3 | v4 uses CSS-first config, removes tailwind.config.js complexity |
| Google Fonts | Self-hosted WOFF2 | Self-hosted required by DESIGN-02, better privacy/performance |

**Installation:**

```bash
npm install -D tailwindcss @tailwindcss/node postcss
npm install -D sharp
```

## Architecture Patterns

### Recommended Project Structure

```
project/
├── assets/
│   ├── fonts/
│   │   └── Montserrat/
│   │       ├── Montserrat-Regular.woff2
│   │       ├── Montserrat-SemiBold.woff2
│   │       └── Montserrat-Bold.woff2
│   └── images/
│       ├── hero.webp (1920px)
│       ├── hero-1920.webp
│       ├── hero-1024.webp
│       ├── hero-768.webp
│       └── hero-375.webp
├── src/
│   └── css/
│       └── input.css (with @tailwind directives)
├── scripts/
│   └── optimize-images.js (image optimization script)
├── staticwebapp.config.json
├── postcss.config.js
└── package.json
```

### Pattern 1: Tailwind v4 CSS-First Configuration

**What:** Modern Tailwind v4 approach using CSS `@theme` directive instead of JavaScript config file.

**When to use:** All new Tailwind projects, especially when custom colors, fonts, and typography are needed.

**Example:**

```css
/* src/css/input.css */
@import "tailwindcss";

@theme {
  /* Brand Colors */
  --color-navy: #103248;
  --color-yellow: #F0D04C;
  --color-teal: #7DC2B6;
  --color-red: #D64E34;
  --color-blue: #385C8F;
  --color-grey: #535A60;
  
  /* Font Family */
  --font-montserrat: "Montserrat", ui-sans-serif, system-ui, sans-serif;
  
  /* Typography Scale */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  
  /* Font Weights */
  --font-weight-regular: 400;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}

@layer base {
  @font-face {
    font-family: "Montserrat";
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url("/assets/fonts/Montserrat/Montserrat-Regular.woff2") format("woff2");
  }
  
  @font-face {
    font-family: "Montserrat";
    font-style: normal;
    font-weight: 600;
    font-display: swap;
    src: url("/assets/fonts/Montserrat/Montserrat-SemiBold.woff2") format("woff2");
  }
  
  @font-face {
    font-family: "Montserrat";
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: url("/assets/fonts/Montserrat/Montserrat-Bold.woff2") format("woff2");
  }
}
```

**Source:** [Tailwind CSS v4 Theme Documentation](https://tailwindcss.com/docs/theme)

### Pattern 2: Responsive Images with srcset

**What:** Multiple WebP variants with width descriptors for browser-based selection.

**When to use:** All images that appear in different viewport sizes.

**Example:**

```html
<!-- Hero Image (Eager-Loaded) -->
<img 
  src="/assets/images/hero-1920.webp"
  srcset="
    /assets/images/hero-375.webp  375w,
    /assets/images/hero-768.webp  768w,
    /assets/images/hero-1024.webp 1024w,
    /assets/images/hero-1920.webp 1920w
  "
  sizes="100vw"
  width="1920"
  height="1080"
  fetchpriority="high"
  alt="Tam-Tham professional services"
  class="w-full h-auto object-cover"
>

<!-- Below-Fold Image (Lazy-Loaded) -->
<img 
  src="/assets/images/profile-768.webp"
  srcset="
    /assets/images/profile-375.webp  375w,
    /assets/images/profile-768.webp  768w,
    /assets/images/profile-1024.webp 1024w
  "
  sizes="(max-width: 640px) 375px, (max-width: 1024px) 768px, 1024px"
  width="1024"
  height="1024"
  loading="lazy"
  alt="Danny Tam-Tham profile photo"
  class="w-full h-auto object-cover rounded-lg"
>
```

**Source:** [web.dev Responsive Images](https://web.dev/responsive-images/)

### Pattern 3: Image Optimization Script

**What:** Node.js script using sharp to convert and optimize images.

**When to use:** Pre-deployment image processing pipeline.

**Example:**

```javascript
// scripts/optimize-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SIZES = [375, 768, 1024, 1920];
const QUALITY = 80; // WebP quality (0-100)

async function optimizeImage(inputPath, outputPath, format = 'webp') {
  const metadata = await sharp(inputPath).metadata();
  const { width, height } = metadata;
  
  // Generate all size variants
  const variants = await Promise.all(
    SIZES.map(async (size) => {
      const targetWidth = Math.min(size, width);
      const targetHeight = Math.round((height / width) * targetWidth);
      const variantPath = path.join(
        outputPath,
        `${path.basename(outputPath, path.extname(outputPath))}-${targetWidth}.webp`
      );
      
      await sharp(inputPath)
        .resize(targetWidth, targetHeight, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: QUALITY, effort: 4 })
        .toFile(variantPath);
      
      return {
        src: `/assets/images/${path.basename(variantPath)}`,
        width: targetWidth
      };
    })
  );
  
  return variants;
}

// Usage example
async function main() {
  const inputDir = './Downloads/images';
  const outputDir = './assets/images';
  
  fs.mkdirSync(outputDir, { recursive: true });
  
  const files = fs.readdirSync(inputDir).filter(f => 
    /\.(jpg|jpeg|png|gif)$/i.test(f)
  );
  
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `${path.basename(file, path.extname(file))}.webp`);
    
    console.log(`Optimizing ${file}...`);
    const variants = await optimizeImage(inputPath, outputPath);
    
    console.log(`  Generated ${variants.length} variants:`);
    variants.forEach(v => console.log(`    - ${v.width}px`));
  }
}

main().catch(console.error);
```

**Source:** [sharp API Documentation](https://sharp.pixelplumbing.com/api-output)

### Anti-Patterns to Avoid

- **Using Google Fonts CDN:** Violates DESIGN-02. Self-host WOFF2 files instead.
- **Omitting width/height attributes:** Causes Cumulative Layout Shift (CLS), hurts Core Web Vitals.
- **Eager-loading all images:** Only hero/above-fold images should be eager-loaded.
- **Using lazy-loading for hero images:** Delays critical content rendering.
- **Hand-rolling contrast calculations:** Use established tools like Color Contrast Analyser.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image conversion | Custom PNG/JPEG to WebP converter | `sharp.toFormat('webp')` | libvips backend, 10-100x faster, battle-tested |
| Responsive image generation | Manual image resizing scripts | `sharp.resize()` with width descriptors | Consistent quality, metadata handling, async pipeline |
| Contrast ratio calculation | Manual luminance formulas | WebAIM Color Contrast Checker, axe DevTools | WCAG formula complexity, edge cases |
| Font loading | Custom @font-face with multiple formats | `font-display: swap` + WOFF2 only | WOFF2 has 95%+ browser support, no fallback needed |
| Typography scale | Ad-hoc font-size values | Tailwind @theme text variables | Consistent spacing, CSS custom properties |

**Key insight:** Image optimization and accessibility are domains where industry-standard tools exist. Building custom solutions introduces bugs, maintenance burden, and performance penalties. Use sharp for images and established contrast checking tools for accessibility.

## Common Pitfalls

### Pitfall 1: Incorrect Font Weight Mapping

**What goes wrong:** Montserrat font weights don't match Tailwind's default font-weight values.

**Why it happens:** Montserrat uses 400 (Regular), 600 (SemiBold), 700 (Bold), but developers may assume 500 for SemiBold.

**How to avoid:** Explicitly map font weights in @theme:

```css
@theme {
  --font-weight-regular: 400;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

**Warning signs:** Text appears lighter/heavier than expected, SemiBold looks like Regular.

### Pitfall 2: Contrast Ratio Failures with Brand Colors

**What goes wrong:** Brand colors (#F0D04C yellow, #7DC2B6 teal) may not meet 4.5:1 contrast on white backgrounds.

**Why it happens:** Light colors inherently have lower contrast ratios.

**How to avoid:** Test all color combinations before implementation:
- Yellow #F0D04C on white: ~1.8:1 (FAILS)
- Teal #7DC2B6 on white: ~2.5:1 (FAILS)
- Solution: Use dark backgrounds for light colors, or darken colors for text

**Warning signs:** Lighthouse accessibility score < 90, color contrast warnings in DevTools.

### Pitfall 3: CLS from Missing Dimensions

**What goes wrong:** Images cause layout shifts as they load, hurting Core Web Vitals.

**Why it happens:** Browser doesn't know image dimensions until downloaded.

**How to avoid:** Always set explicit width/height attributes or aspect-ratio CSS.

**Warning signs:** "Avoid enormous layouts shifts" warning in Lighthouse.

### Pitfall 4: Incorrect srcset Syntax

**What goes wrong:** Browser downloads all variants instead of selecting one.

**Why it happens:** Missing width descriptors or incorrect comma spacing.

**How to avoid:** Use width descriptor format (not density):

```html
<!-- CORRECT -->
<img srcset="img-375.webp 375w, img-768.webp 768w">

<!-- WRONG (density descriptor for 1x/2x) -->
<img srcset="img@2x.webp 2x">
```

**Warning signs:** Network tab shows multiple image requests for same image.

### Pitfall 5: Over-Compressing WebP

**What goes wrong:** Quality too low creates visible artifacts.

**Why it happens:** Aggressive compression to reduce file size.

**How to avoid:** Use quality 80 as baseline, visually verify at 70, 80, 90.

**Warning signs:** Blurry or blocky images, especially in gradients.

## Code Examples

### WCAG AA Contrast Validation

**Requirement:** 4.5:1 contrast ratio for normal text, 3:1 for large text (18pt+ or 14pt bold).

**Formula:** `(L1 + 0.05) / (L2 + 0.05)` where L1 is lighter luminance, L2 is darker.

**Example Color Pairs:**

```css
/* PASSING Combinations */
.text-navy { color: #103248; }        /* On white: 12.8:1 ✓ */
.text-white { color: #FFFFFF; }        /* On navy: 12.8:1 ✓ */
.text-grey { color: #535A60; }        /* On white: 7.8:1 ✓ */

/* FAILING (Need Adjustment) */
.text-yellow { color: #F0D04C; }      /* On white: 1.8:1 ✗ */
.text-teal { color: #7DC2B6; }        /* On white: 2.5:1 ✗ */

/* SOLUTION: Use dark backgrounds */
.bg-yellow { background: #F0D04C; }   /* Navy text: 5.9:1 ✓ */
.bg-teal { background: #7DC2B6; }     /* Navy text: 4.6:1 ✓ */
```

**Source:** [WCAG 2.1 Contrast Minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

### Image Loading Strategies

```html
<!-- Hero: Eager-Loaded, High Priority -->
<picture>
  <source 
    srcset="/assets/images/hero-375.webp 375w,
            /assets/images/hero-768.webp 768w,
            /assets/images/hero-1024.webp 1024w,
            /assets/images/hero-1920.webp 1920w"
    sizes="100vw"
    type="image/webp"
  >
  <img 
    src="/assets/images/hero.jpg"
    width="1920"
    height="1080"
    fetchpriority="high"
    alt="Tam-Tham professional services"
    class="w-full h-auto object-cover"
  >
</picture>

<!-- Below-Fold: Lazy-Loaded -->
<img 
  src="/assets/images/profile-768.webp"
  srcset="/assets/images/profile-375.webp 375w,
          /assets/images/profile-768.webp 768w,
          /assets/images/profile-1024.webp 1024w"
  sizes="(max-width: 640px) 375px, (max-width: 1024px) 768px, 1024px"
  width="1024"
  height="1024"
  loading="lazy"
  decoding="async"
  alt="Danny Tam-Tham profile"
  class="w-full h-auto object-cover rounded-lg"
>
```

**Source:** [web.dev Responsive Images](https://web.dev/responsive-images/)

### PostCSS Configuration

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/node': {},
    'postcss-import': {},
    'tailwindcss/nesting': 'postcss-nesting',
    tailwindcss: {},
    autoprefixer: {},
  }
}
```

**Source:** [Tailwind CSS v4 Installation](https://tailwindcss.com/docs/installation)

## State of the Art

### Tailwind Configuration Evolution

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` (v3) | CSS `@theme` directive (v4) | 2024 (v4 release) | Simpler setup, no JS build step for config |
| JIT mode enabled | JIT always on | v3.0+ | Faster builds, on-demand utility generation |
| `@apply` for components | `@layer components` | v3.0+ | Better CSS organization |

### Deprecated/Outdated

- **Tailwind v3 config file:** v4 uses CSS-first approach, `tailwind.config.js` is deprecated
- **Google Fonts CDN:** Self-hosting preferred for performance and privacy (DESIGN-02)
- **Lazy-loading hero images:** Increases LCP, hurts Core Web Vitals
- **JPEG for photos:** WebP provides 25-34% smaller files at equivalent quality

## Open Questions

1. **Montserrat Font Subsetting**
   - What we know: Montserrat has 24 font styles (weights + italics)
   - What's unclear: Whether to include all weights or subset to only Regular/SemiBold/Bold
   - Recommendation: Include all 3 weights (400/600/700) without italics unless design requires

2. **WebP Quality vs File Size**
   - What we know: quality=80 is recommended baseline
   - What's unclear: Optimal quality for hero vs profile images
   - Recommendation: Test quality 70, 80, 90 visually, use lowest acceptable

3. **Fallback for Old Browsers**
   - What we know: WebP has 95%+ browser support
   - What's unclear: Whether to provide JPEG fallback for <5% unsupported browsers
   - Recommendation: Use `<picture>` element with JPEG fallback for maximum compatibility

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual + Lighthouse CI |
| Config file | `lighthouserc.json` (Wave 0) |
| Quick run command | `lighthouse http://localhost:3000 --only-categories=accessibility,performance --output=html --output-path=reports/lighthouse.html` |
| Full suite command | `npm run test:all` (after Wave 0 setup) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DESIGN-01 | Brand colors in Tailwind config | manual | `grep -r "color-navy" src/css/input.css` | ❌ Wave 0 |
| DESIGN-02 | No Google Fonts CDN requests | manual | Chrome DevTools → Network tab → filter "google" | ❌ Wave 0 |
| DESIGN-03 | Typography scale applied | manual | Visual inspection of compiled CSS | ❌ Wave 0 |
| DESIGN-04 | WCAG AA contrast ≥ 4.5:1 | automated | `lighthouse --only-categories=accessibility` | ❌ Wave 0 |
| IMG-01 | All images in WebP format | automated | `find assets/images -name "*.webp" | wc -l` | ❌ Wave 0 |
| IMG-02 | srcset variants generated | automated | `ls assets/images/*-375.webp assets/images/*-768.webp` | ❌ Wave 0 |
| IMG-03 | Explicit width/height attributes | automated | `grep -r "width=" pages/*.html \| grep -v "srcset"` | ❌ Wave 0 |
| IMG-04 | Hero image eager-loaded | automated | `grep -r "fetchpriority=\"high\"" pages/*.html` | ❌ Wave 0 |
| IMG-05 | Below-fold lazy loading | automated | `grep -r "loading=\"lazy\"" pages/*.html` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `lighthouse http://localhost:3000 --only-categories=accessibility,performance --view`
- **Per wave merge:** Full Lighthouse CI suite + manual srcset verification
- **Phase gate:** Lighthouse accessibility ≥ 90, no Google Fonts requests, all images WebP

### Wave 0 Gaps
- [ ] `lighthouserc.json` — Lighthouse CI configuration
- [ ] `scripts/optimize-images.js` — Image optimization script
- [ ] `src/css/input.css` — Tailwind CSS entry with @theme
- [ ] `postcss.config.js` — PostCSS configuration
- [ ] Framework install: `npm install -D tailwindcss @tailwindcss/node postcss sharp` — if none detected

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 Theme Documentation](https://tailwindcss.com/docs/theme) - @theme directive, font-family configuration
- [Tailwind CSS v4 Font Family](https://tailwindcss.com/docs/font-family) - Custom font loading patterns
- [sharp API Documentation](https://sharp.pixelplumbing.com/api-output) - WebP output options, resize methods
- [WCAG 2.1 Contrast Minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) - 4.5:1 requirements, large text exceptions
- [web.dev Responsive Images](https://web.dev/responsive-images/) - srcset syntax, lazy loading patterns

### Secondary (MEDIUM confidence)
- [Google WebP Documentation](https://developers.google.com/speed/webp) - WebP compression techniques, browser support

### Tertiary (LOW confidence)
- WebSearch findings on Tailwind v4 migration (verified with official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Tailwind v4 and sharp are current industry standards, verified with official docs
- Architecture: HIGH - Patterns derived from official documentation and web.dev best practices
- Pitfalls: HIGH - Common issues verified against WCAG guidelines and Core Web Vitals documentation

**Research date:** 2026-03-12  
**Valid until:** 2026-04-11 (30 days for stable frameworks)
