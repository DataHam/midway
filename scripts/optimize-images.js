#!/usr/bin/env node

/**
 * Image Optimization Script
 * Converts images to WebP format with responsive srcset variants
 * 
 * Usage:
 *   node optimize-images.js --input <dir> --output <dir>
 * 
 * Default:
 *   --input: ./Downloads/images
 *   --output: ./assets/images/optimized
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SIZES = [375, 768, 1024, 1920];
const QUALITY = 80;
const EFFORT = 4;

// Supported image extensions
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: path.join(process.cwd(), 'Downloads', 'images'),
    output: path.join(process.cwd(), 'assets', 'images', 'optimized')
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) {
      options.input = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      options.output = args[i + 1];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Image Optimization Script

Converts images to WebP format with responsive srcset variants.

Usage:
  node optimize-images.js [options]

Options:
  --input <dir>    Source directory containing images (default: ./Downloads/images)
  --output <dir>   Output directory for optimized WebP files (default: ./assets/images/optimized)
  --help, -h       Show this help message

Supported formats: JPG, JPEG, PNG, GIF

Output naming:
  originalname.webp          - Full size variant
  originalname-375.webp      - 375px width variant
  originalname-768.webp      - 768px width variant
  originalname-1024.webp     - 1024px width variant
  originalname-1920.webp     - 1920px width variant
`);
      process.exit(0);
    }
  }

  return options;
}

/**
 * Generate a single WebP variant at specified width
 */
async function generateVariant(inputPath, outputPath, targetWidth) {
  const metadata = await sharp(inputPath).metadata();
  const { width, height } = metadata;

  // Calculate aspect-ratio-preserving height
  const aspectRatio = height / width;
  const targetHeight = Math.round(targetWidth * aspectRatio);

  // Generate variant path
  const baseName = path.basename(outputPath, path.extname(outputPath));
  const variantPath = path.join(
    path.dirname(outputPath),
    `${baseName}-${targetWidth}.webp`
  );

  // Process image with sharp
  await sharp(inputPath)
    .resize(targetWidth, targetHeight, {
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: QUALITY, effort: EFFORT })
    .toFile(variantPath);

  console.log(`  ✓ Generated: ${path.basename(variantPath)} (${targetWidth}px)`);

  return {
    src: `/assets/images/optimized/${path.basename(variantPath)}`,
    width: targetWidth
  };
}

/**
 * Optimize a single image file
 */
async function optimizeImage(inputPath, outputPath) {
  const relativePath = path.relative(
    path.join(process.cwd(), 'Downloads', 'images'),
    inputPath
  );
  
  console.log(`\nProcessing: ${relativePath}`);

  // Generate all size variants
  const variants = await Promise.all(
    SIZES.map(width => generateVariant(inputPath, outputPath, width))
  );

  console.log(`  ✓ Completed: ${path.basename(outputPath)}`);

  return variants;
}

/**
 * Scan directory for supported image files
 */
function scanImages(inputDir) {
  if (!fs.existsSync(inputDir)) {
    throw new Error(`Input directory does not exist: ${inputDir}`);
  }

  const files = fs.readdirSync(inputDir);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(ext);
  });

  if (imageFiles.length === 0) {
    console.log('No supported image files found in input directory.');
    return [];
  }

  console.log(`Found ${imageFiles.length} image(s) to process.`);
  return imageFiles.map(file => path.join(inputDir, file));
}

/**
 * Main execution function
 */
async function main() {
  try {
    const options = parseArgs();

    // Ensure output directory exists
    if (!fs.existsSync(options.output)) {
      fs.mkdirSync(options.output, { recursive: true });
      console.log(`Created output directory: ${options.output}`);
    }

    // Scan for images
    const imageFiles = scanImages(options.input);

    if (imageFiles.length === 0) {
      console.log('No images to process. Exiting.');
      process.exit(0);
    }

    // Process each image
    let processed = 0;
    for (const inputPath of imageFiles) {
      const baseName = path.basename(inputPath, path.extname(inputPath));
      const outputPath = path.join(options.output, `${baseName}.webp`);
      
      await optimizeImage(inputPath, outputPath);
      processed++;
    }

    console.log(`\n✓ Optimization complete: ${processed} image(s) processed.`);
    console.log(`Output directory: ${options.output}`);
    process.exit(0);

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = {
  optimizeImage,
  generateVariant,
  scanImages,
  parseArgs,
  main
};

// Run if executed directly
if (require.main === module) {
  main();
}
