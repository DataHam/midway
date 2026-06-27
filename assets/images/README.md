# Image Assets

## Workflow

### 1. Add Original Images

Place original images (JPG, PNG, GIF) in this directory before optimization.

### 2. Run Optimization

Execute the optimization script to convert images to WebP format:

```bash
node scripts/optimize-images.js
```

Or with custom paths:

```bash
node scripts/optimize-images.js --input ./Downloads/images --output ./assets/images/optimized
```

### 3. Optimized Output

Optimized WebP files are automatically placed in the `optimized/` subdirectory:

```
assets/images/
├── README.md
├── hero.jpg                    # Original (you add)
└── optimized/
    ├── hero.webp               # Full size
    ├── hero-375.webp           # 375px width
    ├── hero-768.webp           # 768px width
    ├── hero-1024.webp          # 1024px width
    └── hero-1920.webp          # 1920px width
```

## Naming Convention

The optimization script uses the following naming pattern:

- `{originalname}.webp` - Full resolution variant
- `{originalname}-{width}.webp` - Responsive variants (375, 768, 1024, 1920px)

## Image Loading Strategies

### Hero Images (Above the Fold)

Hero images should be **eager-loaded** for optimal Core Web Vitals:

```html
<img 
  src="/assets/images/optimized/hero-1920.webp"
  srcset="/assets/images/optimized/hero-375.webp 375w, 
          /assets/images/optimized/hero-768.webp 768w, 
          /assets/images/optimized/hero-1024.webp 1024w, 
          /assets/images/optimized/hero-1920.webp 1920w"
  sizes="100vw"
  width="1920"
  height="1080"
  fetchpriority="high"
  alt="Hero description"
>
```

**Attributes:**
- `fetchpriority="high"` - Tells browser to prioritize loading
- `width`/`height` - Prevents Cumulative Layout Shift (CLS)
- **NO** `loading="lazy"` - Must load immediately

### Below-Fold Images

Images below the initial viewport should be **lazy-loaded**:

```html
<img 
  src="/assets/images/optimized/profile-768.webp"
  srcset="/assets/images/optimized/profile-375.webp 375w, 
          /assets/images/optimized/profile-768.webp 768w, 
          /assets/images/optimized/profile-1024.webp 1024w"
  sizes="(max-width: 640px) 375px, (max-width: 1024px) 768px, 1024px"
  width="1024"
  height="1024"
  loading="lazy"
  decoding="async"
  alt="Profile description"
>
```

**Attributes:**
- `loading="lazy"` - Defers loading until visible
- `decoding="async"` - Async image decoding
- `width`/`height` - Prevents CLS

## Optimization Settings

The script uses the following settings for optimal WebP quality:

- **Quality:** 80 (good balance between size and quality)
- **Effort:** 4 (higher effort = better compression, slower processing)
- **Fit:** cover (maintains aspect ratio)
- **Position:** center (focus on center of image)

## Best Practices

1. **Use appropriate formats:**
   - Photos: JPG → WebP
   - Graphics with transparency: PNG → WebP
   - Simple graphics: PNG → WebP
   - Animations: GIF → WebP (note: WebP animation support is limited)

2. **Always specify width/height:** Prevents layout shift and improves Lighthouse scores

3. **Test visually:** Quality=80 works for most images, but test 70/80/90 visually for critical images

4. **Keep originals:** Don't delete source images until the site is live

5. **Hero images first:** Ensure hero images are optimized before deployment

## Verification

After optimization, verify the output:

```bash
ls -la assets/images/optimized/
```

Expected output shows WebP files at all four sizes.
