import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  FolderOpen,
  CheckCircle2,
  RefreshCw,
  Eye,
  Sparkles,
} from 'lucide-react';
import { ImagePickerModal } from '../ImagePickerModal';
import { api } from '../../services/api';
import { uploadFile } from '../../services/uploadService';

interface ImageUploadFieldProps {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  category?: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'wide';
  helperText?: string;
  className?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  sublabel,
  value,
  onChange,
  onRemove,
  category = 'عام',
  aspectRatio = 'video',
  helperText,
  className = '',
}) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle direct file upload from user device (mobile/desktop)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    // Reset file input so same file can be re-uploaded if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = async (file: File) => {
    setErrorMsg(null);
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMsg('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP, SVG)');
      return;
    }

    // Limit size to 20MB
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 20 ميجابايت');
      return;
    }

    let tempBlobUrl: string | null = null;
    try {
      setIsUploading(true);
      setPreviewError(false);

      // 1. Create immediate local preview for smooth UI feedback ONLY (never pass to onChange!)
      tempBlobUrl = URL.createObjectURL(file);
      setLocalPreviewUrl(tempBlobUrl);

      // 2. Upload exact original file directly to persistent server storage
      const uploadedResult = await uploadFile(file, category);

      // 3. Update field with the permanent original file URL ONLY
      onChange(uploadedResult.downloadURL);
      setLocalPreviewUrl(null);
      setPreviewError(false);
    } catch (err: any) {
      setLocalPreviewUrl(null);
      setErrorMsg(err.message || 'تعذر رفع الصورة وتثبيتها. يرجى المحاولة مرة أخرى.');
    } finally {
      if (tempBlobUrl) {
        try {
          URL.revokeObjectURL(tempBlobUrl);
        } catch {}
      }
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'portrait'
      ? 'aspect-3/4'
      : aspectRatio === 'wide'
      ? 'aspect-21/9'
      : 'aspect-16/9';

  // Active display url: local preview during upload, or saved permanent URL
  const displayUrl = localPreviewUrl || value;

  return (
    <div className={`space-y-2 text-right ${className}`} dir="rtl">
      {/* Label and Helper */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-[#17354F]">{label}</label>
          {sublabel && <p className="text-[11px] text-slate-500 mt-0.5">{sublabel}</p>}
        </div>
        {value && !isUploading && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>محفوظة في التخزين الدائم</span>
          </span>
        )}
        {isUploading && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
            <span>جاري رفع الصورة...</span>
          </span>
        )}
      </div>

      {/* Hidden File Input for Native Device Browsing */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-[11px] font-semibold p-2.5 rounded-xl flex items-center justify-between animate-in fade-in">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-red-600 hover:text-red-800 font-bold hover:underline">إغلاق</button>
        </div>
      )}

      {/* Main Image Container */}
      {displayUrl ? (
        /* Image Preview Box with Controls */
        <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs group transition-all hover:border-[#0872B9]/50">
          <div className={`w-full ${aspectClass} max-h-64 flex items-center justify-center overflow-hidden bg-slate-100 relative`}>
            {!previewError ? (
              <img
                src={displayUrl}
                alt={label}
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-102 ${isUploading ? 'opacity-70 blur-[1px]' : ''}`}
                referrerPolicy="no-referrer"
                onError={() => setPreviewError(true)}
              />
            ) : (
              <div className="text-center p-4 text-slate-400">
                <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                <p className="text-xs">تعذر عرض الصورة، يمكنك رفع صورة جديدة</p>
              </div>
            )}

            {/* Uploading Spinner Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-[#064B82]/70 flex flex-col items-center justify-center p-4 text-white z-10">
                <RefreshCw className="w-7 h-7 animate-spin mb-2 text-white" />
                <p className="text-xs font-bold">جاري رفع وحفظ الصورة في التخزين الدائم...</p>
                <p className="text-[10px] text-white/80 mt-1">يتم حفظ الملف الأصلي في Storage السيرفر الدائم</p>
              </div>
            )}

            {/* Hover overlay with action buttons (only if not uploading) */}
            {!isUploading && (
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="py-2 px-3.5 bg-white hover:bg-slate-50 text-[#0c3653] text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#0872B9]" />
                  <span>استبدال من جهازك</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(true)}
                  className="py-2 px-3.5 bg-[#0872B9] hover:bg-[#064B82] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>من مكتبة الصور</span>
                </button>

                {onRemove && (
                  <button
                    type="button"
                    onClick={onRemove}
                    className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
                    title="حذف الصورة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom quick actions bar */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-emerald-600" />}
                <span>رفع صورة جديدة من جهازك</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-[#0872B9] text-xs font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>اختيار من الوسائط</span>
              </button>
            </div>

            {onRemove && !isUploading && (
              <button
                type="button"
                onClick={onRemove}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                إزالة
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Empty State Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            isDragOver
              ? 'border-[#2fa84f] bg-emerald-50/50'
              : 'border-slate-300 hover:border-[#0872B9] bg-slate-50/70 hover:bg-white'
          }`}
        >
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 text-[#0872B9] flex items-center justify-center mx-auto">
              {isUploading ? (
                <RefreshCw className="w-6 h-6 animate-spin text-[#2fa84f]" />
              ) : (
                <ImageIcon className="w-6 h-6 text-[#0872B9]" />
              )}
            </div>

            <div>
              <p className="text-xs sm:text-sm font-bold text-[#0c3653]">
                {isUploading ? 'جاري رفع وحفظ الصورة في التخزين الدائم...' : 'اختر صورة من جهازك أو اسحبها هنا مباشرة'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                يتم رفع الملف الأصلي وحفظه في Storage الدائم مع تحديث قاعدة البيانات تلقائياً
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 py-2 px-4 bg-[#2fa84f] hover:bg-[#279144] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>رفع صورة من جهازك (مباشر)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 py-2 px-4 bg-white hover:bg-slate-100 text-[#0c3653] text-xs font-bold rounded-xl border border-slate-300 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <FolderOpen className="w-4 h-4 text-[#0872B9]" />
                <span>اختيار من مكتبة الوسائط</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {helperText && <p className="text-[11px] text-slate-500 font-medium">{helperText}</p>}

      {/* Media Picker Modal */}
      <ImagePickerModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectImage={(url) => {
          onChange(url);
          setIsGalleryOpen(false);
          setPreviewError(false);
        }}
        currentImageUrl={value}
        title={`اختيار: ${label}`}
      />
    </div>
  );
};
