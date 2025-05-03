// cleanup.js
// Dette scriptet rydder opp i kodebasen ved å fjerne console.log, unødvendige kommentarer og ubrukt kode
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Konfigurer hvilke mapper og filer som skal inkluderes/ekskluderes
const config = {
  include: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
  exclude: ['node_modules/**', 'build/**', 'dist/**', '**/*.test.js', '**/*.spec.js'],
  // Kommenter ut denne linjen for å kjøre i tørrkjøringsmodus (ingen endringer gjøres)
  // dryRun: true
};

// Regex-mønstre for å identifisere ting som skal fjernes
const patterns = {
  consoleLog: /console\.(log|debug|info)\s*\([^;]*\);?/g,
  todoComments: /\/\/\s*TODO:.*$/gm,
  debugComments: /\/\/\s*DEBUG:.*$/gm,
  unusedImports: /import\s+{([^}]*)}\s+from\s+['"][^'"]+['"];?/g,
  emptyLines: /^\s*[\r\n]/gm,
  multipleEmptyLines: /[\r\n]{3,}/g,
};

// Statistikk over endringer
const stats = {
  filesProcessed: 0,
  consoleLogsRemoved: 0,
  todosRemoved: 0,
  unusedImportsFixed: 0,
};

// Hjelpefunksjon for å finne filer
function findFiles() {
  return new Promise((resolve, reject) => {
    const includePatterns = config.include;
    const excludePatterns = config.exclude;
    
    // Konverter exclude-mønstre til minimatch-negasjonsmønstre
    const negatedExcludePatterns = excludePatterns.map(pattern => `!${pattern}`);
    
    // Kombiner include og exclude
    const patterns = [...includePatterns, ...negatedExcludePatterns];
    
    glob(patterns.length > 1 ? `{${patterns.join(',')}}` : patterns[0], (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    });
  });
}

// Hovedfunksjon for å rydde opp i en fil
function cleanupFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Lag en kopi av originalen for sammenligning
      const originalContent = content;
      
      // Fjern console.log statements
      const consoleMatches = content.match(patterns.consoleLog) || [];
      content = content.replace(patterns.consoleLog, '');
      stats.consoleLogsRemoved += consoleMatches.length;
      
      // Fjern TODO-kommentarer
      const todoMatches = content.match(patterns.todoComments) || [];
      content = content.replace(patterns.todoComments, '');
      stats.todosRemoved += todoMatches.length;
      
      // Fjern DEBUG-kommentarer
      content = content.replace(patterns.debugComments, '');
      
      // Fiks ubrukte imports - mer kompleks, krever analyse
      content = content.replace(patterns.unusedImports, (match, importList) => {
        // Split importlisten på komma, og filtrer ut imports som er markert som ubrukte
        const imports = importList.split(',').map(imp => imp.trim());
        const filteredImports = imports.filter(imp => {
          // Sjekk om importen er markert som ubrukt med en // unused kommentar
          return !imp.includes('// unused') && !imp.includes('//unused');
        });
        
        stats.unusedImportsFixed += imports.length - filteredImports.length;
        
        // Hvis alle imports ble fjernet, returner tom streng for å fjerne hele import-uttrykket
        if (filteredImports.length === 0) {
          return '';
        }
        
        // Ellers, rekonstruer import-uttrykket med de filtrerte importene
        return match.replace(importList, filteredImports.join(', '));
      });
      
      // Fikse tomme linjer
      content = content.replace(patterns.emptyLines, '');
      content = content.replace(patterns.multipleEmptyLines, '\n\n');
      
      // Hvis innholdet ble endret, skriv det tilbake til filen
      if (content !== originalContent) {
        if (config.dryRun) {
          console.log(`Would modify: ${filePath}`);
          console.log(`- ${consoleMatches.length} console.log statements`);
          console.log(`- ${todoMatches.length} TODO comments`);
          resolve();
        } else {
          fs.writeFile(filePath, content, 'utf8', (err) => {
            if (err) {
              reject(err);
              return;
            }
            console.log(`Modified: ${filePath}`);
            console.log(`- Removed ${consoleMatches.length} console.log statements`);
            console.log(`- Removed ${todoMatches.length} TODO comments`);
            resolve();
          });
        }
      } else {
        console.log(`No changes needed: ${filePath}`);
        resolve();
      }
    });
  });
}

// Hovedfunksjon
async function main() {
  try {
    console.log('Starting code cleanup...');
    console.log(`Mode: ${config.dryRun ? 'Dry Run (no changes will be made)' : 'Live Run'}`);
    
    // Finn filer
    const files = await findFiles();
    console.log(`Found ${files.length} files to process`);
    
    // Behandle hver fil
    for (const file of files) {
      await cleanupFile(file);
      stats.filesProcessed++;
    }
    
    console.log('\nCleanup completed!');
    console.log(`Files processed: ${stats.filesProcessed}`);
    console.log(`Console logs removed: ${stats.consoleLogsRemoved}`);
    console.log(`TODOs removed: ${stats.todosRemoved}`);
    console.log(`Unused imports fixed: ${stats.unusedImportsFixed}`);
    
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

// Kjør hovedfunksjonen
main();
