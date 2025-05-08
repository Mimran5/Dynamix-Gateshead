import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const images = {
  hero: {
    hero: 'https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg' // Modern gym interior
  }
};

async function downloadAndOptimizeImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        try {
          // Optimize image
          await sharp(buffer)
            .resize(1200, 800, {
              fit: 'cover',
              position: 'center'
            })
            .jpeg({
              quality: 80,
              progressive: true
            })
            .toFile(outputPath);
          console.log(`Downloaded and optimized: ${outputPath}`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  // Create directories if they don't exist
  const baseDir = path.join(__dirname, '..', 'src', 'assets', 'images');
  for (const category of Object.keys(images)) {
    const dir = path.join(baseDir, category);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Download and optimize images
  for (const [category, categoryImages] of Object.entries(images)) {
    for (const [name, url] of Object.entries(categoryImages)) {
      const outputPath = path.join(baseDir, category, `${name}.jpg`);
      try {
        await downloadAndOptimizeImage(url, outputPath);
      } catch (error) {
        console.error(`Error processing ${name}:`, error);
      }
    }
  }
}

main().catch(console.error); 