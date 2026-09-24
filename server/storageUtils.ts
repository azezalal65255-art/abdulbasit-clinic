import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const DATA_DIR = path.join(process.cwd(), 'data');
export const DATA_UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
export const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
export const DIST_UPLOADS_DIR = path.join(process.cwd(), 'dist', 'uploads');
export const BACKUP_DIR = path.join(DATA_DIR, 'backups');

export function ensureDirectories(): void {
  const dirs = [DATA_DIR, DATA_UPLOADS_DIR, UPLOADS_DIR, DIST_UPLOADS_DIR, BACKUP_DIR];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (err) {
        console.error(`Error creating directory ${dir}:`, err);
      }
    }
  }

  // Cross-sync all 3 upload directories to guarantee persistent storage
  try {
    const dataFiles = fs.existsSync(DATA_UPLOADS_DIR) ? fs.readdirSync(DATA_UPLOADS_DIR) : [];
    const publicFiles = fs.existsSync(UPLOADS_DIR) ? fs.readdirSync(UPLOADS_DIR) : [];
    const distFiles = fs.existsSync(DIST_UPLOADS_DIR) ? fs.readdirSync(DIST_UPLOADS_DIR) : [];

    const allFiles = new Set([...dataFiles, ...publicFiles, ...distFiles]);

    for (const file of allFiles) {
      const dataPath = path.join(DATA_UPLOADS_DIR, file);
      const publicPath = path.join(UPLOADS_DIR, file);
      const distPath = path.join(DIST_UPLOADS_DIR, file);

      // Find the source of truth
      let sourcePath = '';
      if (fs.existsSync(dataPath) && fs.statSync(dataPath).isFile()) {
        sourcePath = dataPath;
      } else if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
        sourcePath = publicPath;
      } else if (fs.existsSync(distPath) && fs.statSync(distPath).isFile()) {
        sourcePath = distPath;
      }

      if (sourcePath) {
        // Ensure present in DATA_UPLOADS_DIR (Master persistent storage)
        if (!fs.existsSync(dataPath)) {
          try { fs.copyFileSync(sourcePath, dataPath); } catch {}
        }
        // Ensure present in public/uploads (Vite dev server)
        if (!fs.existsSync(publicPath)) {
          try { fs.copyFileSync(sourcePath, publicPath); } catch {}
        }
        // Ensure present in dist/uploads (Production build)
        if (!fs.existsSync(distPath)) {
          try { fs.copyFileSync(sourcePath, distPath); } catch {}
        }
      }
    }
  } catch (err) {
    console.error('Error during 3-way upload directory synchronization:', err);
  }
}

// Initial initialization
ensureDirectories();

// Allowed MIME types
export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export function generateSafeFileName(originalName: string, mimeType?: string): string {
  // Decode potential latin1-encoded utf8 string produced by standard multer headers
  let cleanName = originalName;
  try {
    const decoded = Buffer.from(originalName, 'latin1').toString('utf8');
    // If it contains Arabic characters, use the decoded string
    if (/[\u0600-\u06FF]/.test(decoded)) {
      cleanName = decoded;
    }
  } catch {}

  let ext = path.extname(cleanName).toLowerCase();
  if (!ext && mimeType) {
    if (mimeType === 'image/jpeg') ext = '.jpg';
    else if (mimeType === 'image/png') ext = '.png';
    else if (mimeType === 'image/webp') ext = '.webp';
    else if (mimeType === 'image/gif') ext = '.gif';
    else if (mimeType === 'image/svg+xml') ext = '.svg';
    else if (mimeType === 'application/pdf') ext = '.pdf';
    else if (mimeType === 'application/msword') ext = '.doc';
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') ext = '.docx';
    else ext = '.jpg';
  }

  // Sanitize name: support Arabic (\u0600-\u06FF), English (a-zA-Z0-9), replace spaces with hyphen
  const rawBase = path.basename(cleanName, ext)
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, '_')
    .slice(0, 40);
  const safeBase = rawBase || 'media';
  const timestamp = Date.now();
  const randomSuffix = crypto.randomUUID().slice(0, 8);

  return `${timestamp}-${safeBase}-${randomSuffix}${ext}`;
}

export function writeUploadedBuffer(buffer: Buffer, fileName: string): void {
  ensureDirectories();
  const destPaths = [
    path.join(DATA_UPLOADS_DIR, fileName),
    path.join(UPLOADS_DIR, fileName),
    path.join(DIST_UPLOADS_DIR, fileName),
  ];

  for (const dest of destPaths) {
    try {
      fs.writeFileSync(dest, buffer);
    } catch (err) {
      console.error(`Failed to write uploaded file to ${dest}:`, err);
    }
  }
}

