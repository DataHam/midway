import sharp from 'sharp';
import fs from 'fs';

const input = 'assets/images/optimized/TamThamLogo-1024.webp';
const outDir = 'assets/images/favicons';

async function processLogo() {
  const { width, height } = await sharp(input).metadata();
  
  // We take the original white-background image, and just apply a rounded rect mask.
  const svgMask = Buffer.from(`
    <svg width="${width}" height="${height}">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${width * 0.2}" ry="${height * 0.2}" fill="#ffffff" />
    </svg>
  `);
  
  const finalImage = sharp(input).composite([{ input: svgMask, blend: 'dest-in' }]);

  await finalImage.clone().resize(16, 16).png().toFile(`${outDir}/favicon-16x16.png`);
  await finalImage.clone().resize(32, 32).png().toFile(`${outDir}/favicon-32x32.png`);
  await finalImage.clone().resize(180, 180).png().toFile(`${outDir}/apple-touch-icon.png`);
  fs.copyFileSync(`${outDir}/favicon-32x32.png`, `${outDir}/favicon.ico`);
  
  console.log('Favicons generated with rounded white background');
}

processLogo().catch(console.error);
