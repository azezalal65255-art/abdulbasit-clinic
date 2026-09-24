import fs from 'fs';
import path from 'path';

const DATA_UPLOADS = path.join(process.cwd(), 'data', 'uploads');
const PUBLIC_UPLOADS = path.join(process.cwd(), 'public', 'uploads');
const DIST_UPLOADS = path.join(process.cwd(), 'dist', 'uploads');

[DATA_UPLOADS, PUBLIC_UPLOADS, DIST_UPLOADS].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const dataFiles = fs.existsSync(DATA_UPLOADS) ? fs.readdirSync(DATA_UPLOADS) : [];
const publicFiles = fs.existsSync(PUBLIC_UPLOADS) ? fs.readdirSync(PUBLIC_UPLOADS) : [];
const distFiles = fs.existsSync(DIST_UPLOADS) ? fs.readdirSync(DIST_UPLOADS) : [];

const allFiles = new Set([...dataFiles, ...publicFiles, ...distFiles]);
let syncedCount = 0;

for (const file of allFiles) {
  const dataPath = path.join(DATA_UPLOADS, file);
  const publicPath = path.join(PUBLIC_UPLOADS, file);
  const distPath = path.join(DIST_UPLOADS, file);

  let source = '';
  if (fs.existsSync(dataPath) && fs.statSync(dataPath).isFile()) {
    source = dataPath;
  } else if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
    source = publicPath;
  } else if (fs.existsSync(distPath) && fs.statSync(distPath).isFile()) {
    source = distPath;
  }

  if (source) {
    if (!fs.existsSync(dataPath)) {
      try { fs.copyFileSync(source, dataPath); syncedCount++; } catch {}
    }
    if (!fs.existsSync(publicPath)) {
      try { fs.copyFileSync(source, publicPath); syncedCount++; } catch {}
    }
    if (!fs.existsSync(distPath)) {
      try { fs.copyFileSync(source, distPath); syncedCount++; } catch {}
    }
  }
}

console.log(`[Uploads Sync] Synchronized ${allFiles.size} persistent media files (${syncedCount} transfers completed).`);
