import multer from 'multer';
import { Request, Response } from 'express';
import { db, generateId } from './db';
import { AuthenticatedRequest } from './auth';
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

// Multer disk storage for saving byte-for-byte exact original files directly into persistent storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureDirectories();
    cb(null, DATA_UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const safeName = generateSafeFileName(file.originalname, file.mimetype);
    cb(null, safeName);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max file size
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يرجى رفع ملف صورة بصيغة JPG, PNG, WebP أو وثيقة PDF, DOC, DOCX فقط.'));
    }
  },
});

// Controller for POST /api/upload
export const handleUploadFile = (req: Request, res: Response) => {
  // IMPORTANT:
  // Upload the original image file only.
  // Never call Gemini, Imagen, or any AI image generation
  // or image editing model from this function.

  if (req.file) {
    const fileName = req.file.filename;
    syncFileToDist(fileName);

    const publicUrl = `/uploads/${fileName}`;

    let displayName = req.file.originalname || fileName;
    try {
      const decoded = Buffer.from(displayName, 'latin1').toString('utf8');
      if (/[\u0600-\u06FF]/.test(decoded)) {
        displayName = decoded;
      }
    } catch {}

    // Optionally record in media database for easy admin access
    try {
      const authUser = (req as AuthenticatedRequest).user;
      const data = db.get();
      const newMedia = {
        id: generateId('med'),
        name: displayName,
        title: displayName,
        url: publicUrl,
        altText: displayName,
        category: 'عيادة',
        fileSize: `${Math.round(req.file.size / 1024)} KB`,
        fileType: req.file.mimetype,
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      data.media.unshift(newMedia);
      if (authUser) {
        db.logActivity(authUser, 'رفع ملف صورة أصلي', 'الوسائط', `تم حفظ الصورة الأصلية: ${newMedia.name}`);
      }
      db.save();
    } catch {
      // Non-blocking if media logging fails
    }

    return res.status(200).json({
      success: true,
      url: publicUrl,
      downloadURL: publicUrl,
      storagePath: `data/uploads/${fileName}`,
      fileName,
      originalName: displayName,
      contentType: req.file.mimetype,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
    });
  }

  // Fallback: If client sent base64 JSON payload
  const { fileData, fileName: rawName } = req.body || {};
  if (fileData && typeof fileData === 'string' && fileData.startsWith('data:image/')) {
    const saved = saveBase64ImageToDisk(fileData, rawName);
    if (saved) {
      try {
        const data = db.get();
        data.media.unshift({
          id: generateId('med'),
          name: rawName || saved.fileName,
          url: saved.url,
          altText: rawName || saved.fileName,
          fileSize: `${Math.round(saved.size / 1024)} KB`,
          fileType: 'image/jpeg',
          uploadedAt: new Date().toISOString(),
        });
        db.save();
      } catch {}

      return res.status(200).json({
        success: true,
        url: saved.url,
        downloadURL: saved.url,
        storagePath: `data/uploads/${saved.fileName}`,
        fileName: saved.fileName,
        originalName: rawName || saved.fileName,
        contentType: 'image/jpeg',
        size: saved.size,
        uploadedAt: new Date().toISOString(),
      });
    }
  }

  return res.status(400).json({
    error: 'لم يتم استلام أي ملف صورة صالح للرفع. يرجى اختيار ملف صورة.',
  });
};
