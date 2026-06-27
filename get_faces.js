import sharp from 'sharp';
async function analyze() {
  const info = await sharp('assets/images/optimized/DHFamily-1280.webp').metadata();
  console.log(`Image size: ${info.width}x${info.height}`);
}
analyze();
