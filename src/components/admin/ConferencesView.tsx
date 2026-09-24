import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ImageUploadField } from './ImageUploadField';
import {
  Award,
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
  Calendar,
  MapPin,
  Building,
  ChevronUp,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';

interface ConferencesViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const ConferencesView: React.FC<ConferencesViewProps> = ({ showToast }) => {
  const [conferences, setConferences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    organizer: '',
    location: '',
    date: '',
    year: new Date().getFullYear().toString(),
    role: 'متحدث رئيسي ومشارك علمي',
    description: '',
    image: '',
    certificateUrl: '',
    order: 1,
    isActive: true,
  });

  const fetchConferences = async () => {
    try {
      const data = await api.getConferences();
      setConferences(data || []);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل المؤتمرات والمشاركات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConferences();
  }, []);

  const openNewModal = () => {
    setSelectedItem(null);
    setFormData({
      title: '',
      organizer: 'الجمعية الطبية لأمراض الجهاز الهضمي والكبد',
      location: 'القاهرة، مصر',
      date: '',
      year: new Date().getFullYear().toString(),
      role: 'متحدث ومشارك علمي',
      description: '',
      image: '',
      certificateUrl: '',
      order: conferences.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setFormData({
      title: item.title || '',
      organizer: item.organizer || '',
      location: item.location || '',
      date: item.date || '',
      year: item.year || new Date().getFullYear().toString(),
      role: item.role || 'مشارك',
      description: item.description || '',
      image: item.image || '',
      certificateUrl: item.certificateUrl || '',
      order: item.order || 1,
      isActive: item.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'عنوان المؤتمر أو الفعالية مطلوب');
      return;
    }

    try {
      if (selectedItem) {
        await api.updateConference(selectedItem.id, formData);
        showToast('success', 'تم تعديل بيانات المؤتمر بنجاح');
      } else {
        await api.createConference(formData);
        showToast('success', 'تمت إضافة المؤتمر بنجاح');
      }
      setIsModalOpen(false);
      fetchConferences();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ المؤتمر');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف المؤتمر: "${title}"؟`)) return;

    try {
      await api.deleteConference(id);
      showToast('success', 'تم نقل المؤتمر إلى سلة المحذوفات');
      fetchConferences();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حذف المؤتمر');
    }
  };

  const handleToggleStatus = async (item: any) => {
    try {
      await api.updateConference(item.id, { isActive: !item.isActive });
      showToast('info', item.isActive ? 'تم إخفاء المؤتمر' : 'تم تفعيل عرض المؤتمر');
      fetchConferences();
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحديث الحالة');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= conferences.length) return;

    const newOrder = [...conferences];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    setConferences(newOrder);

    try {
      await api.reorderConferences(newOrder.map((c) => c.id));
      showToast('success', 'تم تحديث الترتيب');
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ الترتيب');
      fetchConferences();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#17354F] flex items-center gap-2">
            <Award className="w-6 h-6 text-[#2D6A4F]" />
            المؤتمرات والمشاركات العلمية
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            إدارة وتوثيق المؤتمرات الطبية والدولية وورش العمل والندوات التي شارك بها الطبيب
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchConferences}
            className="p-2.5 text-slate-500 hover:text-[#2D6A4F] hover:bg-slate-50 rounded-xl transition border border-slate-200"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2D6A4F] hover:bg-[#1f4a37] text-white rounded-xl font-medium shadow-sm transition"
          >
            <Plus className="w-5 h-5" />
            إضافة مؤتمر جديد
          </button>
        </div>
      </div>

      {/* Conferences List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="w-8 h-8 text-[#2D6A4F] animate-spin" />
        </div>
      ) : conferences.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">لا توجد مؤتمرات مضافة حتى الآن</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            قم بإضافة أول مشاركة علمية أو مؤتمر دولي لإبراز المسيرة الأكاديمية والمهنية للطبيب.
          </p>
          <button
            onClick={openNewModal}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#2D6A4F] text-white rounded-xl font-medium shadow-sm hover:bg-[#1f4a37] transition"
          >
            <Plus className="w-5 h-5" />
            إضافة مؤتمر الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conferences.map((item, idx) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl overflow-hidden border shadow-sm transition hover:shadow-md flex flex-col justify-between ${
                item.isActive ? 'border-slate-100' : 'border-slate-200 opacity-75 bg-slate-50'
              }`}
            >
              <div>
                {/* Image / Header */}
                {item.image ? (
                  <div className="h-40 bg-slate-100 overflow-hidden relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 right-2 bg-[#17354F]/85 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      {item.year || item.date}
                    </span>
                  </div>
                ) : (
                  <div className="h-28 bg-gradient-to-l from-[#2D6A4F]/10 to-slate-100 flex items-center justify-between p-4 border-b border-slate-100">
                    <Award className="w-10 h-10 text-[#2D6A4F]/40" />
                    <span className="bg-[#17354F] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      {item.year || item.date}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-[#2D6A4F] bg-[#2D6A4F]/10 px-2 py-0.5 rounded">
                      {item.role || 'مشارك'}
                    </span>
                  </div>

                  <h3 className="font-bold text-[#17354F] text-base leading-snug">
                    {item.title}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    {item.organizer && (
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.organizer}</span>
                      </div>
                    )}
                    {item.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.location}</span>
                      </div>
                    )}
                    {item.date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.date}</span>
                      </div>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-slate-400 hover:text-[#2D6A4F] disabled:opacity-30 rounded hover:bg-white transition"
                    title="تحريك لأعلى"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === conferences.length - 1}
                    className="p-1.5 text-slate-400 hover:text-[#2D6A4F] disabled:opacity-30 rounded hover:bg-white transition"
                    title="تحريك لأسفل"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                      item.isActive
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    {item.isActive ? 'إخفاء' : 'إظهار'}
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 text-slate-600 hover:text-[#2D6A4F] hover:bg-white rounded-lg transition"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg text-[#17354F] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#2D6A4F]" />
                {selectedItem ? 'تعديل بيانات المؤتمر' : 'إضافة مؤتمر جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  اسم المؤتمر أو الندوة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: المؤتمر السنوي لجمعية أمراض الكبد والجهاز الهضمي"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    الجهة المنظمة
                  </label>
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    placeholder="مثال: جامعة القاهرة / الرابطة العربية"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    مكان الانعقاد
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="القاهرة، جمهورية مصر العربية"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    السنة أو التاريخ
                  </label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2024 أو مايو 2024"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    طبيعة المشاركة / الصفة
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="متحدث رئيسي / رئيس جلسة / مشارك"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                  />
                </div>
              </div>

              <div>
                <ImageUploadField
                  label="صورة تذكارية أو صورة المؤتمر (اختياري)"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  description="صورة أصلية عالية الجودة لتوثيق المشاركة بدون أي تعديل أو معالجة ذكاء اصطناعي"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  نبذة عن الموضوع أو ورقة العمل
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="تقديم بحث حول تقنيات المناظير المتقدمة في إيقاف نزيف الجهاز الهضمي..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  حالة العرض
                </label>
                <select
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm bg-white"
                >
                  <option value="active">معروض ونشط في الموقع</option>
                  <option value="inactive">مخفي مؤقتًا</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1f4a37] text-white font-medium text-sm shadow-sm transition"
                >
                  {selectedItem ? 'حفظ التعديلات' : 'إضافة المؤتمر'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
