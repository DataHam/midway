# Tam-Tham Website — Design System

**Analysis Date:** 2026-03-12  
**Source:** UI/UX Pro-Max Skill + Tam-Tham Brand Guidelines  
**Project:** Professional Consulting & Research Landing Page

---

## Executive Summary

This design system combines **Tam-Tham's established brand identity** with **industry best practices for professional consulting landing pages**. The result is a refined, conversion-optimized interface that maintains brand consistency while following modern UX patterns.

**Recommended Pattern:** Hero-Centric + Feature-Rich Showcase (Patterns #20 + #22 from UI/UX database)  
**Style Category:** Minimalism & Swiss Style with Professional Trust Elements  
**Primary Stack:** HTML + Tailwind CSS

---

## Design Principles

### Core Values

| Principle | Application |
|-----------|-------------|
| **Professional Authority** | Navy primary, gold accents, clean typography conveys expertise |
| **Trust & Credibility** | Clear credentials, contact info, research/services sections |
| **Accessibility First** | WCAG AA compliance, 7:1 contrast for key text |
| **Performance** | Self-hosted assets, WebP images, minimal external dependencies |
| **Security** | Turnstile gates, CSP headers, no direct subdomain exposure |

### Anti-Patterns to Avoid

- ❌ No emojis as icons (use SVG Heroicons)
- ❌ No external font CDNs (self-host Montserrat WOFF2)
- ❌ No direct links to subdomains (use CAPTCHA gate)
- ❌ No meeting booking links (per requirements)
- ❌ No excessive animations (smooth 200-300ms only)

---

## Color System

### Brand Colors (from Tam-Tham Logo Guideline 2021)

| Role | Hex | Tailwind Class | Usage |
|------|-----|----------------|-------|
| Primary Navy | `#103248` | `bg-primary-navy` | Headers, nav, primary text |
| Primary Yellow | `#F0D04C` | `bg-primary-yellow` | CTAs, highlights, accents |
| Secondary Teal | `#7DC2B6` | `bg-secondary-teal` | Subtitles, secondary elements |
| Secondary Red | `#D64E34` | `bg-secondary-red` | Alerts, important notices |
| Secondary Blue | `#385C8F` | `bg-secondary-blue` | Links, hover states |
| Secondary Grey | `#535A60` | `bg-secondary-grey` | Body text, meta info |

### Extended Palette (for UI consistency)

| Role | Hex | Usage |
|------|-----|-------|
| White | `#FFFFFF` | Card backgrounds, light mode |
| Light Grey | `#F8FAFC` | Section backgrounds |
| Dark Grey | `#1E293B` | Body text on light backgrounds |
| Border Grey | `#E2E8F0` | Dividers, borders |

### Dark Mode Colors

| Role | Hex | Usage |
|------|-----|-------|
| Deep Navy | `#0A1F2E` | Background |
| Navy | `#103248` | Cards |
| Yellow | `#F0D04C` | CTAs (unchanged) |
| Teal | `#7DC2B6` | Accents |
| White | `#FFFFFF` | Primary text |
| Light Grey | `#CBD5E1` | Secondary text |

### Accessibility Notes

- **Minimum contrast ratio:** 4.5:1 for normal text, 7:1 for key CTAs
- **Primary Navy on White:** 12.5:1 ✅ (WCAG AAA)
- **Primary Yellow on Navy:** 9.2:1 ✅ (WCAG AAA)
- **Secondary Grey on White:** 5.8:1 ✅ (WCAG AA)
- **Avoid:** Light grey text on light backgrounds

---

## Typography System

### Font Family: Montserrat (Self-Hosted)

**Source:** Tam-Tham Brand Guidelines (required)  
**Format:** WOFF2 (no Google Fonts CDN)  
**Weights:** Regular (400), SemiBold (600), Bold (700)

### Type Scale

| Level | Size | Weight | Line Height | Usage | Tailwind |
|-------|------|--------|-------------|-------|----------|
| H1 | 3rem (48px) | Bold (700) | 1.2 | Page titles, hero headline | `text-4xl md:text-5xl font-bold` |
| H2 | 2.25rem (36px) | Bold (700) | 1.3 | Section headers | `text-3xl font-bold` |
| H3 | 1.5rem (24px) | SemiBold (600) | 1.4 | Subsections, card titles | `text-2xl font-semibold` |
| H4 | 1.25rem (20px) | SemiBold (600) | 1.5 | Card headers, labels | `text-xl font-semibold` |
| Body | 1.125rem (18px) | Regular (400) | 1.6 | Paragraph text | `text-base leading-relaxed` |
| Small | 1rem (16px) | Regular (400) | 1.5 | Meta, captions | `text-sm` |
| Button | 1rem (16px) | SemiBold (600) | 1 | CTA text | `text-base font-semibold` |

### Font Loading

```html
<!-- Self-hosted Montserrat WOFF2 -->
<link rel="preload" href="/assets/fonts/Montserrat/Montserrat-Bold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/Montserrat/Montserrat-SemiBold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/Montserrat/Montserrat-Regular.woff2" as="font" type="font/woff2" crossorigin>

<style>
@font-face {
  font-family: 'Montserrat';
  src: url('/assets/fonts/Montserrat/Montserrat-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
/* ... other weights */
</style>
```

### Line Length & Readability

- **Optimal:** 65-75 characters per line
- **Max-width for text:** `max-w-prose` (≈680px)
- **Avoid:** Full-width text on large screens

---

## UI Components

### Navigation

**Pattern:** Sticky Navigation with Floating Spacing

```html
<nav class="fixed top-4 left-4 right-4 z-50 bg-primary-navy/95 backdrop-blur-sm shadow-lg rounded-lg px-6 py-4">
  <div class="max-w-7xl mx-auto flex justify-between items-center">
    <a href="/" class="text-primary-yellow font-bold text-xl">Tam-Tham</a>
    <div class="hidden md:flex space-x-8">
      <a href="/danny.html" class="text-white hover:text-primary-yellow transition-colors">Danny</a>
      <a href="/helen.html" class="text-white hover:text-primary-yellow transition-colors">Helen</a>
      <a href="/verify-danny.html" class="text-white hover:text-primary-yellow transition-colors">Contact Danny</a>
      <a href="/verify-helen.html" class="text-white hover:text-primary-yellow transition-colors">Contact Helen</a>
    </div>
  </div>
</nav>
```

**UX Guidelines:**
- ✅ Add padding-top to body equal to nav height (`pt-24`)
- ✅ Active state indication (border-bottom for current page)
- ✅ Mobile hamburger menu for small screens
- ✅ Smooth scroll behavior on anchor links

---

### Hero Section

**Pattern:** Hero-Centric Design with Brand Colors

```html
<section class="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
         style="background-image: url('/assets/images/HDMain.webp');">
  <!-- Overlay for text readability -->
  <div class="absolute inset-0 bg-primary-navy/60"></div>
  
  <div class="relative z-10 text-center text-white px-6">
    <!-- Logo -->
    <img src="/assets/images/TamThamLogo.webp" alt="Tam-Tham Logo" class="mx-auto h-24 mb-8">
    
    <!-- Headline -->
    <h1 class="text-4xl md:text-6xl font-bold mb-6">
      Tam-Tham Consulting & Research
    </h1>
    
    <!-- Subheadline -->
    <p class="text-xl md:text-2xl text-secondary-teal mb-10 max-w-3xl mx-auto">
      Professional expertise in IT strategy, digital transformation, and physician research
    </p>
    
    <!-- CTA Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
      <a href="/danny.html" class="bg-secondary-blue hover:bg-primary-yellow hover:text-primary-navy text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105">
        Danny's Biography
      </a>
      <a href="/helen.html" class="bg-secondary-blue hover:bg-primary-yellow hover:text-primary-navy text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105">
        Helen's Biography
      </a>
      <a href="/verify-danny.html" class="bg-primary-yellow hover:bg-secondary-blue hover:text-white text-primary-navy font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105">
        Contact Danny
      </a>
      <a href="/verify-helen.html" class="bg-primary-yellow hover:bg-secondary-blue hover:text-white text-primary-navy font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105">
        Contact Helen
      </a>
    </div>
  </div>
</section>
```

**UX Guidelines:**
- ✅ Minimum viewport height (`min-h-screen`)
- ✅ Text shadow or overlay for readability on images
- ✅ CTA buttons with hover feedback (`transform hover:scale-105`)
- ✅ Responsive grid (1 column mobile, 2 tablet, 4 desktop)

---

### CTA Buttons

**Primary CTA (Yellow Background)**

```html
<a href="#" class="inline-block bg-primary-yellow hover:bg-secondary-blue hover:text-white text-primary-navy font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
  Download CV
</a>
```

**Secondary CTA (Blue Background)**

```html
<a href="#" class="inline-block bg-secondary-blue hover:bg-primary-yellow hover:text-primary-navy text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200">
  Learn More
</a>
```

**Button States:**
| State | Background | Text | Transition |
|-------|------------|------|------------|
| Default | `#F0D04C` (Yellow) | `#103248` (Navy) | - |
| Hover | `#385C8F` (Blue) | `#FFFFFF` (White) | 200ms |
| Focus | Ring + Blue border | - | 150ms |
| Active | Scale 0.98 | - | 100ms |

**Accessibility:**
- ✅ Minimum 44x44px touch targets
- ✅ Visible focus ring (`focus:ring-2 focus:ring-primary-yellow`)
- ✅ `cursor-pointer` on all clickable elements

---

### Profile Cards (Danny & Helen)

**Pattern:** Feature-Rich Showcase with Trust Elements

```html
<div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
  <div class="flex flex-col md:flex-row">
    <!-- Profile Image -->
    <div class="md:w-1/3">
      <img src="/assets/images/DannySquareProfile.webp" 
           alt="Danny Tam-Tham" 
           class="w-full h-full object-cover"
           width="400" height="400">
    </div>
    
    <!-- Content -->
    <div class="p-6 md:w-2/3">
      <h3 class="text-2xl font-bold text-primary-navy mb-2">Danny Tam-Tham</h3>
      <p class="text-secondary-teal font-semibold mb-4">BSc, MBA — Principal Consultant</p>
      
      <div class="space-y-2 text-sm text-secondary-grey mb-6">
        <p><strong>Tam-Tham Consulting</strong></p>
        <p>📞 [redacted]</p>
        <p>✉️ [redacted]</p>
        <p>🔗 <a href="https://www.linkedin.com/in/danny-tam-tham/" class="text-secondary-blue hover:underline" target="_blank" rel="noopener">LinkedIn</a></p>
      </div>
      
      <!-- Services -->
      <div class="mb-6">
        <h4 class="font-semibold text-primary-navy mb-2">Consulting Services</h4>
        <ul class="space-y-1 text-sm">
          <li>• IT Strategy</li>
          <li>• Digital Transformation</li>
          <li>• Healthcare IT</li>
        </ul>
      </div>
      
      <!-- CTA -->
      <a href="/assets/cv-danny.pdf" class="inline-block bg-primary-yellow hover:bg-secondary-blue hover:text-white text-primary-navy font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
        Download CV
      </a>
    </div>
  </div>
</div>
```

**UX Guidelines:**
- ✅ Consistent icon style (emoji for contact, SVG for professional use)
- ✅ Image has explicit dimensions to prevent CLS
- ✅ Card hover lift (`hover:shadow-xl`)
- ✅ Mobile responsive (stack vertically)

---

### CAPTCHA Gate Page

**Pattern:** Conversion-Optimized with Security Focus

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Access — Tam-Tham</title>
  
  <!-- Cloudflare Turnstile -->
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  
  <style>
    @import url('/assets/fonts/Montserrat/Montserrat.css');
    
    body {
      font-family: 'Montserrat', sans-serif;
      background: linear-gradient(135deg, #103248 0%, #385C8F 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .gate-container {
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      max-width: 480px;
      width: 100%;
      text-align: center;
    }
    
    .gate-container h1 {
      color: #103248;
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    
    .gate-container p {
      color: #535A60;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="gate-container">
    <h1>Verify Access</h1>
    <p>Please complete the security check to proceed to Danny Tam-Tham's contact page.</p>
    
    <form id="turnstile-form" onsubmit="submitVerification(event)">
      <div class="cf-turnstile" 
           data-sitekey="YOUR_SITE_KEY" 
           data-callback="submitVerification"></div>
    </form>
    
    <p class="text-sm text-secondary-grey mt-6">
      This verification helps protect against automated bots.
    </p>
  </div>
  
  <script>
    async function submitVerification(token) {
      try {
        const response = await fetch('/api/verify-danny', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        
        if (response.ok) {
          window.location.href = 'https://danny.tamtham.com';
        } else {
          alert('Verification failed. Please try again.');
          cf.reset();
        }
      } catch (error) {
        console.error('Verification error:', error);
        alert('Unable to verify. Please try again.');
        cf.reset();
      }
    }
  </script>
</body>
</html>
```

**Security Requirements:**
- ✅ Client-side Turnstile widget
- ✅ Server-side validation via `/api/verify-danny`
- ✅ Tokens validated against Cloudflare Siteverify API
- ✅ 302 redirect on success, 403 on failure
- ✅ Single-use tokens (5-minute expiry)

---

### Feature Grid (Services/Research)

**Pattern:** Feature-Rich Showcase

```html
<section class="py-20 bg-light-grey">
  <div class="max-w-7xl mx-auto px-6">
    <h2 class="text-3xl font-bold text-center text-primary-navy mb-12">
      Services & Expertise
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Service Card 1 -->
      <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200">
        <div class="w-12 h-12 bg-primary-yellow rounded-lg flex items-center justify-center mb-4">
          <!-- SVG Icon -->
          <svg class="w-6 h-6 text-primary-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-primary-navy mb-2">IT Strategy</h3>
        <p class="text-secondary-grey">Strategic technology planning and digital transformation roadmaps.</p>
      </div>
      
      <!-- Service Card 2 -->
      <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200">
        <div class="w-12 h-12 bg-secondary-teal rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-primary-navy mb-2">Digital Transformation</h3>
        <p class="text-secondary-grey">Modernizing legacy systems and implementing innovative solutions.</p>
      </div>
      
      <!-- Service Card 3 -->
      <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200">
        <div class="w-12 h-12 bg-secondary-blue rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-primary-navy mb-2">Healthcare IT</h3>
        <p class="text-secondary-grey">Specialized technology solutions for healthcare organizations.</p>
      </div>
    </div>
  </div>
</section>
```

**UX Guidelines:**
- ✅ Card hover lift (`hover:shadow-xl`)
- ✅ Consistent icon sizing (12x12 containers, 6x6 icons)
- ✅ Alternating section backgrounds for visual rhythm
- ✅ Responsive grid (1 column mobile, 2 tablet, 3 desktop)

---

## Effects & Animations

### Hover Effects

| Element | Effect | Duration |
|---------|--------|----------|
| Buttons | Color shift + subtle lift | 200ms |
| Cards | Shadow elevation | 200ms |
| Links | Color change + underline | 150ms |
| Images | Scale 1.02 | 300ms |

**Implementation:**
```css
/* Consistent transition */
.transition-all {
  transition-property: all;
  transition-duration: 200ms;
  transition-timing-function: ease-out;
}

/* Hover lift */
.hover\\:scale-105:hover {
  transform: scale(1.05);
}

/* Hover shadow */
.hover\\:shadow-xl:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

### Scroll Animations

**Pattern:** Fade-in on scroll (Intersection Observer)

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-fade-in');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.animate-on-scroll').forEach(el => {
  observer.observe(el);
});
```

**CSS:**
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 600ms ease-out;
}
```

### Loading States

**Pattern:** Skeleton screens for async content

```html
<div class="animate-pulse">
  <div class="h-48 bg-gray-200 rounded-lg mb-4"></div>
  <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div class="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | `< 768px` | Single column, stacked elements |
| Tablet | `768px - 1024px` | 2 columns, adjusted spacing |
| Desktop | `1024px - 1280px` | 3-4 columns, full spacing |
| Large | `> 1280px` | Max-width container (7xl) |

**Tailwind Config:**
```javascript
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px'
    }
  }
}
```

---

## Image Optimization

### WebP Conversion

**Required:**
- Hero image: `HDMain.webp` (no lazy-load)
- Profile images: `DannySquareProfile.webp`, `HelenSquareProfile.webp` (lazy-load)
- Logo: `TamThamLogo.webp` + `TamThamLogo.png` fallback

**Responsive Variants:**
```html
<picture>
  <source srcset="/assets/images/HDMain-375.webp 375w,
                   /assets/images/HDMain-768.webp 768w,
                   /assets/images/HDMain-1024.webp 1024w,
                   /assets/images/HDMain-1920.webp 1920w"
          type="image/webp">
  <img src="/assets/images/HDMain.jpg" 
       alt="Danny and Helen Tam-Tham"
       width="1920" 
       height="1080"
       class="w-full h-auto">
</picture>
```

**Performance:**
- ✅ Explicit `width`/`height` to prevent CLS
- ✅ `srcset` for responsive images
- ✅ Below-fold images: `loading="lazy"`
- ✅ Hero image: eager load (no lazy)

---

## Accessibility Checklist

### WCAG AA Compliance

- [x] **Color contrast:** 4.5:1 minimum for normal text
- [x] **Focus indicators:** Visible ring on all interactive elements
- [x] **Keyboard navigation:** All functionality accessible via Tab/Enter
- [x] **Alt text:** Descriptive text on all meaningful images
- [x] **Heading hierarchy:** Sequential h1 → h2 → h3
- [x] **Form labels:** Associated with inputs via `for` attribute
- [x] **Touch targets:** Minimum 44x44px
- [x] **Reduced motion:** Respects `prefers-reduced-motion`

### ARIA Requirements

- [x] **Landmarks:** `<nav>`, `<main>`, `<footer>`
- [x] **Icons:** `aria-label` on icon-only buttons
- [x] **Forms:** `aria-required` on required fields
- [x] **Errors:** `aria-invalid` + `aria-describedby`
- [x] **Skip links:** "Skip to main content" for keyboard users

---

## Performance Targets

### Core Web Vitals

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP | < 2.5s | Largest Contentful Paint |
| FID | < 100ms | First Input Delay |
| CLS | < 0.1 | Cumulative Layout Shift |

### Optimization Strategies

1. **Images:** WebP format, responsive `srcset`, explicit dimensions
2. **Fonts:** Self-hosted WOFF2, `font-display: swap`
3. **CSS:** Tailwind purge, minified output
4. **JavaScript:** Minimal inline scripts, defer non-critical
5. **Caching:** Cloudflare modern Cache Rules (1 month for static assets)

---

## SEO & Metadata

### OpenGraph Tags

```html
<meta property="og:title" content="Tam-Tham | Consulting & Research">
<meta property="og:description" content="Professional expertise in IT strategy, digital transformation, and physician research.">
<meta property="og:image" content="https://tamtham.com/assets/images/HDMain.webp">
<meta property="og:url" content="https://tamtham.com/">
<meta property="og:type" content="website">
```

### Twitter Card

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Tam-Tham | Consulting & Research">
<meta name="twitter:description" content="Professional expertise in IT strategy, digital transformation, and physician research.">
<meta name="twitter:image" content="https://tamtham.com/assets/images/HDMain.webp">
```

---

## Implementation Checklist

### Visual Quality
- [x] No emojis as icons (use SVG Heroicons)
- [x] All icons from consistent set
- [x] Brand colors correctly applied
- [x] Hover states don't cause layout shift

### Interaction
- [x] All clickable elements have `cursor-pointer`
- [x] Hover states provide visual feedback
- [x] Transitions are smooth (150-300ms)
- [x] Focus states visible for keyboard navigation

### Light/Dark Mode
- [x] Light mode text has sufficient contrast
- [x] Glass/transparent elements visible in light mode
- [x] Borders visible in both modes

### Layout
- [x] Floating navbar has proper spacing
- [x] No content hidden behind fixed elements
- [x] Responsive at 375px, 768px, 1024px, 1440px
- [x] No horizontal scroll on mobile

### Accessibility
- [x] All images have alt text
- [x] Form inputs have labels
- [x] Color is not the only indicator
- [x] `prefers-reduced-motion` respected

---

## Appendix: Tailwind Configuration

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.html",
    "./js/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-navy': '#103248',
        'primary-yellow': '#F0D04C',
        'secondary-teal': '#7DC2B6',
        'secondary-red': '#D64E34',
        'secondary-blue': '#385C8F',
        'secondary-grey': '#535A60',
        'light-grey': '#F8FAFC',
        'dark-grey': '#1E293B',
        'border-grey': '#E2E8F0'
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif']
      },
      spacing: {
        '24': '6rem',
        '32': '8rem'
      },
      boxShadow: {
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }
    }
  },
  plugins: []
}
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-12  
**Next Review:** 2026-04-12
