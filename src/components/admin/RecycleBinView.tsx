import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Trash2,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface RecycleBinViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const RecycleBinView: React.FC<RecycleBinViewProps> = ({ showToast }) => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecycleBin = async () => {
    try {
      const data = await api.getRecycleBin();
      setItems(data || []);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل سلة المحذوفات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecycleBin();
  }, []);

  const handleRestore = async (id: string, type: string) => {
    try {
      await api.restoreItem(id, type);
      showToast('success', 'تم استرجاع العنصر المحذوف بنجاح');
      fetchRecycleBin();
    } catch (err: any) {
      showToast('error', err.message || 'فشل استرجاع العنصر');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'booking':
        return 'حجز موعد';
      case 'service':
        return 'خدمة طبية';
      case 'condition':
        return 'حالة مرضية';
      case 'article':
        return 'مقال طبي';
      case 'faq':
        return 'سؤال شائع';
      case 'message':
        return 'رسالة زائر';
      case 'endoscopy':
        return 'إجراء منظار';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">سلة المحذوفات واسترجاع البيانات</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            العناصر المحذوفة مؤقتاً لحمايتها من الخطأ البشري، مع إمكانية استرجاعها فورياً بضغطة زر
          </p>
        </div>
        <button
          onClick={fetchRecycleBin}
          className="p-2 text-gray-500 hover:text-[#064B82] hover:bg-gray-100 rounded-xl transition-colors"
          title="تحديث"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Deleted Items List */}
      <div className="bg-white rounded-2xl border border-[#E2EAF0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#F8FAFC] text-[#667788] border-b border-[#E2EAF0]">
              <tr>
                <th className="py-3 px-4 font-semibold">نوع العنصر</th>
                <th className="py-3 px-4 font-semibold">عنوان أو اسم العنصر</th>
                <th className="py-3 px-4 font-semibold">تاريخ الحذف</th>
                <th className="py-3 px-4 font-semibold text-center">استرجاع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF0]">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#667788]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
                    جاري تحميل سلة المحذوفات...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#667788]">
                    سلة المحذوفات فارغة حالياً
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#0B70B7]">
                      {getTypeLabel(item.type)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#17354F]">
                      {item.data?.patientName ||
                        item.data?.title ||
                        item.data?.question ||
                        item.data?.name ||
                        item.data?.subject ||
                        item.id}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]" dir="ltr">
                      {new Date(item.deletedAt).toLocaleString('ar-YE')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleRestore(item.id, item.type)}
                        className="py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        استرجاع العنصر
                      </button>
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
