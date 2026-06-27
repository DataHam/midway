import sharp from 'sharp';
import fs from 'fs';

const input = 'assets/images/optimized/TamThamLogo-1024.webp';
const outDir = 'assets/images/favicons';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Create a transparent background image from the webp logo by making white pixels transparent
async function processLogo() {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Make white pixels transparent (R>240, G>240, B>240)
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) {
      data[i+3] = 0; // Set alpha to 0
    }
  }

  const transparentImg = sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  });

  await transparentImg.clone().resize(16, 16).png().toFile(`${outDir}/favicon-16x16.png`);
  await transparentImg.clone().resize(32, 32).png().toFile(`${outDir}/favicon-32x32.png`);
  // apple-touch-icon usually expects a solid background, but transparent is okay, or we can add a padding
  await transparentImg.clone().resize(180, 180).png().toFile(`${outDir}/apple-touch-icon.png`);
  
  // Create a 32x32 ico file (just copying the png, many browsers support this)
  fs.copyFileSync(`${outDir}/favicon-32x32.png`, `${outDir}/favicon.ico`);
  console.log('Favicons generated with transparent background');
}

processLogo().catch(console.error);
