import sharp from 'sharp';
import fs from 'fs';

const input = 'assets/images/optimized/TamThamLogo-1024.webp';
const outDir = 'assets/images/favicons';

async function processLogo() {
  const { width, height } = await sharp(input).metadata();
  
  // Make white pixels transparent first
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) {
      data[i+3] = 0; // transparent
    }
  }

  const transparentImgBuf = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels }
  }).png().toBuffer();

  // Create a white image of the EXACT same size
  const whiteBg = await sharp({
    create: {
      width: info.width,
      height: info.height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  }).png().toBuffer();

  // Composite the transparent logo onto the white background.
  // Wait, if it's just a white square, that's what the original image is!
  // To make it rounded, we need a mask.
  // Let's just create an SVG mask of the EXACT dimensions.
  const svgMask = Buffer.from(`
    <svg width="${info.width}" height="${info.height}" viewBox="0 0 ${info.width} ${info.height}">
      <rect x="0" y="0" width="${info.width}" height="${info.height}" rx="${info.width * 0.15}" ry="${info.height * 0.15}" fill="#ffffff" />
    </svg>
  `);

  const finalImg = sharp(whiteBg)
    .composite([
      { input: transparentImgBuf },
      { input: svgMask, blend: 'dest-in' }
    ]);

  await finalImg.clone().resize(16, 16).png().toFile(`${outDir}/favicon-16x16.png`);
  await finalImg.clone().resize(32, 32).png().toFile(`${outDir}/favicon-32x32.png`);
  await finalImg.clone().resize(180, 180).png().toFile(`${outDir}/apple-touch-icon.png`);
  fs.copyFileSync(`${outDir}/favicon-32x32.png`, `${outDir}/favicon.ico`);
  
  console.log('Favicons generated with rounded white background');
}

processLogo().catch(console.error);
