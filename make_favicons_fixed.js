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

  const transparentImg = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels }
  }).png().toBuffer();

  // Create SVG background (white circle)
  const svgBg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <circle cx="${width/2}" cy="${height/2}" r="${width/2 - 10}" fill="#ffffff" />
    </svg>
  `);

  const finalImg = sharp(svgBg).composite([{ input: transparentImg }]);

  await finalImg.clone().resize(16, 16).png().toFile(`${outDir}/favicon-16x16.png`);
  await finalImg.clone().resize(32, 32).png().toFile(`${outDir}/favicon-32x32.png`);
  await finalImg.clone().resize(180, 180).png().toFile(`${outDir}/apple-touch-icon.png`);
  fs.copyFileSync(`${outDir}/favicon-32x32.png`, `${outDir}/favicon.ico`);
  
  console.log('Favicons generated with white circle background');
}

processLogo().catch(console.error);
