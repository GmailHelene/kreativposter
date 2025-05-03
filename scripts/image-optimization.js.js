// optimize-images.js
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const imageminGifsicle = require('imagemin-gifsicle');
const imageminWebp = require('imagemin-webp');
const glob = require('glob');
const path = require('path');
const fs = require('fs');

// Konfigurer bildekomprimering
const config = {
  sourceFolders: ['public/images', 'src/assets/images'],
  outputSuffix: '.optimized', // Tom streng for å overskrive originaler, eller f.eks. '.min' for å lage nye filer
  quality: {
    png: [0.6, 0.8], // Kvalitetsområde for PNG (0-1)
    jpg: 80, // Kvalitet for JPEG (0-100)
  },
  // Sett til true for å aktivere WebP-konvertering i tillegg til optimalisering
  convertToWebP: true,
  // Tørrkjøringsmodus (ingen endringer gjøres)
  dryRun: false,
};

// Statistikk for rapportering
const stats = {
  processed: 0,
  optimized: 0,
  converted: 0,
  totalSaved: 0,
};

// Hjelpefunksjon for å finne bilder i en mappe
function findImagesInFolder(folder) {
  return new Promise((resolve, reject) => {
    glob(`${folder}/**/*.{jpg,jpeg,png,gif,svg}`, (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    });
  });
}

// Funksjon for å optimalisere bilder
async function optimizeImages(sourceFiles, quality, outputSuffix, convertToWebP) {
  for (const sourceFile of sourceFiles) {
    const directory = path.dirname(sourceFile);
    const filename = path.basename(sourceFile);
    const extension = path.extname(sourceFile).toLowerCase();
    const basename = path.basename(sourceFile, extension);

    // Opprett output-filnavn
    const outputFilename = `${basename}${outputSuffix}${extension}`;
    const outputPath = path.join(directory, outputFilename);

    try {
      // Få original filstørrelse
      const originalStats = fs.statSync(sourceFile);
      const originalSize = originalStats.size;

      console.log(`Optimizing: ${sourceFile}`);
      
      // Optimalisering basert på filtype
      if (config.dryRun) {
        console.log(`Would optimize ${sourceFile} to ${outputPath}`);
        continue;
      }

      const plugins = [];
      
      if (extension === '.jpg' || extension === '.jpeg') {
        plugins.push(imageminJpegtran({ progressive: true, quality }));
      } else if (extension === '.png') {
        plugins.push(imageminPngquant({ quality }));
      } else if (extension === '.svg') {
        plugins.push(imageminSvgo({
          plugins: [
            { removeViewBox: false },
            { removeDimensions: true },
            { cleanupIDs: false }
          ]
        }));
      } else if (extension === '.gif') {
        plugins.push(imageminGifsicle({
          optimizationLevel: 3,
          interlaced: true
        }));
      }

      if (plugins.length > 0) {
        const data = await imagemin([sourceFile], {
          destination: directory,
          plugins: plugins,
          glob: false
        });

        // Rename output file if needed
        if (outputSuffix) {
          fs.renameSync(path.join(directory, filename), outputPath);
        }

        // Get optimized file size
        const optimizedStats = fs.statSync(outputSuffix ? outputPath : sourceFile);
        const optimizedSize = optimizedStats.size;
        const saved = originalSize - optimizedSize;
        const percentage = Math.round((saved / originalSize) * 100);

        console.log(`Saved ${(saved / 1024).toFixed(2)} KB (${percentage}%) for ${sourceFile}`);
        
        stats.optimized++;
        stats.totalSaved += saved;

        // Convert to WebP if needed
        if (convertToWebP && (extension === '.jpg' || extension === '.jpeg' || extension === '.png')) {
          const webpFilename = `${basename}.webp`;
          const webpPath = path.join(directory, webpFilename);

          await imagemin([sourceFile], {
            destination: directory,
            plugins: [
              imageminWebp({ 
                quality: extension === '.png' ? quality[1] * 100 : quality 
              })
            ]
          });
          
          stats.converted++;
          console.log(`Created WebP version: ${webpPath}`);
        }
      }

      stats.processed++;
    } catch (error) {
      console.error(`Error optimizing ${sourceFile}:`, error);
    }
  }
}

// Hovedfunksjon
async function main() {
  try {
    console.log('Starting image optimization...');
    console.log(`Mode: ${config.dryRun ? 'Dry Run (no changes will be made)' : 'Live Run'}`);
    
    let allImages = [];
    
    // Samle alle bilder fra konfigurerte mapper
    for (const folder of config.sourceFolders) {
      const images = await findImagesInFolder(folder);
      allImages = [...allImages, ...images];
    }
    
    console.log(`Found ${allImages.length} images to optimize`);
    
    if (allImages.length === 0) {
      console.log('No images found. Please check your source folders configuration.');
      return;
    }
    
    // Optimaliser bildene
    await optimizeImages(
      allImages, 
      config.quality, 
      config.outputSuffix, 
      config.convertToWebP
    );
    
    // Vis statistikk
    console.log('\nOptimization completed!');
    console.log(`Images processed: ${stats.processed}`);
    console.log(`Images optimized: ${stats.optimized}`);
    console.log(`WebP conversions: ${stats.converted}`);
    console.log(`Total space saved: ${(stats.totalSaved / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (err) {
    console.error('Error during image optimization:', err);
    process.exit(1);
  }
}

// Kjør script
main();
