import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  ShieldAlert,
  Clock,
  User,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

interface ActivityLogViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ showToast }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      const data = await api.getActivityLogs();
      setLogs(data || []);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل سجل النشاط');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    return (
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.module?.toLowerCase().includes(search.toLowerCase()) ||
      log.userName?.toLowerCase().includes(search.toLowerCase()) ||
      log.details?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
      case 'insert':
        return <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">إضافة</span>;
      case 'update':
        return <span className="bg-blue-100 text-[#064B82] font-bold px-2 py-0.5 rounded text-[10px]">تعديل</span>;
      case 'delete':
        return <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">حذف</span>;
      case 'restore':
        return <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[10px]">استرجاع</span>;
      case 'login':
        return <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">دخول</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-[10px]">{action}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">سجل النشاط الإداري وتدقيق العمليات (Audit Logs)</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            توثيق دقيق لكل عملية إضافة، تعديل، حذف أو دخول للنظام مع هوية المستخدم والوقت
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="بحث في السجل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-2 pl-3 pr-8 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5" />
          </div>

          <button
            onClick={fetchLogs}
            className="p-2 text-gray-500 hover:text-[#064B82] hover:bg-gray-100 rounded-xl transition-colors"
            title="تحديث"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-[#E2EAF0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#F8FAFC] text-[#667788] border-b border-[#E2EAF0]">
              <tr>
                <th className="py-3 px-4 font-semibold">التاريخ والوقت</th>
                <th className="py-3 px-4 font-semibold">المستخدم</th>
                <th className="py-3 px-4 font-semibold">نوع الإجراء</th>
                <th className="py-3 px-4 font-semibold">الوحدة / القسم</th>
                <th className="py-3 px-4 font-semibold">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF0]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#667788]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
                    جاري تحميل السجلات...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#667788]">
                    لا توجد سجلات نشاط مسجلة
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3 px-4 text-gray-500 font-mono text-[11px]" dir="ltr">
                      {new Date(log.timestamp).toLocaleString('ar-YE')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#17354F]">
                      {log.userName || 'النظام'}
                    </td>
                    <td className="py-3 px-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#0B70B7]">
                      {log.module}
                    </td>
                    <td className="py-3 px-4 text-gray-700 max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
