import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Download,
  Upload,
  Database,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  FileJson,
  CheckCircle2,
  HardDrive,
  Clock,
  Camera,
  Layers,
  History,
} from 'lucide-react';

interface BackupViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const BackupView: React.FC<BackupViewProps> = ({ showToast }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [restoringSnapshot, setRestoringSnapshot] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  const loadData = async () => {
    try {
      setIsLoadingStatus(true);
      const [status, snaps] = await Promise.all([
        api.getSystemStatus().catch(() => null),
        api.getSnapshots().catch(() => []),
      ]);
      if (status) setSystemStatus(status);
      if (Array.isArray(snaps)) setSnapshots(snaps);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await api.exportBackup();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('download', `clinic-dr-abdulbasit-backup-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('success', 'تم تنزيل نسخة احتياطية كاملة من قاعدة البيانات بنجاح');
    } catch (err: any) {
      showToast('error', err.message || 'فشل تنزيل النسخة الاحتياطية');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateSnapshot = async () => {
    const note = window.prompt('أدخل وصفاً أو ملاحظة للقطة الاحتياطية (اختياري):', 'قبل تعديل المحتوى');
    if (note === null) return;

    try {
      setIsCreatingSnapshot(true);
      await api.createSnapshot(note);
      showToast('success', 'تم إنشاء لقطة احتياطية جديدة بنجاح في Storage الدائم');
      await loadData();
    } catch (err: any) {
      showToast('error', err.message || 'تعذر إنشاء اللقطة الاحتياطية');
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  const handleRestoreSnapshot = async (filename: string) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في استعادة هذه اللقطة الاحتياطية (${filename})؟ سيعاد الموقع إلى حالته عند أخذ اللقطة.`)) {
      return;
    }

    try {
      setRestoringSnapshot(filename);
      await api.restoreSnapshot(filename);
      showToast('success', 'تمت استعادة اللقطة بنجاح! جاري تحديث الصفحة...');
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      showToast('error', err.message || 'تعذر استعادة اللقطة الاحتياطية');
    } finally {
      setRestoringSnapshot(null);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('تحذير: استيراد نسخة احتياطية سيستبدل بيانات الموقع الحالية. هل ترغب في المتابعة؟')) {
      e.target.value = '';
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const json = JSON.parse(reader.result as string);
        await api.restoreBackup(json);
        showToast('success', 'تم استيراد واستعادة قاعدة البيانات بنجاح! سيتم تحديث الصفحة.');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err: any) {
        showToast('error', 'الملف المحدد غير صالح أو تالف');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">النسخ الاحتياطي وحالة التخزين الدائم</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            مراقبة التخزين الدائم للصور وقاعدة البيانات مع إدارة اللقطات الدورية والاستعادة الفورية
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoadingStatus}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-[#0c3653] text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
          <span>تحديث الحالة</span>
        </button>
      </div>

      {/* Live Persistent Storage Status Bar */}
      {systemStatus && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>نظام التخزين الدائم (Persistent Storage & Auto-Snapshot) نشط ومحمي</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-[#064B82]" />
                <span>حجم قاعدة البيانات</span>
              </p>
              <p className="text-sm font-bold text-[#17354F] mt-1">{systemStatus.dbSizeFormatted}</p>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                <span>الصور المخزنة دائمياً</span>
              </p>
              <p className="text-sm font-bold text-emerald-700 mt-1">{systemStatus.uploadsCount} ملف ({systemStatus.uploadsTotalFormatted})</p>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>اللقطات الاحتياطية</span>
              </p>
              <p className="text-sm font-bold text-amber-700 mt-1">{systemStatus.snapshotsCount} لقطة مسجلة</p>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>آخر حفظ تلقائي</span>
              </p>
              <p className="text-xs font-bold text-slate-700 mt-1">
                {new Date(systemStatus.dbLastModified).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Primary Export & Import Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2EAF0] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#064B82] flex items-center justify-center">
            <Download className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#17354F]">تصدير نسخة احتياطية كاملة (JSON)</h3>
            <p className="text-xs text-[#667788] mt-1 leading-relaxed">
              تنزيل ملف خارجي يحتوي على كافة بيانات الموقع وقاعدة البيانات (الملفات التعريفية، الحجوزات، المقالات، الخدمات، والمستخدمين).
            </p>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-xl text-xs space-y-1 text-gray-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#55A630]" />
              <span>تتضمن كل الجداول وسجلات الحجز والروابط الدائمة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#55A630]" />
              <span>جاهزة للاستعادة في أي وقت بأمان</span>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-2.5 px-4 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            تنزيل النسخة الاحتياطية الآن
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2EAF0] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#17354F]">استيراد واستعادة من ملف خارجي</h3>
            <p className="text-xs text-[#667788] mt-1 leading-relaxed">
              رفع ملف نسخة سابقة (.json) لاستعادة كافة البيانات إلى حالتها عند أخذ تلك النسخة.
            </p>
          </div>

          <div className="bg-amber-50/50 p-3 rounded-xl text-xs text-amber-800 flex items-start gap-2 border border-amber-200/60">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              يرجى توخي الحذر: عملية الاستعادة ستقوم بدمج واستبدال السجلات الحالية ببيانات الملف المرفوع.
            </span>
          </div>

          <label className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <FileJson className="w-4 h-4 text-[#064B82]" />
            <span>{isImporting ? 'جاري الاستيراد...' : 'اختر ملف النسخة الاحتياطية (.json)'}</span>
            <input
              type="file"
              accept=".json"
              disabled={isImporting}
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Snapshots Roll & Recovery Manager */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2EAF0] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#064B82]" />
            <div>
              <h3 className="text-sm font-bold text-[#17354F]">اللقطات الاحتياطية الدورية (Snapshots)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                يقوم النظام بحفظ لقطات دورية على مدار الساعة تتيح لك الرجوع لأي نقطة زمنية سابقة بنقرة واحدة
              </p>
            </div>
          </div>

          <button
            onClick={handleCreateSnapshot}
            disabled={isCreatingSnapshot}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isCreatingSnapshot ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
            <span>إنشاء لقطة احتياطية فورية الآن</span>
          </button>
        </div>

        {snapshots.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
            لا توجد لقطات محفوظة حالياً. يتم إنشاء لقطات تلقائية دورياً أو يمكنك النقر على الزر أعلاه لإنشاء واحدة فوراً.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {snapshots.map((snap) => (
              <div key={snap.fileName} className="p-3.5 bg-white hover:bg-slate-50/80 flex items-center justify-between gap-4 transition-colors">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800 font-mono" dir="ltr">
                      {snap.fileName}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                      {snap.sizeFormatted}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    تم الإنشاء: {new Date(snap.createdAt).toLocaleString('ar-EG')}
                  </p>
                </div>

                <button
                  onClick={() => handleRestoreSnapshot(snap.fileName)}
                  disabled={restoringSnapshot === snap.fileName}
                  className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-[#0872B9] text-xs font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  {restoringSnapshot === snap.fileName ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <History className="w-3.5 h-3.5" />
                  )}
                  <span>استعادة هذه النسخة</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
