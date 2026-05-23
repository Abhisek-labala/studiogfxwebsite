const PSD = require('psd');
const path = require('path');

const psdPath = process.argv[2];
const pngPath = process.argv[3];

if (!psdPath || !pngPath) {
  console.error('Usage: node convert_psd.js <psdPath> <pngPath>');
  process.exit(1);
}

PSD.open(psdPath).then((psd) => {
  return psd.image.saveAsPng(pngPath);
}).then(() => {
  console.log('PSD conversion complete!');
  process.exit(0);
}).catch((err) => {
  console.error('PSD conversion failed:', err);
  process.exit(1);
});
