import { supabase, SUPABASE_CONFIG } from '../lib/supabase';

// ============================================================================
// CENTRALIZED PERMANENT UPLOAD SERVICE (Supabase + Persistent Storage Engine)
// ============================================================================
// Implements robust upload to Supabase Storage (media/images and media/videos),
// download URL retrieval, replacement, deletion, error handling, progress tracking.
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

/**
 * 1. Uploads a file permanently with Supabase Storage as primary target,
 * with structured folders: media/images and media/videos.
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
    throw new Error('نوع الملف غير مدعوم. يرجى اختيار صورة أو فيديو صالح (JPG, PNG, WebP, MP4).');
  }

  // Size limit: 25MB
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('حجم الملف كبير جداً، يرجى اختيار ملف بحجم أقل من 25 ميغابايت.');
  }

  const isVideo = file.type.startsWith('video/');
  const folder = isVideo ? 'videos' : 'images';
  const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${file.name.replace(/\s+/g, '_')}`;
  const supabaseFilePath = `${folder}/${uniqueName}`;

  console.log(`[Upload Start] Starting upload for: ${file.name} to Supabase bucket 'media' at path '${supabaseFilePath}'`);
  if (onProgress) onProgress(20);

  // Upload directly to Supabase Storage bucket 'media'
  let downloadURL = '';
  let storagePath = supabaseFilePath;
  let supabaseSuccess = false;

  try {
    const { data: supaData, error: supaError } = await supabase.storage
      .from('media')
      .upload(supabaseFilePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (onProgress) onProgress(75);

    if (!supaError && supaData) {
      const { data: pubData } = supabase.storage
        .from('media')
        .getPublicUrl(supabaseFilePath);

      if (pubData?.publicUrl) {
        downloadURL = pubData.publicUrl;
        storagePath = supabaseFilePath;
        supabaseSuccess = true;
        console.log(`[Supabase Upload Success] File permanently saved to Supabase Storage:`, downloadURL);
      }
    } else if (supaError) {
      console.warn('[Supabase Upload Warning - Falling back to persistent server storage]:', supaError.message);
    }
  } catch (err: any) {
    console.warn('[Supabase Upload Exception - Falling back to persistent server storage]:', err.message);
  }

  // Fallback to local server endpoint if Supabase is still pending RLS policies or offline
  if (!supabaseSuccess) {
    const formData = new FormData();
    formData.append('file', file, uniqueName);
    formData.append('category', category);

    const token = localStorage.getItem('clinic_admin_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (onProgress) onProgress(80);

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('storage/unauthorized: انتهت صلاحية الجلسة أو ليس لديك صلاحية رفع الملفات. يرجى إعادة تسجيل الدخول.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'فشل الاتصال بخادم التخزين. تحقق من اتصال الشبكة.');
    }

    const data = await response.json();
    downloadURL = data.downloadURL || data.url;
    storagePath = data.storagePath || `data/uploads/${data.fileName || uniqueName}`;
  }

  if (onProgress) onProgress(100);

  return {
    downloadURL,
    storagePath,
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
  if (urlOrPath.startsWith('/uploads/')) {
    return urlOrPath;
  }
  if (urlOrPath.startsWith('data/uploads/')) {
    return `/${urlOrPath.replace('data/', '')}`;
  }
  return urlOrPath;
}

/**
 * 3. Delete file from storage (Supabase Storage + local backend API)
 */
export async function deleteFile(urlOrPath: string): Promise<void> {
  console.log(`[Delete File] Request to delete: ${urlOrPath}`);
  try {
    // If it's a Supabase storage asset, delete directly from bucket
    if (urlOrPath.includes('/storage/v1/object/public/media/')) {
      const parts = urlOrPath.split('/storage/v1/object/public/media/');
      if (parts[1]) {
        const relativePath = decodeURIComponent(parts[1]);
        await supabase.storage.from('media').remove([relativePath]);
        console.log(`[Supabase Delete] Removed from bucket: ${relativePath}`);
      }
    } else if (urlOrPath.startsWith('images/') || urlOrPath.startsWith('videos/')) {
      await supabase.storage.from('media').remove([urlOrPath]);
      console.log(`[Supabase Delete] Removed from bucket: ${urlOrPath}`);
    } else if (urlOrPath.startsWith('media/')) {
      const relativePath = urlOrPath.replace(/^media\//, '');
      await supabase.storage.from('media').remove([relativePath]);
      console.log(`[Supabase Delete] Removed from bucket: ${relativePath}`);
    }

    const token = localStorage.getItem('clinic_admin_token');
    await fetch('/api/admin/media/delete-by-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ url: urlOrPath }),
    }).catch(() => {});
  } catch (err) {
    console.warn('[Delete File Warning]', err);
  }
}

/**
 * 4. Replace file: uploads new file FIRST, verifies success, saves new URL, then deletes old file.
 */
export async function replaceFile(
  oldUrl: string,
  newFile: File,
  category: string = 'general',
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  console.log(`[Replace Start] Uploading new replacement file for old: ${oldUrl}`);
  
  // Step 1: Upload new file first
  const newUploadResult = await uploadFile(newFile, category, onProgress);
  console.log(`[Replace Success] New file successfully uploaded: ${newUploadResult.downloadURL}`);

  // Step 2: Delete old file after successful new upload
  if (oldUrl && oldUrl !== newUploadResult.downloadURL) {
    try {
      await deleteFile(oldUrl);
      console.log(`[Replace Cleanup] Old file removed from storage: ${oldUrl}`);
    } catch (err) {
      console.warn('[Replace Cleanup Warning] Could not remove old file:', err);
    }
  }

  return newUploadResult;
}
