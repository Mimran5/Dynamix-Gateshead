const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../public/images/classes');
const outputDir = path.join(__dirname, '../public/images/classes/optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all PNG files from the input directory
const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.png'));

async function optimizeImages() {
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    try {
      // Get the original file size
      const stats = fs.statSync(inputPath);
      const originalSize = stats.size;

      // Optimize the image
      await sharp(inputPath)
        .resize(800, 600, { // Resize to a reasonable size
          fit: 'cover',
          position: 'center'
        })
        .png({ // Convert to PNG with optimization
          quality: 80,
          compressionLevel: 9
        })
        .toFile(outputPath);

      // Get the optimized file size
      const optimizedStats = fs.statSync(outputPath);
      const optimizedSize = optimizedStats.size;
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);

      console.log(`${file}: ${(originalSize / 1024).toFixed(2)}KB -> ${(optimizedSize / 1024).toFixed(2)}KB (${savings}% smaller)`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
}

optimizeImages().catch(console.error); 