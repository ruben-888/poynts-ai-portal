/**
 * Build script for Chrome extension
 * Creates a zip file of the extension for distribution
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const EXTENSION_DIR = path.join(__dirname, '..', 'chrome-extension');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'extension');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'poynts-campaign-extension.zip');

// Files to include in the zip
const EXTENSION_FILES = [
  'manifest.json',
  'config.js',
  'content.js',
  'icons'
];

async function buildExtension() {
  console.log('📦 Building Chrome extension...');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`   Created output directory: ${OUTPUT_DIR}`);
  }

  // Remove existing zip if present
  if (fs.existsSync(OUTPUT_FILE)) {
    fs.unlinkSync(OUTPUT_FILE);
  }

  // Create zip archive
  const output = fs.createWriteStream(OUTPUT_FILE);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      const sizeKB = (archive.pointer() / 1024).toFixed(2);
      console.log(`✅ Extension built successfully: ${OUTPUT_FILE}`);
      console.log(`   Size: ${sizeKB} KB`);
      resolve();
    });

    archive.on('error', (err) => {
      console.error('❌ Error building extension:', err);
      reject(err);
    });

    archive.pipe(output);

    // Add each file/directory to the archive
    for (const file of EXTENSION_FILES) {
      const filePath = path.join(EXTENSION_DIR, file);

      if (!fs.existsSync(filePath)) {
        console.warn(`   ⚠️  Skipping missing file: ${file}`);
        continue;
      }

      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        archive.directory(filePath, file);
        console.log(`   Added directory: ${file}/`);
      } else {
        archive.file(filePath, { name: file });
        console.log(`   Added file: ${file}`);
      }
    }

    archive.finalize();
  });
}

buildExtension().catch((err) => {
  console.error(err);
  process.exit(1);
});
