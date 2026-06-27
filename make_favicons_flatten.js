import sharp from 'sharp';
import fs from 'fs';

const input = 'assets/images/optimized/TamThamLogo-1024.webp';
const outDir = 'assets/images/favicons';

async function processLogo() {
  const finalImg = sharp(input).flatten({ background: '#F1F3F4' });

  await finalImg.clone().resize(16, 16).png().toFile(`${outDir}/favicon-16x16.png`);
  await finalImg.clone().resize(32, 32).png().toFile(`${outDir}/favicon-32x32.png`);
  await finalImg.clone().resize(180, 180).png().toFile(`${outDir}/apple-touch-icon.png`);
  fs.copyFileSync(`${outDir}/favicon-32x32.png`, `${outDir}/favicon.ico`);
  
  console.log('Favicons generated with solid background');
}

processLogo().catch(console.error);
