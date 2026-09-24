import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AdminTab } from '../../types/admin';
import {
  CalendarClock,
  Clock,
  Mail,
  Eye,
  Activity,
  Plus,
  BookOpen,
  Download,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowUpRight,
  TrendingUp,
  Share2,
  Sparkles,
  Phone,
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigateTab: (tab: AdminTab) => void;
  onOpenNewBookingModal: () => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab,
  onOpenNewBookingModal,
  showToast,
}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.getDashboardStats();
      setData(res);
    } catch (err: any) {
      showToast('error', err.message || 'تعذر تحميل بيانات لوحة المتابعة');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await api.updateBooking(bookingId, { status: newStatus });
      showToast('success', 'تم تحديث حالة الحجز بنجاح');
      fetchStats();
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحديث الحالة');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">جديد</span>;
      case 'contacted':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">تم التواصل</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800">مؤكد</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800">مكتمل</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800">ملغي</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#064B82] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-[#667788]">جاري تحميل مؤشرات العيادة...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentBookings = data?.recentBookings || [];
  const recentMessages = data?.recentMessages || [];
  const schedule = data?.schedule || {};

  return (
    <div className="space-y-6">

      {/* Emergency Notice Alert Banner if Active */}
      {schedule.isNoticeActive && schedule.emergencyNotice && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">تنبيه مواعيد العيادة مفعل حالياً على الموقع العام</p>
              <p className="text-sm font-semibold mt-0.5">{schedule.emergencyNotice}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('schedule')}
            className="text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
          >
            تعديل الإعلان
          </button>
        </div>
      )}

      {/* Quick Action Strip */}
      <div className="bg-white rounded-2xl p-4 border border-[#E2EAF0] shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#55A630]" />
          <span className="text-xs font-bold text-[#17354F]">إجراءات سريعة ومباشرة:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewBookingModal}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة حجز يدوي
          </button>

          <button
            onClick={() => onNavigateTab('articles')}
            className="inline-flex items-center gap-1.5 py-2 px-3 bg-[#F4F8FB] hover:bg-[#E2EAF0] text-[#064B82] text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#0B70B7]" />
            كتابة مقال طبي
          </button>

          <button
            onClick={() => onNavigateTab('schedule')}
            className="inline-flex items-center gap-1.5 py-2 px-3 bg-[#F4F8FB] hover:bg-[#E2EAF0] text-[#064B82] text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[#0B70B7]" />
            تعديل مواعيد الدوام
          </button>

          <a
            href="/api/admin/backup/export"
            className="inline-flex items-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#2F8B3C] border border-emerald-200 text-xs font-bold rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            تصدير نسخة احتياطية
          </a>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: New Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667788]">الحجوزات الجديدة</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#55A630] flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#17354F]">{metrics.newBookings || 0}</span>
            <span className="text-xs text-emerald-600 font-semibold">بانتظار التأكيد</span>
          </div>
          <button
            onClick={() => onNavigateTab('bookings')}
            className="mt-3 text-xs font-bold text-[#0B70B7] hover:underline flex items-center gap-1"
          >
            متابعة الحجوزات
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 2: Total Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667788]">إجمالي المواعيد المسجلة</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#064B82] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#17354F]">{metrics.totalBookings || 0}</span>
            <span className="text-xs text-[#667788]">حجز كلي</span>
          </div>
          <p className="mt-3 text-xs text-[#667788]">
            منها <strong className="text-indigo-600 font-bold">{metrics.confirmedBookings || 0}</strong> موعداً مؤكداً
          </p>
        </div>

        {/* Metric 3: New Messages */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667788]">رسائل الزوار الجديدة</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#17354F]">{metrics.newMessages || 0}</span>
            <span className="text-xs text-amber-600 font-semibold">استفسار وارد</span>
          </div>
          <button
            onClick={() => onNavigateTab('messages')}
            className="mt-3 text-xs font-bold text-[#0B70B7] hover:underline flex items-center gap-1"
          >
            فتح صندوق الرسائل
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 4: Total Visits */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667788]">زيارات وتفاعل الموقع</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#17354F]">{metrics.totalVisits || 0}</span>
            <span className="text-xs text-purple-600 font-semibold">زيارة حية</span>
          </div>
          <p className="mt-3 text-xs text-[#667788]">
            <strong className="text-emerald-600 font-bold">{metrics.whatsappClicks || 0}</strong> نقرة واتساب
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Bookings & Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Recent Bookings Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2EAF0] shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E2EAF0] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#064B82]">أحدث طلبات الحجز والمواعيد</h2>
              <p className="text-xs text-[#667788] mt-0.5">المرضى الذين سجلوا حجوزاتهم عبر الموقع حديثًا</p>
            </div>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-xs font-bold text-[#0B70B7] hover:underline flex items-center gap-1"
            >
              عرض كافة الحجوزات
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#F8FAFC] text-[#667788] border-b border-[#E2EAF0]">
                <tr>
                  <th className="py-3 px-4 font-semibold">المريض</th>
                  <th className="py-3 px-4 font-semibold">الهاتف</th>
                  <th className="py-3 px-4 font-semibold">الموعد المطلوب</th>
                  <th className="py-3 px-4 font-semibold">الحالة</th>
                  <th className="py-3 px-4 font-semibold text-center">إجراء سريع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2EAF0]">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#667788]">
                      لا توجد حجوزات مسجلة حاليًا
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b: any) => (
                    <tr key={b.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#17354F]">
                        {b.patientName}
                        <span className="block text-[10px] text-[#667788] font-normal mt-0.5">
                          {b.visitType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-700" dir="ltr">
                        {b.phone}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-800">{b.preferredDate}</span>
                        <span className="block text-[10px] text-gray-500">
                          {b.preferredShift === 'morning' ? 'صباحي (9ص - 2ظ)' : 'مسائي (5ع - 9م)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={`https://wa.me/967${b.phone}?text=${encodeURIComponent(
                              `مرحبًا أخي/أختي ${b.patientName}، نتواصل معكم من عيادة د. عبدالباسط مقبل بخصوص موعدكم المحجوز يوم ${b.preferredDate}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="مراسلة واتساب فورية"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`tel:${b.phone}`}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            title="اتصال هاتفي"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          {b.status === 'new' && (
                            <button
                              onClick={() => handleStatusChange(b.id, 'confirmed')}
                              className="px-2 py-1 rounded-md bg-[#064B82] text-white text-[10px] font-bold hover:bg-[#0B70B7]"
                            >
                              تأكيد
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Recent Messages & Clinic Schedule Snapshot */}
        <div className="space-y-6">
          {/* Working Schedule Status */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2EAF0] shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2EAF0]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#064B82]" />
                <h2 className="text-xs font-bold text-[#064B82]">أوقات دوام العيادة الحالية</h2>
              </div>
              <button
                onClick={() => onNavigateTab('schedule')}
                className="text-[11px] font-bold text-[#0B70B7] hover:underline"
              >
                تعديل
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <span className="text-[#667788]">الفترة الصباحية:</span>
                <span className="font-bold text-[#17354F]">{schedule.morningHours}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <span className="text-[#667788]">الفترة المسائية:</span>
                <span className="font-bold text-[#17354F]">{schedule.eveningHours}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <span className="text-[#667788]">أيام العمل:</span>
                <span className="font-bold text-[#55A630]">{schedule.workingDays}</span>
              </div>
            </div>
          </div>

          {/* Recent Inquiries Snapshot */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2EAF0] shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2EAF0]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#064B82]" />
                <h2 className="text-xs font-bold text-[#064B82]">أحدث رسائل الموقع</h2>
              </div>
              <button
                onClick={() => onNavigateTab('messages')}
                className="text-[11px] font-bold text-[#0B70B7] hover:underline"
              >
                الصندوق
              </button>
            </div>

            <div className="space-y-3">
              {recentMessages.length === 0 ? (
                <p className="text-xs text-[#667788] text-center py-4">لا توجد رسائل جديدة</p>
              ) : (
                recentMessages.map((m: any) => (
                  <div key={m.id} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2EAF0]/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#17354F]">{m.name}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(m.createdAt).toLocaleDateString('ar-YE')}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#0B70B7] truncate">{m.subject}</p>
                    <p className="text-[11px] text-[#667788] line-clamp-2 leading-relaxed">{m.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
