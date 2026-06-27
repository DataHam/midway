---
phase: 01-foundation
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - scripts/optimize-images.js
  - assets/fonts/Montserrat/README.md
  - assets/images/README.md
  - assets/images/optimized/
autonomous: true
requirements:
  - IMG-01
  - IMG-02
  - IMG-03
  - IMG-04
  - IMG-05
must_haves:
  truths:
    - "All images are converted to WebP format for optimal compression"
    - "4 responsive srcset variants exist (375, 768, 1024, 1920px) per source image"
    - "Hero images have explicit width/height and fetchpriority=\"high\""
    - "Below-fold images have loading=\"lazy\" attribute"
    - "All images have explicit width/height to prevent CLS"
  artifacts:
    - path: "scripts/optimize-images.js"
      provides: "Image optimization script using sharp library"
      exports: ["optimizeImage", "main"]
    - path: "assets/fonts/Montserrat/README.md"
      provides: "Instructions for adding WOFF2 font files"
      contains: ["Montserrat-Regular.woff2", "Montserrat-SemiBold.woff2", "Montserrat-Bold.woff2"]
    - path: "assets/images/README.md"
      provides: "Instructions for image optimization workflow"
      contains: ["WebP variants", "srcset naming convention"]
    - path: "assets/images/optimized/"
      provides: "Output directory for optimized WebP images"
      contains: ["*.webp", "*-375.webp", "*-768.webp", "*-1024.webp", "*-1920.webp"]
  key_links:
    - from: "scripts/optimize-images.js"
      to: "package.json"
      via: "npm install sharp"
      pattern: "npm install.*sharp"
    - from: "assets/images/optimized/"
      to: "pages/*.html"
      via: "srcset attribute references"
      pattern: "srcset=.*-375\\.webp"
---

<objective>
Create image optimization infrastructure to convert assets to WebP format with responsive srcset variants and proper loading attributes.

Purpose: Establish automated image processing pipeline using sharp library for WebP conversion, responsive srcset generation (375/768/1024/1920px), and documentation for asset workflow.

Output: scripts/optimize-images.js, assets/fonts/Montserrat/README.md, assets/images/README.md, assets/images/optimized/ directory
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

# Image Requirements (from RESEARCH.md)
- Format: WebP (25-34% smaller than JPEG at equivalent quality)
- Sizes: 375px, 768px, 1024px, 1920px (width descriptors)
- Quality: 80 (baseline, test 70/80/90 visually)
- Hero images: fetchpriority="high", NO lazy attribute
- Below-fold images: loading="lazy", decoding="async"
- All images: explicit width/height attributes (prevent CLS)

# Sharp API Pattern (from RESEARCH.md)
```javascript
const sharp = require('sharp');

await sharp(inputPath)
  .resize(targetWidth, targetHeight, {
    fit: 'cover',
    position: 'center'
  })
  .webp({ quality: 80, effort: 4 })
  .toFile(variantPath);
```

# srcset Syntax (from RESEARCH.md)
```html
<!-- CORRECT: width descriptor -->
<img srcset="img-375.webp 375w, img-768.webp 768w">

<!-- WRONG: density descriptor for 1x/2x -->
<img srcset="img@2x.webp 2x">
```

# Loading Strategies (from RESEARCH.md)
```html
<!-- Hero: Eager-Loaded -->
<img 
  src="/assets/images/hero-1920.webp"
  srcset="..."
  width="1920"
  height="1080"
  fetchpriority="high"
>

<!-- Below-Fold: Lazy-Loaded -->
<img 
  src="/assets/images/profile-768.webp"
  srcset="..."
  width="1024"
  height="1024"
  loading="lazy"
  decoding="async"
>
```
</context>

<interfaces>
<!-- Key types and contracts the executor needs. Extracted from research. -->
<!-- Executor should use these directly — no codebase exploration needed. -->

From .planning/phases/01-foundation/01-foundation-RESEARCH.md:
```javascript
// Image optimization script pattern
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

// srcset attribute generation
function generateSrcset(variants) {
  return variants.map(v => `${v.src} ${v.width}w`).join(', ');
}

// Usage
const variants = await optimizeImage('./Downloads/hero.jpg', './assets/images/hero.webp');
const srcset = generateSrcset(variants);
// Result: "/assets/images/hero-375.webp 375w, /assets/images/hero-768.webp 768w, ..."
```

