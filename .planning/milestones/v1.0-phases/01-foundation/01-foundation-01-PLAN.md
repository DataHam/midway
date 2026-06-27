---
phase: 01-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - postcss.config.js
  - src/css/input.css
  - .gitignore
autonomous: true
requirements:
  - DESIGN-01
  - DESIGN-02
  - DESIGN-03
  - DESIGN-04
must_haves:
  truths:
    - "Tailwind CSS v4 uses CSS @theme directive instead of tailwind.config.js"
    - "Brand colors are configured as CSS custom properties in @theme"
    - "Montserrat WOFF2 fonts are self-hosted with @font-face"
    - "Typography scale uses CSS variables for consistency"
    - "No Google Fonts CDN requests in network tab"
  artifacts:
    - path: "package.json"
      provides: "Project configuration with Tailwind v4 and sharp dependencies"
      exports: ["scripts", "devDependencies"]
    - path: "src/css/input.css"
      provides: "Tailwind entry point with @theme directive and @font-face declarations"
      contains: ["@import \"tailwindcss\"", "@theme", "@font-face"]
    - path: "postcss.config.js"
      provides: "PostCSS plugin configuration for Tailwind v4"
      exports: ["plugins"]
  key_links:
    - from: "src/css/input.css"
      to: "package.json"
      via: "npm install tailwindcss @tailwindcss/node postcss"
      pattern: "npm install.*tailwindcss"
    - from: "src/css/input.css"
      to: "assets/fonts/Montserrat/"
      via: "@font-face url references"
      pattern: "@font-face.*src: url\\(\"/assets/fonts"
---

<objective>
Configure the Tailwind CSS v4 build pipeline with brand design system using CSS-first @theme approach.

Purpose: Establish the foundation for consistent styling across all pages using Tailwind v4's modern CSS configuration (no tailwind.config.js), self-hosted Montserrat fonts, and brand color palette.

Output: package.json, postcss.config.js, src/css/input.css with @theme directive, .gitignore
</objective>

<execution_context>
@C:/Users/DannyTam-Tham/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/DannyTam-Tham/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-foundation/01-foundation-RESEARCH.md

# Brand Colors (from RESEARCH.md - WCAG AA validated)
- Navy (Primary): #103248 — 12.8:1 contrast on white, usable for text
- Yellow (Accent): #F0D04C — 1.8:1 on white (FAILS), use on dark backgrounds
- Teal (Secondary): #7DC2B6 — 2.5:1 on white (FAILS), use on dark backgrounds
- Red: #D64E34 — Use for error states, CTAs
- Blue: #385C8F — Use for links, secondary accents
- Grey (Neutral): #535A60 — 7.8:1 on white, usable for body text

# Font Weights (Montserrat mapping)
- Regular: 400
- SemiBold: 600
- Bold: 700

# Tailwind v4 Pattern (from RESEARCH.md)
```css
@import "tailwindcss";

@theme {
  --color-navy: #103248;
  --color-yellow: #F0D04C;
  --color-teal: #7DC2B6;
  --color-red: #D64E34;
  --color-blue: #385C8F;
  --color-grey: #535A60;
  
  --font-montserrat: "Montserrat", ui-sans-serif, system-ui, sans-serif;
  
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  
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
  /* ... other weights */
}
```
</context>

<interfaces>
<!-- Key types and contracts the executor needs. Extracted from research. -->
<!-- Executor should use these directly — no codebase exploration needed. -->

From .planning/phases/01-foundation/01-foundation-RESEARCH.md:
```css
/* Tailwind v4 @theme directive pattern */
@theme {
  /* Brand Colors - all 6 colors */
  --color-navy: #103248;
  --color-yellow: #F0D04C;
  --color-teal: #7DC2B6;
  --color-red: #D64E34;
  --color-blue: #385C8F;
  --color-grey: #535A60;
  
  /* Font Family */
  --font-montserrat: "Montserrat", ui-sans-serif, system-ui, sans-serif;
  
  /* Typography Scale - 8 levels */
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

From postcss.config.js pattern:
```javascript
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
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Initialize project with package.json and dependencies</name>
  <files>package.json</files>
  <action>
