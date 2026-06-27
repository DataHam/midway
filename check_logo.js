import sharp from 'sharp';
async function analyze() {
  const { data, info } = await sharp('assets/images/optimized/TamThamLogo-1024.webp').raw().toBuffer({ resolveWithObject: true });
  // Find a non-white pixel
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i] < 240 || data[i+1] < 240 || data[i+2] < 240) {
      console.log(`First non-white pixel is RGB: ${data[i]}, ${data[i+1]}, ${data[i+2]}`);
      break;
    }
  }
}
analyze();
