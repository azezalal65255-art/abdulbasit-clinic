import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  Smartphone,
  Monitor,
  Tablet,
  MessageSquare,
  Phone,
  Eye,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';

interface AnalyticsViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ showToast }) => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data || {});
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل الإحصائيات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-[#667788]">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
        جاري تحميل تقارير التحليلات...
      </div>
    );
  }

  const metrics = stats?.metrics || {};
  const totalVisits = metrics.totalVisits || 1;
  const whatsappClicks = metrics.whatsappClicks || 0;
  const phoneClicks = metrics.phoneClicks || 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">تحليلات الزوار ومعدلات التحويل الطبي</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            إحصائيات تفاعل المرضى مع الموقع، نقرات حجز الواتساب، والاتصالات الهاتفية
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2 text-gray-500 hover:text-[#064B82] hover:bg-gray-100 rounded-xl transition-colors"
          title="تحديث البيانات"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667788]">إجمالي زيارات الموقع</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#064B82] flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#17354F]">{metrics.totalVisits || 0}</span>
            <span className="text-xs text-blue-600 font-semibold">مشاهدة حية</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667788]">نقرات التواصل عبر واتساب</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#55A630] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#17354F]">{whatsappClicks}</span>
            <span className="text-xs text-emerald-600 font-semibold">استفسار مباشر</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667788]">نقرات الاتصال الهاتفي</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#17354F]">{phoneClicks}</span>
            <span className="text-xs text-indigo-600 font-semibold">مكالمة بدأت</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667788]">معدل التحويل الكلي</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#17354F]">
              {(((whatsappClicks + phoneClicks) / Math.max(1, totalVisits)) * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-amber-600 font-semibold">تفاعل إيجابي</span>
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#17354F] flex items-center gap-2 border-b border-[#E2EAF0] pb-2.5">
            <Smartphone className="w-4 h-4 text-[#064B82]" />
            توزيع أجهزة الزوار (Devices)
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <Smartphone className="w-4 h-4 text-[#0B70B7]" />
                  الهواتف الذكية (Mobile)
                </span>
                <span className="text-[#064B82] font-bold">78%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#064B82] rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <Monitor className="w-4 h-4 text-[#55A630]" />
                  أجهزة الكمبيوتر (Desktop)
                </span>
                <span className="text-[#55A630] font-bold">18%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#55A630] rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <Tablet className="w-4 h-4 text-purple-600" />
                  الأجهزة اللوحية (Tablet)
                </span>
                <span className="text-purple-600 font-bold">4%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '4%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Most Popular Actions */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#17354F] flex items-center gap-2 border-b border-[#E2EAF0] pb-2.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            أكثر الأقسام طلباً واهتماماً من المرضى
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
              <span className="font-semibold text-gray-800">حجز موعد استشارة ومناظير</span>
              <span className="font-bold text-[#064B82]">46% من التفاعلات</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
              <span className="font-semibold text-gray-800">معلومات منظار المعدة والقولون والتحضير</span>
              <span className="font-bold text-[#064B82]">28% من التفاعلات</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
              <span className="font-semibold text-gray-800">مؤهلات وخبرات الدكتور عبدالباسط</span>
              <span className="font-bold text-[#064B82]">14% من التفاعلات</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
              <span className="font-semibold text-gray-800">العنوان وموقع العيادة على الخريطة</span>
              <span className="font-bold text-[#064B82]">12% من التفاعلات</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
