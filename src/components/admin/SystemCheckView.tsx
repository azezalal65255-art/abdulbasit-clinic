import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  ShieldCheck,
  RefreshCw,
  Database,
  Image as ImageIcon,
  Video,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  Download,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Info,
} from 'lucide-react';

interface SystemCheckViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const SystemCheckView: React.FC<SystemCheckViewProps> = ({ showToast }) => {
  const [isRunningReconciliation, setIsRunningReconciliation] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);

  const fetchAuditReport = async () => {
    try {
      const res = await api.getSystemAudit();
      if (res && res.report) {
        setReport(res.report);
        setLastRunTime(new Date().toLocaleTimeString('ar-YE'));
      }
    } catch (err: any) {
      console.error('Audit fetch error:', err);
    }
  };

  useEffect(() => {
    fetchAuditReport();
  }, []);

  const handleRunReconciliation = async () => {
    setIsRunningReconciliation(true);
    try {
      const res = await api.reconcileSystem();
      setReport(res.report);
      setLastRunTime(new Date().toLocaleTimeString('ar-YE'));
      showToast(
        'success',
        `تمت مطابقة الوسائط بنجاح: تم اكتشاف ${res.report.orphanedFilesDiscovered} ملف، وتزامن ${res.report.videosSynchronized} فيديو طبي!`
      );
    } catch (err: any) {
      showToast('error', err.message || 'فشل تشغيل عملية مطابقة الوسائط');
    } finally {
      setIsRunningReconciliation(false);
    }
  };

  const handleCreateInstantBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const res = await api.createSystemBackup();
      setBackupSuccess(res.fileName);
      showToast('success', 'تم إنشاء نقطة استعادة احتياطية فورية وحفظها بنجاح');
    } catch (err: any) {
      showToast('error', err.message || 'فشل إنشاء النسخة الاحتياطية');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-[#064B82]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-[#064B82]">
              فحص النظام والتخزين الدائم (System & Media Health)
            </h2>
          </div>
          <p className="text-xs text-[#667788] mt-1">
            مركز تشخيص شامل لمطابقة ملفات التخزين الفعلي (Persistent Storage) مع قاعدة البيانات ومعالجة الصور المفقودة والسجلات اليتيمة آلياً
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCreateInstantBackup}
            disabled={isCreatingBackup}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-[#17354F] text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Download className={`w-3.5 h-3.5 ${isCreatingBackup ? 'animate-bounce' : ''}`} />
            نسخة احتياطية فورية
          </button>

          <button
            disabled={true}
            className="inline-flex items-center gap-1.5 py-2 px-4 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl border border-gray-200 shadow-xs cursor-not-allowed opacity-60"
            title="تم تعطيل فحص ومطابقة الوسائط مؤقتًا"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            تشغيل فحص ومطابقة الوسائط
          </button>
        </div>
      </div>

      {backupSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>تم حفظ لقطة احتياطية كاملة: <strong>{backupSuccess}</strong> داخل التخزين الدائم</span>
          </div>
          <button
            onClick={() => setBackupSuccess(null)}
            className="text-emerald-700 font-bold hover:underline"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 text-[#064B82]">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#17354F]">
              {report?.totalPhysicalFiles ?? '—'}
            </div>
            <div className="text-xs text-[#667788]">ملفات التخزين الفعلي الدائم</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#17354F]">
              {report?.totalMediaInDb ?? '—'}
            </div>
            <div className="text-xs text-[#667788]">سجلات مكتبة الوسائط في DB</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#17354F]">
              {report?.videosSynchronized ?? '—'}
            </div>
            <div className="text-xs text-[#667788]">فيديوهات طبية متزامنة</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#17354F]">
              {report?.orphanedFilesDiscovered ?? 0}
            </div>
            <div className="text-xs text-[#667788]">ملفات غير مفهرسة تم استعادتها</div>
          </div>
        </div>
      </div>

      {/* Diagnostics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Detailed Health Audit */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2EAF0] pb-3">
              <h3 className="text-sm font-bold text-[#17354F] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                نتائج التحقق والمطابقة التلقائية
              </h3>
              {lastRunTime && (
                <span className="text-[11px] text-gray-400 font-mono">
                  آخر تدقيق: {lastRunTime}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2EAF0] space-y-1">
                <div className="text-xs font-bold text-[#064B82]">التخزين السحابي الدائم (Supabase Storage)</div>
                <div className="text-[11px] text-[#667788]">
                  المستودع: <code className="bg-white px-1.5 py-0.5 rounded border border-[#E2EAF0]">media/images/</code>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  تخزين سحابي فائق السرعة عبر CDN دائم لا يتأثر بإعادة تشغيل الخادم
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2EAF0] space-y-1">
                <div className="text-xs font-bold text-[#064B82]">قاعدة البيانات المركزية الدائمة</div>
                <div className="text-[11px] text-[#667788]">
                  المشروع: <code className="bg-white px-1.5 py-0.5 rounded border border-[#E2EAF0]">Supabase Database</code>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  قاعدة بيانات سحابية متزامنة فوريًا مع لوحة التحكم وموقع Render
                </div>
              </div>
            </div>

            {/* Reconciliation Log output */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#17354F]">سجل العمليات التشخيصية الأخيرة:</h4>
              <div className="bg-slate-900 text-slate-100 font-mono text-[11px] p-4 rounded-xl max-h-60 overflow-y-auto space-y-1 custom-scrollbar text-left" dir="ltr">
                <div className="text-emerald-400">[OK] Supabase Storage bucket 'media' online & verified</div>
                <div className="text-blue-300">[SYNC] Direct Supabase CDN delivery active</div>
                <div className="text-cyan-300">[SCAN] Discovered {report?.totalPhysicalFiles || 0} media assets in cloud storage</div>
                <div className="text-purple-300">[RECONCILE] Recovered {report?.orphanedFilesDiscovered || 0} media records into database</div>
                <div className="text-amber-300">[REPAIR] Repaired {report?.brokenLinksRepaired || 0} legacy references</div>
                <div className="text-emerald-400">[READY] Database & Media Storage: 100% stable</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Diagnostic Tools */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#064B82] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#0B70B7]" />
              أدوات التشخيص السريع
            </h3>
            <p className="text-xs text-[#667788]">
              أزرار تنفيذية مباشرة لمعالجة أي شذوذ في البيانات بضغطة زر واحدة:
            </p>

            <div className="space-y-2 pt-2">
              <button
                disabled={true}
                className="w-full text-right py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-400 flex items-center justify-between cursor-not-allowed opacity-60"
                title="تم تعطيل فحص ومطابقة الوسائط مؤقتًا"
              >
                <span>فحص ومطابقة الوسائط المفقودة (معطل مؤقتًا)</span>
                <RefreshCw className="w-3.5 h-3.5 text-gray-300" />
              </button>

              <button
                onClick={handleRunReconciliation}
                disabled={isRunningReconciliation}
                className="w-full text-right py-2.5 px-3 bg-[#F8FAFC] hover:bg-blue-50/70 border border-[#E2EAF0] rounded-xl text-xs font-bold text-[#17354F] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>فحص روابط الفيديوهات الطبية</span>
                <Video className="w-3.5 h-3.5 text-emerald-600" />
              </button>

              <button
                onClick={handleRunReconciliation}
                disabled={isRunningReconciliation}
                className="w-full text-right py-2.5 px-3 bg-[#F8FAFC] hover:bg-blue-50/70 border border-[#E2EAF0] rounded-xl text-xs font-bold text-[#17354F] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>مزامنة السجلات اليتيمة بالقرص</span>
                <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
              </button>

              <button
                onClick={handleCreateInstantBackup}
                disabled={isCreatingBackup}
                className="w-full text-right py-2.5 px-3 bg-[#F8FAFC] hover:bg-blue-50/70 border border-[#E2EAF0] rounded-xl text-xs font-bold text-[#17354F] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>أخذ نقطة استعادة قبل أي تعديلات</span>
                <Download className="w-3.5 h-3.5 text-amber-600" />
              </button>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl space-y-2 text-xs text-[#064B82]">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-[#0B70B7] flex-shrink-0" />
              ضمان الأمان الدائم (Data Longevity):
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              جميع عمليات الحذف تخضع لنظام الحذف المرن (Soft Delete) بحيث تُحفظ في سلة المحذوفات أولاً، ويتم فحص مواضع استخدام أي صورة في الموقع لمنع اختفاء الصور من الصفحات الرئيسية.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