export function syncFileToDist(fileName: string): void {
  ensureDirectories();
  const srcPaths = [
    path.join(DATA_UPLOADS_DIR, fileName),
    path.join(UPLOADS_DIR, fileName),
    path.join(DIST_UPLOADS_DIR, fileName),
  ];

  const existingSrc = srcPaths.find((p) => fs.existsSync(p));
  if (!existingSrc) return;

  for (const target of srcPaths) {
    if (target !== existingSrc && !fs.existsSync(target)) {
      try {
        fs.copyFileSync(existingSrc, target);
      } catch {}
    }
  }
}

export function deleteUploadedFile(fileName: string): void {
  const baseName = path.basename(fileName);
  const targets = [
    path.join(DATA_UPLOADS_DIR, baseName),
    path.join(UPLOADS_DIR, baseName),
    path.join(DIST_UPLOADS_DIR, baseName),
  ];

  for (const target of targets) {
    if (fs.existsSync(target)) {
      try {
        fs.unlinkSync(target);
      } catch (err) {
        console.error(`Error deleting file ${target}:`, err);
      }
    }
  }
}

export function saveBase64ImageToDisk(
  base64Data: string,
  originalName?: string
): { url: string; fileName: string; size: number } | null {
  try {
    ensureDirectories();
    const match = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!match) {
      return null;
    }

    const mimeType = match[1];
    if (!ALLOWED_MIME_TYPES.has(mimeType) && !mimeType.startsWith('image/')) {
      return null;
    }

    const buffer = Buffer.from(match[2], 'base64');
    const safeFileName = generateSafeFileName(originalName || 'uploaded-image', mimeType);

    writeUploadedBuffer(buffer, safeFileName);

    return {
      url: `/uploads/${safeFileName}`,
      fileName: safeFileName,
      size: buffer.length,
    };
  } catch (err) {
    console.error('Error saving base64 image to disk:', err);
    return null;
  }
}

/**
 * Scans the database data to find any location referencing an image URL.
 */
export function findMediaUsages(imageUrl: string, data: any): string[] {
  if (!imageUrl || !data) return [];
  const cleanUrl = imageUrl.trim();
  const usages: string[] = [];

  if (data.doctor?.photo === cleanUrl) {
    usages.push('صورة الطبيب الشخصية في الملف التعريفي');
  }
  if (data.settings?.logoUrl === cleanUrl) {
    usages.push('شعار العيادة في رأس وتذييل الموقع');
  }
  if (data.settings?.heroImage === cleanUrl) {
    usages.push('صورة الغلاف الرئيسي للموقع (Hero)');
  }

  (data.services || []).forEach((item: any, idx: number) => {
    if (item.image === cleanUrl) {
      usages.push(`الخدمات الطبية: ${item.title || `خدمة ${idx + 1}`}`);
    }
  });

  (data.conditions || []).forEach((item: any) => {
    if (item.image === cleanUrl) {
      usages.push(`دليل الحالات المرضية: ${item.name || item.id}`);
    }
  });

  (data.endoscopy || []).forEach((item: any, idx: number) => {
    if (item.image === cleanUrl) {
      usages.push(`وحدة المناظير: ${item.title || `منظار ${idx + 1}`}`);
    }
  });

  (data.articles || []).forEach((item: any) => {
    if (item.image === cleanUrl) {
      usages.push(`المقالات الطبية: ${item.title || item.id}`);
    }
  });

  (data.pages || []).forEach((item: any) => {
    if (item.coverImage === cleanUrl) {
      usages.push(`الصفحات المخصصة: ${item.title || item.slug}`);
    }
  });

  (data.sliders || []).forEach((item: any, idx: number) => {
    if (item.image === cleanUrl || item.imageUrl === cleanUrl) {
      usages.push(`السلايدر الرئيسي: ${item.title || `شريحة ${idx + 1}`}`);
    }
  });

  (data.videos || []).forEach((item: any) => {
    if (item.thumbnailUrl === cleanUrl) {
      usages.push(`الفيديوهات الطبية: ${item.title || item.id}`);
    }
  });

  (data.conferences || []).forEach((item: any) => {
    if (item.image === cleanUrl) {
      usages.push(`المؤتمرات الطبية: ${item.title || item.id}`);
    }
  });

  return usages;
}

/**
 * Replaces an old image URL with a new URL across all database models.
 */
