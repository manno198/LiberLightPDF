import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../public/Llight.png');
const outputDir = path.join(__dirname, '../public');

const sizes = [16, 48, 128];

sizes.forEach(size => {
  sharp(inputPath)
    .resize(size, size)
    .toFile(path.join(outputDir, `icon${size}.png`))
    .then(() => {
      console.log(`icon${size}.png created.`);
    })
    .catch(err => {
      console.error(`Error creating icon${size}.png:`, err);
    });
}); 