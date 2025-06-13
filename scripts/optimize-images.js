const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../public/images/classes');
const outputDir = path.join(__dirname, '../public/images/classes/optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all PNG files from input directory
const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.png'));

async function optimizeImages() {
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);
    
    try {
      // Get original file size
      const stats = fs.statSync(inputPath);
      const originalSize = stats.size / 1024; // Convert to KB
      
      // Optimize image
      await sharp(inputPath)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .png({ quality: 80, compressionLevel: 9 })
        .toFile(outputPath);
      
      // Get optimized file size
      const optimizedStats = fs.statSync(outputPath);
      const optimizedSize = optimizedStats.size / 1024; // Convert to KB
      
      console.log(`${file}: ${originalSize.toFixed(2)}KB -> ${optimizedSize.toFixed(2)}KB (${((1 - optimizedSize/originalSize) * 100).toFixed(2)}% smaller)`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
}

optimizeImages(); 