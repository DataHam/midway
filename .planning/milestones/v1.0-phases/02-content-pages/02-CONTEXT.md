# Phase 2: Content Pages - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the home page and both biography pages with proper navigation and content structure. This phase delivers:
- Home page (index.html) with hero section, logo, and 4 navigation cards
- Danny biography page (danny.html) with credentials, consulting services, and contact info
- Helen biography page (helen.html) with credentials, selected research, and contact info
- Navigation between all pages

**Out of scope:** CAPTCHA gates (Phase 3), security headers/SEO (Phase 4), deployment (Phase 5).
</domain>

<decisions>
## Implementation Decisions

### Navigation approach
- **Sticky navbar with floating spacing** (fixed top, backdrop blur, rounded corners)
- Links: Danny, Helen, Contact Danny (gate), Contact Helen (gate)
- Mobile: hamburger menu for small screens
- Active state indication on current page
- Add padding-top to body equal to nav height (`pt-24`)

### Hero section layout
- **Full-screen hero** (`min-h-screen`)
- HDMain.webp as background with navy overlay (`bg-primary-navy/60`)
- Logo centered, headline, subheadline
- 4-column CTA grid (responsive: 1 column mobile, 2 tablet, 4 desktop)
- CTA buttons with hover feedback (`transform hover:scale-105`)

### Bio page structure
- **Split layout** (image left, content right on desktop)
- Danny: profile image + credentials, consulting services, CV download
- Helen: profile image + credentials, selected research, CV download
- Mobile: stacked vertically (image on top)
- Profile image has explicit dimensions to prevent CLS

### Services/Research section
- **Card grid** (3 columns on desktop)
- Icon + title + description per card
- Hover lift effect (`hover:shadow-xl`)
- Consistent with design system patterns
- Danny: IT Strategy, Digital Transformation, Healthcare IT
- Helen: Selected Research placeholder section

### CV download buttons
- **Placeholder links** (`/assets/documents/cv-danny.pdf`, `/assets/documents/cv-helen.pdf`)
- Primary CTA style (yellow background, navy text)
- Hover state: color shift to secondary blue
- No meeting booking links (explicit exclusion per requirements)

### Claude's Discretion
- Exact heading text for hero headline/subheadline
- Specific icon choices for services section (SVG Heroicons)
- Loading skeleton design for async content
- Error state handling for CV downloads
- Mobile hamburger menu implementation details
</decisions>

<specifics>
## Specific Ideas

- "Sticky navbar should feel like Linear's navigation — clean, not cluttered"
- Hero overlay should ensure text readability on the family portrait background
- Cards should have subtle shadows, rounded corners — modern feel
- All clickable elements need visible focus states for keyboard navigation
- CV download buttons should be prominent but not overwhelming

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Tailwind config** (`tailwind.config.js`): Brand colors, Montserrat font family, custom spacing already configured
- **Image optimization script** (`scripts/optimize-images.js`): WebP conversion with responsive variants ready
- **Montserrat WOFF2 fonts**: Self-hosted files available in `assets/fonts/Montserrat/`
- **Design system patterns**: Card hover effects, button states, responsive breakpoints documented

### Established Patterns
- **Color system**: Primary Navy (`#103248`), Primary Yellow (`#F0D04C`), Secondary Teal (`#7DC2B6`), Secondary Blue (`#385C8F`), Secondary Grey (`#535A60`)
- **Typography scale**: H1 (3rem), H2 (2.25rem), H3 (1.5rem), H4 (1.25rem), Body (1.125rem), Small (1rem)
- **Hover effects**: 200ms transitions, color shift + subtle lift
- **Responsive breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Accessibility**: WCAG AA compliance, 4.5:1 contrast minimum, visible focus rings

### Integration Points
- **Navigation**: Links to `pages/danny.html`, `pages/helen.html`, `pages/verify-danny.html`, `pages/verify-helen.html`
- **Hero image**: `assets/images/HDMain.webp` (already optimized, no lazy-load)
- **Profile images**: `assets/images/DannySquareProfile.webp`, `assets/images/HelenSquareProfile.webp` (lazy-load)
- **Logo**: `assets/images/TamThamLogo.webp` + `TamThamLogo.png` fallback
- **CV documents**: `assets/documents/cv-danny.pdf`, `assets/documents/cv-helen.pdf` (placeholders)
- **Fonts**: Self-hosted Montserrat WOFF2 files (no Google Fonts CDN)

</code_context>

<deferred>
## Deferred Ideas

- Contact form submission — separate phase
- Social media share buttons — add to backlog
- Analytics tracking — Phase 4 or later
- Dark mode toggle — future enhancement
- Multi-language support — out of scope for v1

</deferred>

---

*Phase: 02-content-pages*
*Context gathered: 2026-03-13*