export function replaceMediaUrlGlobally(oldUrl: string, newUrl: string, data: any): { count: number; places: string[] } {
  if (!oldUrl || !newUrl || !data) return { count: 0, places: [] };
  const targetOld = oldUrl.trim();
  const targetNew = newUrl.trim();
  let count = 0;
  const places: string[] = [];

  if (data.doctor && data.doctor.photo === targetOld) {
    data.doctor.photo = targetNew;
    count++;
    places.push('صورة الطبيب');
  }
  if (data.settings && data.settings.logoUrl === targetOld) {
    data.settings.logoUrl = targetNew;
    count++;
    places.push('شعار العيادة');
  }
  if (data.settings && data.settings.heroImage === targetOld) {
    data.settings.heroImage = targetNew;
    count++;
    places.push('صورة الغلاف');
  }

  (data.services || []).forEach((item: any) => {
    if (item.image === targetOld) {
      item.image = targetNew;
      count++;
      places.push(`خدمة: ${item.title}`);
    }
  });

  (data.conditions || []).forEach((item: any) => {
    if (item.image === targetOld) {
      item.image = targetNew;
      count++;
      places.push(`حالة مرضية: ${item.name}`);
    }
  });

  (data.endoscopy || []).forEach((item: any) => {
    if (item.image === targetOld) {
      item.image = targetNew;
      count++;
      places.push(`منظار: ${item.title}`);
    }
  });

  (data.articles || []).forEach((item: any) => {
    if (item.image === targetOld) {
      item.image = targetNew;
      count++;
      places.push(`مقال: ${item.title}`);
    }
  });

  (data.pages || []).forEach((item: any) => {
    if (item.coverImage === targetOld) {
      item.coverImage = targetNew;
      count++;
      places.push(`صفحة: ${item.title}`);
    }
  });

  (data.sliders || []).forEach((item: any) => {
    let replacedInSlider = false;
    if (item.image === targetOld) {
      item.image = targetNew;
      replacedInSlider = true;
    }
    if (item.imageUrl === targetOld) {
      item.imageUrl = targetNew;
      replacedInSlider = true;
    }
    if (replacedInSlider) {
      count++;
      places.push(`سلايدر: ${item.title}`);
    }
  });

  (data.videos || []).forEach((item: any) => {
    if (item.thumbnailUrl === targetOld) {
      item.thumbnailUrl = targetNew;
      count++;
      places.push(`فيديو: ${item.title}`);
    }
  });

  (data.conferences || []).forEach((item: any) => {
    if (item.image === targetOld) {
      item.image = targetNew;
      count++;
      places.push(`مؤتمر: ${item.title}`);
    }
  });

  // Also update media item record url if found
  (data.media || []).forEach((item: any) => {
    if (item.url === targetOld) {
      item.url = targetNew;
    }
  });

  return { count, places };
}

/**
 * Generates an elegant, professional medical placeholder SVG if an image is missing
 */
export function getFallbackPlaceholderSvg(label = 'صورة طبية توضيحية'): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F4F9FD" />
      <stop offset="100%" stop-color="#E5F1FA" />
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bgGrad)"/>
  <rect x="24" y="24" width="752" height="452" rx="20" fill="#FFFFFF" stroke="#BED8EA" stroke-width="2"/>
  
  <g transform="translate(400, 210)">
    <circle cx="0" cy="0" r="56" fill="#F0F7FC" stroke="#0B70B7" stroke-width="2"/>
    <!-- Medical Cross / Stethoscope Icon -->
    <path d="M-18 0h36M0 -18v36" stroke="#064B82" stroke-width="6" stroke-linecap="round"/>
    <circle cx="0" cy="0" r="10" fill="#2FA84F"/>
  </g>
  
  <text x="400" y="310" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="bold" fill="#064B82">عيادة د. عبدالباسط مقبل</text>
  <text x="400" y="340" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#667788">${label}</text>
  <text x="400" y="365" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#99AABB">استشاري أمراض الباطنة والكبد والمناظير</text>
</svg>`;
}

/**
 * Deeply sanitizes any object or array to ensure no blob: URLs or raw base64 data
 * strings enter the database. Base64 strings are automatically converted to permanent
 * files on disk, and blob: URLs are converted or replaced with safe fallback images.
 */
export function sanitizeAndPersistMediaUrls<T>(input: T, keyContext = ''): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    const val = input.trim();

    // 1. Convert base64 data to real permanent disk files
    if (val.startsWith('data:image/')) {
      const saved = saveBase64ImageToDisk(val, `auto-persisted-${keyContext || 'media'}`);
      if (saved) {
        console.log(`[Storage Persistence] Converted base64 image for "${keyContext}" into permanent file: ${saved.url}`);
        return saved.url as unknown as T;
      }
      return '/images/clinic-logo.jpg' as unknown as T;
    }

    // 2. Reject and replace transient blob: URLs
    if (val.startsWith('blob:')) {
      console.warn(`[Storage Protection] Blocked transient blob URL for "${keyContext}": ${val.slice(0, 40)}...`);
      if (keyContext.includes('logo')) {
        return '/images/clinic-logo.jpg' as unknown as T;
      }
      if (keyContext.includes('photo') || keyContext.includes('doctor')) {
        return '/images/dr-abdulbasit-real.jpg' as unknown as T;
      }
      return '/images/clinic-logo.jpg' as unknown as T;
    }

    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item, idx) =>
      sanitizeAndPersistMediaUrls(item, `${keyContext}[${idx}]`)
    ) as unknown as T;
  }

  if (typeof input === 'object') {
    const sanitizedObj: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitizedObj[key] = sanitizeAndPersistMediaUrls(value, key);
    }
    return sanitizedObj as T;
  }

  return input;
}