From HTML image patterns:
```html
<!-- Hero (eager-loaded) -->
<img 
  src="/assets/images/hero-1920.webp"
  srcset="/assets/images/hero-375.webp 375w, /assets/images/hero-768.webp 768w, /assets/images/hero-1024.webp 1024w, /assets/images/hero-1920.webp 1920w"
  sizes="100vw"
  width="1920"
  height="1080"
  fetchpriority="high"
  alt="Hero description"
>

<!-- Below-fold (lazy-loaded) -->
<img 
  src="/assets/images/profile-768.webp"
  srcset="/assets/images/profile-375.webp 375w, /assets/images/profile-768.webp 768w, /assets/images/profile-1024.webp 1024w"
  sizes="(max-width: 640px) 375px, (max-width: 1024px) 768px, 1024px"
  width="1024"
  height="1024"
  loading="lazy"
  decoding="async"
  alt="Profile description"
>
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Create image optimization script</name>
  <files>scripts/optimize-images.js</files>
  <action>
Create scripts/optimize-images.js with the following functionality:

1. Use sharp library for image processing
2. Command-line arguments:
   - --input <dir>: Source directory (default: ./Downloads/images)
   - --output <dir>: Output directory (default: ./assets/images/optimized)
3. Scan input directory for images (jpg, jpeg, png, gif)
4. For each image:
   - Generate 4 variants at 375, 768, 1024, 1920px width
   - Maintain aspect ratio
   - Convert to WebP with quality=80, effort=4
   - Output naming: originalname.webp, originalname-375.webp, etc.
5. Log progress for each file
6. Return exit code 0 on success, 1 on error

Use the pattern from RESEARCH.md:
- sharp.resize() with fit: 'cover', position: 'center'
- sharp.webp({ quality: 80, effort: 4 })
- fs.readdirSync() for scanning
- path.join() for file paths

Do NOT include test files (TDD is for business logic, not config/scripts).
</action>
<verify>
node scripts/optimize-images.js --help 2>&1 | grep -q "input" && grep -q "sharp" scripts/optimize-images.js
</verify>
<done>
scripts/optimize-images.js created with sharp library, accepts --input and --output arguments, generates 4 WebP variants per source image
</done>
</task>

<task type="auto">
  <name>Task 2: Create assets directory structure with documentation</name>
  <files>
    assets/fonts/Montserrat/README.md
    assets/images/README.md
    assets/images/optimized/
  </files>
  <action>
Create directory structure with README.md files:

1. assets/fonts/Montserrat/README.md:
   - Instructions for adding WOFF2 font files
   - Required files: Montserrat-Regular.woff2, Montserrat-SemiBold.woff2, Montserrat-Bold.woff2
   - Note: Self-hosted only, no Google Fonts CDN (DESIGN-02)
   - Font weights: 400 (Regular), 600 (SemiBold), 700 (Bold)

2. assets/images/README.md:
   - Place original images here before optimization
   - Run: npm run optimize-images
   - Optimized WebP files go to assets/images/optimized/
   - Naming convention: originalname.webp, originalname-375.webp, originalname-768.webp, etc.
   - Hero images: eager-loaded with fetchpriority="high"
   - Below-fold images: lazy-loaded with loading="lazy"

3. assets/images/optimized/ (empty directory)
</action>
<verify>
test -d assets/fonts/Montserrat && test -d assets/images/optimized && grep -q "Montserrat-Regular.woff2" assets/fonts/Montserrat/README.md && grep -q "WebP" assets/images/README.md
</verify>
<done>
Directory structure created with documentation in README.md files covering font installation and image optimization workflow
</done>
</task>

<task type="auto">
  <name>Task 3: Create sample HTML template for image usage</name>
  <files>templates/sample-image.html</files>
  <action>
Create templates/sample-image.html demonstrating proper image usage patterns:

1. Hero image (eager-loaded):
   - srcset with 4 variants (375/768/1024/1920w)
   - explicit width="1920" height="1080"
   - fetchpriority="high"
   - NO loading="lazy" attribute

2. Below-fold image (lazy-loaded):
   - srcset with 3 variants (375/768/1024w)
   - explicit width="1024" height="1024"
   - loading="lazy"
   - decoding="async"
   - proper sizes attribute

3. Include comments explaining each attribute's purpose

Use patterns from RESEARCH.md for srcset syntax and loading strategies.
</action>
<verify>
grep -q 'fetchpriority="high"' templates/sample-image.html && grep -q 'loading="lazy"' templates/sample-image.html && grep -q 'srcset=' templates/sample-image.html
</verify>
<done>
templates/sample-image.html created demonstrating hero (eager) and below-fold (lazy) image patterns with srcset, width/height, and loading attributes
</done>
</task>

</tasks>

<verification>
- scripts/optimize-images.js runs without errors
- Script generates WebP files at 4 sizes (375, 768, 1024, 1920px)
- Sharp library functional (npm install sharp)
- Directory structure in place for fonts and images
- README.md files contain correct instructions
- Sample HTML template demonstrates proper image usage patterns
</verification>

<success_criteria>
- [ ] npm install sharp completes successfully
- [ ] scripts/optimize-images.js --help shows usage information
- [ ] Script can process a test image and generate 4 WebP variants
- [ ] assets/fonts/Montserrat/README.md exists with font file instructions
- [ ] assets/images/README.md exists with optimization workflow instructions
- [ ] assets/images/optimized/ directory exists
- [ ] templates/sample-image.html demonstrates hero (eager) and below-fold (lazy) patterns
- [ ] No Google Fonts CDN references anywhere
</success_criteria>

<output>
After completion, create .planning/phases/01-foundation/01-foundation-02-SUMMARY.md
</output>
