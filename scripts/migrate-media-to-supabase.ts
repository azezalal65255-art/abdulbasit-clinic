import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { supabase } from '../src/lib/supabase';

interface MigrationItem {
  oldPath: string;
  filename: string;
  storagePath: string;
  publicUrl: string;
  status: 'SUCCESS' | 'ALREADY_EXISTS' | 'MISSING_SOURCE_FILE' | 'FAILED';
  sizeBytes?: number;
  mimeType?: string;
  error?: string | null;
}

interface MigrationReport {
  timestamp: string;
  totalSourceFiles: number;
  totalDbReferences: number;
  uploadedCount: number;
  alreadyExistsCount: number;
  missingSourceCount: number;
  failedCount: number;
  items: MigrationItem[];
}

const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.jfif', '.png', '.webp', '.gif', '.svg'];

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
    case '.jfif':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

function sanitizeForStorage(filename: string): string {
  // If already ASCII safe
  if (/^[a-zA-Z0-9_\-\.]+$/.test(filename)) {
    return filename;
  }
  // Replace non-ASCII / unsafe characters with underscore to satisfy Supabase S3 key constraints
  return filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
}

async function checkFileExistsInSupabase(storagePath: string): Promise<boolean> {
  try {
    const { data: pubData } = supabase.storage.from('media').getPublicUrl(storagePath);
    if (!pubData?.publicUrl) return false;
    const res = await fetch(pubData.publicUrl, { method: 'HEAD' });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function runMigration() {
  console.log('====================================================');
  console.log('🚀 Starting Safe Media Migration to Supabase Storage');
  console.log('   Bucket: media');
  console.log('   Folder: images/');
  console.log('   Source: data/uploads/');
  console.log('====================================================\n');

  const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.error('❌ data/uploads directory does not exist!');
    process.exit(1);
  }

  const allDiskFiles = fs.readdirSync(uploadsDir);
  const imageFiles = allDiskFiles.filter((f) =>
    ALLOWED_IMAGE_EXTS.some((ext) => f.toLowerCase().endsWith(ext))
  );

  console.log(`📁 Found ${imageFiles.length} image files in data/uploads/\n`);

  const reportItems: MigrationItem[] = [];
  let uploadedCount = 0;
  let alreadyExistsCount = 0;
  let failedCount = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const filename = imageFiles[i];
    const filePath = path.join(uploadsDir, filename);
    const oldPath = `/uploads/${filename}`;
    const mimeType = getMimeType(filename);
    const stat = fs.statSync(filePath);
    const sizeBytes = stat.size;

    let targetKey = `images/${filename}`;
    // Check if filename contains characters forbidden by Supabase storage
    const isAsciiOnly = /^[a-zA-Z0-9_\-\.]+$/.test(filename);
    if (!isAsciiOnly) {
      targetKey = `images/${sanitizeForStorage(filename)}`;
    }

    const { data: pubData } = supabase.storage.from('media').getPublicUrl(targetKey);
    const publicUrl = pubData?.publicUrl || '';

    process.stdout.write(`[${i + 1}/${imageFiles.length}] Processing: ${filename} ... `);

    // 1. Check if file already exists in Supabase
    const alreadyInStorage = await checkFileExistsInSupabase(targetKey);
    if (alreadyInStorage) {
      console.log('⏩ ALREADY EXISTS');
      alreadyExistsCount++;
      reportItems.push({
        oldPath,
        filename,
        storagePath: `media/${targetKey}`,
        publicUrl,
        status: 'ALREADY_EXISTS',
        sizeBytes,
        mimeType,
        error: null,
      });
      continue;
    }

    // 2. Read file from disk
    const fileBuffer = fs.readFileSync(filePath);

    // 3. Upload to Supabase Storage
    try {
      let { data, error } = await supabase.storage.from('media').upload(targetKey, fileBuffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      });

      // If initial upload failed due to InvalidKey, retry with sanitized key
      if (error && (error as any).code === 'InvalidKey' && isAsciiOnly === false) {
        targetKey = `images/${sanitizeForStorage(filename)}`;
        const retry = await supabase.storage.from('media').upload(targetKey, fileBuffer, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: false,
        });
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.log(`❌ FAILED: ${error.message}`);
        failedCount++;
        reportItems.push({
          oldPath,
          filename,
          storagePath: `media/${targetKey}`,
          publicUrl: '',
          status: 'FAILED',
          sizeBytes,
          mimeType,
          error: error.message,
        });
      } else {
        const { data: confirmedPub } = supabase.storage.from('media').getPublicUrl(targetKey);
        const finalUrl = confirmedPub?.publicUrl || publicUrl;
        console.log('✅ SUCCESS');
        uploadedCount++;
        reportItems.push({
          oldPath,
          filename,
          storagePath: `media/${targetKey}`,
          publicUrl: finalUrl,
          status: 'SUCCESS',
          sizeBytes,
          mimeType,
          error: null,
        });
      }
    } catch (err: any) {
      console.log(`❌ EXCEPTION: ${err.message}`);
      failedCount++;
      reportItems.push({
        oldPath,
        filename,
        storagePath: `media/${targetKey}`,
        publicUrl: '',
        status: 'FAILED',
        sizeBytes,
        mimeType,
        error: err.message,
      });
    }

    // Brief delay to prevent hitting rate limits
    await new Promise((r) => setTimeout(r, 100));
  }

  // 4. Check for database references that may be missing from physical storage
  let missingSourceCount = 0;
  const dbPath = path.join(process.cwd(), 'data', 'clinic-database.json');
  if (fs.existsSync(dbPath)) {
    try {
      const dbContent = fs.readFileSync(dbPath, 'utf8');
      const dbMatches = dbContent.match(/\/uploads\/[^\"'\s;,?#]+/g) || [];
      const uniqueDbRefs = Array.from(new Set(dbMatches));
      const diskSet = new Set(allDiskFiles);

      for (const ref of uniqueDbRefs) {
        const refFilename = path.basename(ref);
        // Exclude social handles / non-file tokens if any
        if (!ALLOWED_IMAGE_EXTS.some((ext) => refFilename.toLowerCase().endsWith(ext))) {
          continue;
        }

        if (!diskSet.has(refFilename)) {
          console.log(`⚠️ MISSING SOURCE FILE in DB: ${refFilename}`);
          missingSourceCount++;
          reportItems.push({
            oldPath: ref,
            filename: refFilename,
            storagePath: `media/images/${sanitizeForStorage(refFilename)}`,
            publicUrl: '',
            status: 'MISSING_SOURCE_FILE',
            error: 'File referenced in DB but not found in data/uploads/',
          });
        }
      }
    } catch (dbErr) {
      console.warn('Could not read DB references:', dbErr);
    }
  }

  // 5. Generate final JSON report
  const finalReport: MigrationReport = {
    timestamp: new Date().toISOString(),
    totalSourceFiles: imageFiles.length,
    totalDbReferences: reportItems.length,
    uploadedCount,
    alreadyExistsCount,
    missingSourceCount,
    failedCount,
    items: reportItems,
  };

  const reportPath = path.join(process.cwd(), 'data', 'supabase-migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2), 'utf8');

  console.log('\n====================================================');
  console.log('📊 MIGRATION SUMMARY:');
  console.log(`   - Total Files Processed: ${imageFiles.length}`);
  console.log(`   - Uploaded to Supabase:  ${uploadedCount}`);
  console.log(`   - Already Existed:       ${alreadyExistsCount}`);
  console.log(`   - Missing Source Files:  ${missingSourceCount}`);
  console.log(`   - Failed:                ${failedCount}`);
  console.log(`   - Report Saved:          ${reportPath}`);
  console.log('====================================================\n');
}

runMigration();
