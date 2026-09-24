import fs from 'fs';
import path from 'path';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(process.cwd(), 'data', 'backups', `master-restore-point-${timestamp}`);

fs.mkdirSync(backupDir, { recursive: true });
fs.mkdirSync(path.join(backupDir, 'uploads'), { recursive: true });
fs.mkdirSync(path.join(backupDir, 'images'), { recursive: true });

// 1. Backup full database
const dbPath = path.join(process.cwd(), 'data', 'clinic-database.json');
if (fs.existsSync(dbPath)) {
  fs.copyFileSync(dbPath, path.join(backupDir, 'clinic-database.json'));
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // Save individual modules
  fs.writeFileSync(path.join(backupDir, 'backup-articles.json'), JSON.stringify(dbData.articles || [], null, 2));
  fs.writeFileSync(path.join(backupDir, 'backup-videos.json'), JSON.stringify(dbData.videos || [], null, 2));
  fs.writeFileSync(path.join(backupDir, 'backup-media.json'), JSON.stringify(dbData.media || [], null, 2));
  fs.writeFileSync(path.join(backupDir, 'backup-services.json'), JSON.stringify(dbData.services || [], null, 2));
  fs.writeFileSync(path.join(backupDir, 'backup-conditions.json'), JSON.stringify(dbData.conditions || [], null, 2));
  fs.writeFileSync(path.join(backupDir, 'backup-pages.json'), JSON.stringify(dbData.pages || [], null, 2));
  fs.writeFileSync(path.join(backupDir, 'backup-sliders.json'), JSON.stringify(dbData.sliders || [], null, 2));
  fs.writeFileSync(path.join(backupDir, 'backup-settings.json'), JSON.stringify(dbData.settings || {}, null, 2));
}

// 2. Backup all uploads
const dataUploads = path.join(process.cwd(), 'data', 'uploads');
if (fs.existsSync(dataUploads)) {
  const files = fs.readdirSync(dataUploads);
  for (const f of files) {
    const src = path.join(dataUploads, f);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, path.join(backupDir, 'uploads', f));
    }
  }
}

// 3. Backup all public images
const publicImages = path.join(process.cwd(), 'public', 'images');
if (fs.existsSync(publicImages)) {
  const copyRecursive = (srcDir: string, destDir: string) => {
    fs.mkdirSync(destDir, { recursive: true });
    for (const item of fs.readdirSync(srcDir)) {
      const srcPath = path.join(srcDir, item);
      const destPath = path.join(destDir, item);
      if (fs.statSync(srcPath).isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  copyRecursive(publicImages, path.join(backupDir, 'images'));
}

console.log(`[Backup Completed] Master restore point saved at: ${backupDir}`);
