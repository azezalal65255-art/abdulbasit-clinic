import multer from 'multer';
import { Request, Response } from 'express';
import { db, generateId } from './db';
import { AuthenticatedRequest } from './auth';
import { createClient } from '@supabase/supabase-js';
import { syncEntityToSupabase } from './supabaseService';
import {
  DATA_UPLOADS_DIR,
  UPLOADS_DIR,
  DIST_UPLOADS_DIR,
  ensureDirectories,
  ALLOWED_MIME_TYPES,
  generateSafeFileName,
  syncFileToDist,
  saveBase64ImageToDisk,
  sanitizeAndPersistMediaUrls,
} from './storageUtils';

export {
  DATA_UPLOADS_DIR,
  generateSafeFileName,
  syncFileToDist,
  saveBase64ImageToDisk,
  sanitizeAndPersistMediaUrls,
};

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://rmvhgoewsegyohdbsjsd.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_yROJ40jpb1d5RdyfJ3zeRQ_hfN_VmPu';
const supabase = createClient(supabaseUrl, supabaseKey);

// Multer memory storage so files can be uploaded directly to Supabase Storage
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max file size
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يرجى رفع ملف صورة بصيغة JPG, PNG, WebP, SVG أو فيديو MP4.'));
    }
  },
});

// Controller for POST /api/upload
export const handleUploadFile = async (req: Request, res: Response) => {
  if (req.file) {
    const isVideo = req.file.mimetype.startsWith('video/');
    const folder = isVideo ? 'videos' : 'images';
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const cleanName = req.file.originalname.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    const uniqueFileName = `${timestamp}-${randomSuffix}-${cleanName}`;
    const storageKey = `${folder}/${uniqueFileName}`;

    try {
      const { data: supaData, error: supaError } = await supabase.storage
        .from('media')
        .upload(storageKey, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '31536000',
          upsert: false,
        });

      if (supaError || !supaData) {
        throw new Error(supaError?.message || 'فشل رفع الملف إلى Supabase Storage');
      }

      const { data: pubData } = supabase.storage.from('media').getPublicUrl(storageKey);
      const publicUrl = pubData.publicUrl;

      let displayName = req.file.originalname || uniqueFileName;
      try {
        const decoded = Buffer.from(displayName, 'latin1').toString('utf8');
        if (/[\u0600-\u06FF]/.test(decoded)) {
          displayName = decoded;
        }
      } catch {}

      // Record in media database for admin access
      try {
        const authUser = (req as AuthenticatedRequest).user;
        const data = db.get();
        const newMedia = {
          id: generateId('med'),
          name: displayName,
          title: displayName,
          url: publicUrl,
          storagePath: `media/${storageKey}`,
          altText: displayName,
          category: req.body?.category || 'عيادة',
          fileSize: `${Math.round(req.file.size / 1024)} KB`,
          fileType: req.file.mimetype,
          uploadedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        data.media.unshift(newMedia);
        if (authUser) {
          db.logActivity(authUser, 'رفع ملف إلى Supabase Storage', 'الوسائط', `تم رفع وحفظ: ${newMedia.name}`);
        }
        db.save();
        // Sync to Supabase PostgreSQL table
        syncEntityToSupabase('media', newMedia).catch(() => {});
      } catch {}

      return res.status(200).json({
        success: true,
        url: publicUrl,
        public_url: publicUrl,
        publicUrl: publicUrl,
        downloadURL: publicUrl,
        storage_path: `media/${storageKey}`,
        storagePath: `media/${storageKey}`,
        fileName: uniqueFileName,
        file_name: uniqueFileName,
        originalName: displayName,
        original_name: displayName,
        contentType: req.file.mimetype,
        mime_type: req.file.mimetype,
        mimeType: req.file.mimetype,
        size: req.file.size,
        file_size: req.file.size,
        uploadedAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[Server Supabase Upload Error]:', err);
      return res.status(500).json({
        error: `فشل رفع الملف إلى التخزين الدائم: ${err.message || 'خطأ غير معروف'}`,
      });
    }
  }

  return res.status(400).json({
    error: 'لم يتم استلام أي ملف صورة صالح للرفع. يرجى اختيار ملف صورة.',
  });
};

