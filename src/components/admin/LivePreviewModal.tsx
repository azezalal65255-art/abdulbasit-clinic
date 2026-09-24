import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  Maximize2,
  Minimize2,
  Eye,
  CheckCircle,
} from 'lucide-react';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPath?: string;
}

export const LivePreviewModal: React.FC<LivePreviewModalProps> = ({
  isOpen,
  onClose,
  defaultPath = '/',
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewPath, setPreviewPath] = useState(defaultPath);

  if (!isOpen) return null;

  const getFrameWidth = () => {
    switch (device) {
      case 'mobile':
        return 'w-[375px] max-w-full';
      case 'tablet':
        return 'w-[768px] max-w-full';
      default:
        return 'w-full';
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4">
      <div
        className={`bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 w-full ${
          isFullscreen ? 'h-full max-w-full' : 'h-[94vh] max-w-6xl'
        }`}
      >
        {/* Top Control Bar */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#064B82] to-[#0B70B7] flex items-center justify-center text-white shadow-sm">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100">معاينة الموقع المباشرة (Live Preview)</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  متزامن مع التعديلات
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                شاهد موقع عيادة د. عبدالباسط مقبل مباشرة وتأكد من تناسق النصوص والصور قبل النشر
              </p>
            </div>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                device === 'desktop'
                  ? 'bg-[#0B70B7] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="عرض شاشة الكمبيوتر (Desktop)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">كمبيوتر</span>
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                device === 'tablet'
                  ? 'bg-[#0B70B7] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="عرض الأجهزة اللوحية (Tablet)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تابلت</span>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                device === 'mobile'
                  ? 'bg-[#0B70B7] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="عرض الهاتف المحمول (Mobile)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">جوال</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="تحديث صفحة المعاينة"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <a
              href={previewPath}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors inline-flex items-center gap-1 text-xs"
              title="فتح في تبويب مستقل جديد"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">فتح بتبويب جديد</span>
            </a>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              title="إغلاق المعاينة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="flex-1 bg-slate-950 p-2 sm:p-4 flex items-center justify-center overflow-auto">
          <div
            className={`h-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-800 transition-all duration-300 flex flex-col ${getFrameWidth()}`}
          >
            <iframe
              key={refreshKey}
              src={previewPath}
              title="Live Site Preview"
              className="w-full h-full border-0 flex-1 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
