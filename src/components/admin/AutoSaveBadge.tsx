import React from 'react';
import { useAutoSave } from '../../context/AutoSaveContext';
import { RefreshCw, CheckCircle2, AlertCircle, Cloud, CloudOff } from 'lucide-react';

interface AutoSaveBadgeProps {
  className?: string;
  showDetails?: boolean;
}

export const AutoSaveBadge: React.FC<AutoSaveBadgeProps> = ({ className = '', showDetails = true }) => {
  const { status, lastSavedAt, errorMessage } = useAutoSave();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
        status === 'saving'
          ? 'bg-amber-50 text-amber-800 border border-amber-200'
          : status === 'saved'
          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          : status === 'error'
          ? 'bg-rose-50 text-rose-800 border border-rose-200'
          : 'bg-slate-50 text-slate-600 border border-slate-200/80'
      } ${className}`}
      dir="rtl"
      title={
        status === 'saving'
          ? 'جاري حفظ التعديل في قاعدة البيانات والتخزين الدائم...'
          : status === 'saved'
          ? 'تم تأكيد الحفظ في الخادم والتخزين الدائم بنجاح'
          : status === 'error'
          ? errorMessage || 'فشل الحفظ التلقائي'
          : lastSavedAt
          ? `آخر حفظ: ${lastSavedAt.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
          : 'الحفظ التلقائي مفعّل ومحمي'
      }
    >
      {status === 'saving' ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
          <span className="font-bold">Saving…</span>
        </>
      ) : status === 'saved' ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-75 duration-200" />
          <span className="font-bold text-emerald-700">Saved Successfully</span>
        </>
      ) : status === 'error' ? (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          <span className="font-bold text-rose-700">فشل الحفظ!</span>
        </>
      ) : (
        <>
          <Cloud className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-500 font-medium">
            {lastSavedAt
              ? `محفوظ ${lastSavedAt.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`
              : 'Auto Save مفعّل'}
          </span>
        </>
      )}

      {showDetails && status === 'saving' && (
        <span className="hidden md:inline text-[10px] text-amber-700/80 mr-1 border-r border-amber-200 pr-1.5">
          جاري التثبيت...
        </span>
      )}
    </div>
  );
};