Create package.json with the following configuration:

{
  "name": "tam-tham-website",
  "version": "1.0.0",
  "description": "Tam-Tham professional website",
  "private": true,
  "scripts": {
    "dev": "tailwindcss -i ./src/css/input.css -o ./static/css/styles.css --watch",
    "build": "tailwindcss -i ./src/css/input.css -o ./static/css/styles.css",
    "optimize-images": "node scripts/optimize-images.js"
  },
  "devDependencies": {
    "@tailwindcss/node": "^4.2.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "postcss-import": "^16.1.0",
    "sharp": "^0.33.5",
    "tailwindcss": "^4.2.0"
  }
}

Note: Use @tailwindcss/node and tailwindcss v4 (not v3), sharp for image optimization, postcss-import for CSS imports.
</action>
<verify>
grep -q '"tailwindcss"' package.json && grep -q '"sharp"' package.json && grep -q '"@tailwindcss/node"' package.json
</verify>
<done>
package.json exists with Tailwind v4 dependencies (@tailwindcss/node, tailwindcss, sharp) and build scripts configured
</done>
</task>

<task type="auto">
  <name>Task 2: Configure PostCSS for Tailwind v4</name>
  <files>postcss.config.js</files>
  <action>
Create postcss.config.js with the following plugins for Tailwind v4:

```javascript
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

Use require() syntax for CommonJS compatibility. Include all 5 plugins in this exact order.
</action>
<verify>
grep -q "@tailwindcss/node" postcss.config.js && grep -q "autoprefixer" postcss.config.js
</verify>
<done>
postcss.config.js exists with all 5 Tailwind v4 plugins configured in correct order
</done>
</task>

<task type="auto">
  <name>Task 3: Create Tailwind CSS entry with @theme directive</name>
  <files>src/css/input.css</files>
  <action>
Create src/css/input.css with the following structure:

```css
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

Do NOT use tailwind.config.js - use CSS @theme directive (Tailwind v4 pattern).
</action>
<verify>
grep -q '@import "tailwindcss"' src/css/input.css && grep -q '@theme' src/css/input.css && grep -q '@font-face' src/css/input.css
</verify>
<done>
src/css/input.css created with @import tailwindcss, @theme directive containing all brand colors and Montserrat @font-face declarations
</done>
</task>

<task type="auto">
  <name>Task 4: Create .gitignore and project structure</name>
  <files>.gitignore</files>
  <action>
Create .gitignore with the following exclusions:

```
# Dependencies
node_modules/

# Build output
dist/
static/css/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local
.env.*.local

# Coverage
coverage/

# Temp
*.tmp
*.temp
```

Create empty directories: src/css/, assets/fonts/Montserrat/, assets/images/
</action>
<verify>
test -f .gitignore && grep -q "node_modules" .gitignore && test -d src/css && test -d assets/fonts/Montserrat
</verify>
<done>
.gitignore created with standard Node.js/Next.js exclusions and empty directory structure created
</done>
</task>

</tasks>

<verification>
- package.json exists with Tailwind v4 dependencies (@tailwindcss/node, tailwindcss, sharp)
- postcss.config.js has all 5 plugins configured
- src/css/input.css has @import tailwindcss, @theme directive, @font-face declarations
- .gitignore excludes node_modules, dist/, static/css/
- npm install runs without errors
- No tailwind.config.js file exists (CSS-first approach)
</verification>

<success_criteria>
- [ ] npm install completes successfully
- [ ] npm run dev starts Tailwind watch mode without errors
- [ ] src/css/input.css contains all 6 brand colors as CSS variables
- [ ] Montserrat @font-face declarations for weights 400, 600, 700
- [ ] No Google Fonts CDN references anywhere
- [ ] No tailwind.config.js file present (CSS-first approach)
- [ ] Lighthouse accessibility score ≥ 90 (after HTML pages added)
</success_criteria>

<output>
After completion, create .planning/phases/01-foundation/01-foundation-01-SUMMARY.md
</output>
