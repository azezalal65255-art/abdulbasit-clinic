import { supabase, SUPABASE_CONFIG } from '../lib/supabase';

// ============================================================================
// CENTRALIZED PERMANENT SUPABASE STORAGE UPLOAD SERVICE
// ============================================================================
// Uploads all media directly and permanently to Supabase Storage:
// Bucket: 'media', Folder: 'images/' or 'videos/'
// Generates unique timestamped filenames: images/<timestamp>-<random>-<filename>
// Eliminates any dependency on local ephemeral /uploads directories.
// ============================================================================

export interface UploadResult {
  downloadURL: string;
  storagePath: string;
  fileName: string;
  originalName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/x-icon',
  'video/mp4',
  'video/webm',
];

function sanitizeFileName(filename: string): string {
  return filename
    .normalize('NFKD')
    .replace(/[^\w\u0600-\u06FF\.\-]/g, '_')
    .replace(/_{2,}/g, '_');
}

/**
 * 1. Uploads a file permanently to Supabase Storage ('media' bucket)
 * under 'images/' or 'videos/' with unique timestamped naming.
 */
export async function uploadFile(
  file: File,
  category: string = 'general',
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  if (!file) {
    throw new Error('لم يتم تحديد أي ملف للرفع');
  }

  // Validate MIME type
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && !ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('نوع الملف غير مدعوم. يرجى اختيار صورة أو فيديو صالح (JPG, PNG, WebP, SVG, MP4).');
  }

  // Size limit: 25MB
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('حجم الملف كبير جداً، يرجى اختيار ملف بحجم أقل من 25 ميغابايت.');
  }

  const isVideo = file.type.startsWith('video/');
  const folder = isVideo ? 'videos' : 'images';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const cleanName = sanitizeFileName(file.name);
  const uniqueName = `${timestamp}-${randomSuffix}-${cleanName}`;
  const supabaseFilePath = `${folder}/${uniqueName}`;

  if (onProgress) onProgress(20);

  // Direct upload to Supabase Storage bucket 'media'
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('media')
    .upload(supabaseFilePath, file, {
      contentType: file.type,
      cacheControl: '31536000', // 1 year immutable cache on CDN because filename is unique!
      upsert: false,
    });

  if (onProgress) onProgress(75);

  if (uploadError || !uploadData) {
    console.error('[Supabase Storage Upload Error]:', uploadError);
    // If upload with arabic characters had an S3 key error, retry with ASCII-safe key
    const asciiSafeName = `${timestamp}-${randomSuffix}-${file.name.replace(/[^a-zA-Z0-9_\-\.]/g, '_')}`;
    const asciiPath = `${folder}/${asciiSafeName}`;
    
    const { data: retryData, error: retryError } = await supabase.storage
      .from('media')
      .upload(asciiPath, file, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false,
      });

    if (retryError || !retryData) {
      console.warn(`Direct client Supabase upload attempt failed (${retryError?.message || uploadError?.message}), trying API bridge upload to Supabase...`);
      
      // Fallback via server API which uploads with server Supabase credentials
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `فشل رفع الصورة إلى Supabase Storage: ${retryError?.message || uploadError?.message || 'خطأ غير معروف'}`);
      }

      const resData = await res.json();
      if (onProgress) onProgress(100);

      return {
        downloadURL: resData.url || resData.downloadURL || resData.publicUrl,
        storagePath: resData.storagePath || resData.storage_path || `media/${folder}/${uniqueName}`,
        fileName: resData.fileName || resData.file_name || uniqueName,
        originalName: resData.originalName || resData.original_name || file.name,
        contentType: resData.mimeType || resData.contentType || file.type,
        size: resData.size || file.size,
        uploadedAt: resData.uploadedAt || resData.created_at || new Date().toISOString(),
      };
    }

    const { data: pubData } = supabase.storage.from('media').getPublicUrl(asciiPath);
    const downloadURL = pubData?.publicUrl || '';

    if (onProgress) onProgress(100);

    return {
      downloadURL,
      storagePath: `media/${asciiPath}`,
      fileName: asciiSafeName,
      originalName: file.name,
      contentType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
  }

  const { data: pubData } = supabase.storage.from('media').getPublicUrl(supabaseFilePath);
  const downloadURL = pubData?.publicUrl || '';

  if (onProgress) onProgress(100);

  return {
    downloadURL,
    storagePath: `media/${supabaseFilePath}`,
    fileName: uniqueName,
    originalName: file.name,
    contentType: file.type,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Backward compatibility wrapper for existing code calling uploadOriginalImage
 */
export async function uploadOriginalImage(file: File, category?: string): Promise<string> {
  const result = await uploadFile(file, category);
  return result.downloadURL;
}

/**
 * 2. Get permanent download URL for a stored asset
 */
export function getPermanentDownloadURL(urlOrPath: string): string {
  if (!urlOrPath) return '';
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://') || urlOrPath.startsWith('data:')) {
    return urlOrPath;
  }
  if (urlOrPath.startsWith('media/')) {
    const { data } = supabase.storage.from('media').getPublicUrl(urlOrPath.replace(/^media\//, ''));
    return data.publicUrl;
  }
  if (urlOrPath.startsWith('images/') || urlOrPath.startsWith('videos/')) {
    const { data } = supabase.storage.from('media').getPublicUrl(urlOrPath);
    return data.publicUrl;
  }
  return urlOrPath;
}

/**
 * 3. Delete file from storage (Supabase Storage)
 */
export async function deleteFile(urlOrPath: string): Promise<void> {
  if (!urlOrPath) return;
  try {
    if (urlOrPath.includes('/storage/v1/object/public/media/')) {
      const parts = urlOrPath.split('/storage/v1/object/public/media/');
      if (parts[1]) {
        const relativePath = decodeURIComponent(parts[1].split('?')[0]);
        await supabase.storage.from('media').remove([relativePath]);
      }
    } else if (urlOrPath.startsWith('images/') || urlOrPath.startsWith('videos/')) {
      await supabase.storage.from('media').remove([urlOrPath]);
    } else if (urlOrPath.startsWith('media/')) {
      const relativePath = urlOrPath.replace(/^media\//, '');
      await supabase.storage.from('media').remove([relativePath]);
    }
  } catch (err) {
    console.warn('[Delete File Warning]', err);
  }
}

/**
 * 4. Replace file: uploads new unique file FIRST to Supabase Storage,
 * gets new Public URL, and deletes old file.
 */
export async function replaceFile(
  oldUrl: string,
  newFile: File,
  category: string = 'general',
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  // Step 1: Upload new file with unique timestamp
  const newUploadResult = await uploadFile(newFile, category, onProgress);

  // Step 2: Delete old file if present in Supabase storage
  if (oldUrl && oldUrl !== newUploadResult.downloadURL) {
    try {
      await deleteFile(oldUrl);
    } catch (err) {
      console.warn('[Replace Cleanup Warning] Could not remove old file:', err);
    }
  }

  return newUploadResult;
}

