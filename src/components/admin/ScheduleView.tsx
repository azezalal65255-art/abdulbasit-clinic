import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Clock,
  Save,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Calendar,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useAutoSaveForm } from '../../hooks/useAutoSaveForm';
import { AutoSaveBadge } from './AutoSaveBadge';

interface ScheduleViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ showToast }) => {
  const [schedule, setSchedule] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSchedule = async () => {
    try {
      const data = await api.getSchedule();
      setSchedule(data || {});
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل أوقات الدوام');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  // Real-time Auto Save to Database & Persistent Storage
  const { markSavedImmediately } = useAutoSaveForm({
    key: 'clinic-schedule',
    data: schedule,
    isReady: !isLoading && schedule !== null,
    onSave: async (updated) => {
      await api.updateSchedule(updated);
    },
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSchedule(schedule);
      markSavedImmediately(schedule);
      showToast('success', 'تم حفظ أوقات الدوام وإعلانات الإجازة بنجاح، وتنعكس مباشرة على الموقع');
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ التعديلات');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-[#667788]">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
        جاري تحميل أوقات الدوام...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">أوقات الدوام وفترات العمل والإجازات</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            تتحكم هذه الشاشة بساعات العمل المعروضة للمرضى وشريط التنبيهات الخاص بالإجازات والمناسبات
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AutoSaveBadge />
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 py-2 px-5 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ يدوي
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Working Hours Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#17354F] flex items-center gap-2 border-b border-[#E2EAF0] pb-2.5">
            <Clock className="w-4 h-4 text-[#064B82]" />
            فترات وساعات العمل اليومية
          </h3>

          <div>
            <label className="block text-xs font-bold text-[#17354F] mb-1">أيام العمل الأسبوعية</label>
            <input
              type="text"
              required
              value={schedule?.workingDays || ''}
              onChange={(e) => setSchedule({ ...schedule, workingDays: e.target.value })}
              placeholder="السبت – الأربعاء"
              className="w-full py-2.5 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0B70B7]"
            />
          </div>

          {/* Morning Shift */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2EAF0] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-[#17354F]">الفترة الصباحية</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={schedule?.morningActive !== false}
                  onChange={(e) => setSchedule({ ...schedule, morningActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#064B82]"
                />
                <span className="text-xs font-semibold text-gray-700">مفعلة</span>
              </label>
            </div>
            <input
              type="text"
              value={schedule?.morningHours || ''}
              onChange={(e) => setSchedule({ ...schedule, morningHours: e.target.value })}
              placeholder="9:00 صباحاً – 2:00 ظهراً"
              className="w-full py-2 px-3 bg-white border border-[#E2EAF0] rounded-lg text-xs"
            />
          </div>

          {/* Evening Shift */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2EAF0] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-[#17354F]">الفترة المسائية</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={schedule?.eveningActive !== false}
                  onChange={(e) => setSchedule({ ...schedule, eveningActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#064B82]"
                />
                <span className="text-xs font-semibold text-gray-700">مفعلة</span>
              </label>
            </div>
            <input
              type="text"
              value={schedule?.eveningHours || ''}
              onChange={(e) => setSchedule({ ...schedule, eveningHours: e.target.value })}
              placeholder="5:00 عصراً – 9:00 مساءً"
              className="w-full py-2 px-3 bg-white border border-[#E2EAF0] rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Emergency / Holiday Notice Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2EAF0] pb-2.5">
            <h3 className="text-xs font-bold text-[#17354F] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              شريط التنبيهات والإجازات الطارئة
            </h3>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={schedule?.isNoticeActive || false}
                onChange={(e) => setSchedule({ ...schedule, isNoticeActive: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-amber-800">تفعيل الإعلان فورياً</span>
            </label>
          </div>

          <p className="text-xs text-[#667788] leading-relaxed">
            عند تفعيل هذا الخيار، سيظهر شريط تنبيه بارز وأنيق في أعلى الموقع العام للمرضى لتنبيههم حول إجازة العيد، أو تغيير طارئ في مواعيد العمل، أو إغلاق مؤقت.
          </p>

          <div>
            <label className="block text-xs font-bold text-[#17354F] mb-1">نص إعلان الإجازة أو التنبيه</label>
            <textarea
              rows={4}
              value={schedule?.emergencyNotice || ''}
              onChange={(e) => setSchedule({ ...schedule, emergencyNotice: e.target.value })}
              placeholder="مثال: تنويه للمراجعين الكرام: تعتذر العيادة عن استقبال الحالات يومي الخميس والجمعة بمناسبة إجازة العيد، وتستأنف المواعيد كالمعتاد صباح السبت القادم بإذن الله."
              className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-[#0B70B7]"
            />
          </div>

          {schedule?.isNoticeActive && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <span className="font-bold block mb-0.5">معاينة الإعلان:</span>
              <p className="leading-relaxed">{schedule.emergencyNotice || 'لا يوجد نص مكتوب بعد'}</p>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};
