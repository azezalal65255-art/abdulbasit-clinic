import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ImageUploadField } from './ImageUploadField';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Eye,
  CheckCircle2,
  Save,
  Send,
} from 'lucide-react';
import { useAutoSave } from '../../context/AutoSaveContext';
import { AutoSaveBadge } from './AutoSaveBadge';

interface SlidersViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const SlidersView: React.FC<SlidersViewProps> = ({ showToast }) => {
  const [sliders, setSliders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badgeText: '',
    image: '',
    buttonText: 'حجز موعد استشارة',
    buttonLink: '#booking',
    secondaryButtonText: 'تواصل عبر واتساب',
    secondaryButtonLink: '#contact',
    order: 1,
    isActive: true,
  });

  const fetchSliders = async () => {
    try {
      const data = await api.getSliders();
      setSliders(data || []);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل شرائح السلايدر');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const openNewModal = () => {
    setSelectedItem(null);
    setFormData({
      title: 'رعاية متقدمة لأمراض الجهاز الهضمي والكبد والمناظير',
      subtitle: 'تشخيص دقيق وعلاج متخصص بإشراف د. عبدالباسط عبده الحاج مقبل',
      badgeText: 'استشاري أول الباطنة والجهاز الهضمي',
      image: '/images/hero-doctor.png',
      buttonText: 'حجز موعد استشارة',
      buttonLink: '#booking',
      secondaryButtonText: 'تواصل عبر واتساب',
      secondaryButtonLink: '#contact',
      order: sliders.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setFormData({
      title: item.title || '',
      subtitle: item.subtitle || '',
      badgeText: item.badgeText || '',
      image: item.image || '',
      buttonText: item.buttonText || 'حجز موعد استشارة',
      buttonLink: item.buttonLink || '#booking',
      secondaryButtonText: item.secondaryButtonText || '',
      secondaryButtonLink: item.secondaryButtonLink || '',
      order: item.order || 1,
      isActive: item.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const { triggerAutoSave, setSaveStatus } = useAutoSave();
  const [isSavingSlider, setIsSavingSlider] = useState(false);

  // Auto-save edited Slider when modal is open
  useEffect(() => {
    if (!isModalOpen || !selectedItem?.id || !formData.title.trim()) return;

    triggerAutoSave(
      `slider-${selectedItem.id}`,
      async () => {
        await api.updateSlider(selectedItem.id, formData);
        setSliders((prev) =>
          prev.map((item) => (item.id === selectedItem.id ? { ...item, ...formData } : item))
        );
      },
      { debounceMs: 1400 }
    );
  }, [formData, isModalOpen, selectedItem?.id, triggerAutoSave]);

  const saveSliderWithStatus = async (statusTarget?: boolean) => {
    if (!formData.title.trim()) {
      showToast('error', 'عنوان الشريحة مطلوب');
      return;
    }

    setIsSavingSlider(true);
    const chosenActive = statusTarget !== undefined ? statusTarget : formData.isActive;
    const payload = { ...formData, isActive: chosenActive };

    try {
      if (selectedItem) {
        await api.updateSlider(selectedItem.id, payload);
        showToast(
          'success',
          payload.isActive
            ? 'تم حفظ وتفعيل الشريحة في السلايدر الرئيسي للموقع'
            : 'تم حفظ الشريحة كمسودة مخفية (Save Draft)'
        );
      } else {
        await api.createSlider(payload);
        showToast(
          'success',
          payload.isActive
            ? 'تمت إضافة ونشر الشريحة في السلايدر الرئيسي'
            : 'تمت إضافة الشريحة كمسودة (Save Draft)'
        );
      }
      setSaveStatus('saved');
      setIsModalOpen(false);
      fetchSliders();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ الشريحة');
      setSaveStatus('error', err.message);
    } finally {
      setIsSavingSlider(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSliderWithStatus(formData.isActive);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف هذه الشريحة: "${title}"؟`)) return;

    try {
      await api.deleteSlider(id);
      showToast('success', 'تم نقل الشريحة إلى سلة المحذوفات');
      fetchSliders();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حذف الشريحة');
    }
  };

  const handleToggleStatus = async (item: any) => {
    try {
      await api.updateSlider(item.id, { isActive: !item.isActive });
      showToast('info', item.isActive ? 'تم إخفاء الشريحة' : 'تم تفعيل الشريحة');
      fetchSliders();
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحديث الحالة');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sliders.length) return;

    const newOrder = [...sliders];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    setSliders(newOrder);

    try {
      await api.reorderSliders(newOrder.map((s) => s.id));
      showToast('success', 'تم تحديث الترتيب');
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ الترتيب');
      fetchSliders();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#17354F] flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#2D6A4F]" />
            إدارة شرائح السلايدر والبنرات
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            إدارة البنرات المتحركة في الصفحة الرئيسية ونصوص الدعوة وأزرار الحجز
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSliders}
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
            إضافة شريحة جديدة
          </button>
        </div>
      </div>

      {/* Sliders List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="w-8 h-8 text-[#2D6A4F] animate-spin" />
        </div>
      ) : sliders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">لا توجد شرائح سلايدر حتى الآن</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            أضف شرائح متحركة للواجهة الرئيسية لإبراز خدمات العيادة والشهادات والتقنيات الحديثة.
          </p>
          <button
            onClick={openNewModal}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#2D6A4F] text-white rounded-xl font-medium shadow-sm hover:bg-[#1f4a37] transition"
          >
            <Plus className="w-5 h-5" />
            إضافة شريحة الآن
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sliders.map((item, idx) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl overflow-hidden border shadow-sm transition hover:shadow-md flex flex-col md:flex-row items-center justify-between gap-6 p-5 ${
                item.isActive ? 'border-slate-100' : 'border-slate-200 opacity-75 bg-slate-50'
              }`}
            >
              {/* Preview image */}
              <div className="w-full md:w-56 h-36 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <img
                  src={item.image || '/images/hero-doctor.png'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  {item.badgeText && (
                    <span className="text-xs font-semibold text-[#2D6A4F] bg-[#2D6A4F]/10 px-2.5 py-0.5 rounded-full">
                      {item.badgeText}
                    </span>
                  )}
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.isActive ? 'معروض في السلايدر' : 'مخفي'}
                  </span>
                  <span className="text-xs text-slate-400">شريحة رقم #{idx + 1}</span>
                </div>

                <h3 className="font-bold text-[#17354F] text-base leading-snug">
                  {item.title}
                </h3>

                {item.subtitle && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.subtitle}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  {item.buttonText && (
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
                      الزر الأول: {item.buttonText}
                    </span>
                  )}
                  {item.secondaryButtonText && (
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">
                      الزر الثاني: {item.secondaryButtonText}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center md:flex-col justify-end gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-slate-400 hover:text-[#2D6A4F] disabled:opacity-30 rounded hover:bg-slate-50 transition"
                    title="تحريك لأعلى"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === sliders.length - 1}
                    className="p-1.5 text-slate-400 hover:text-[#2D6A4F] disabled:opacity-30 rounded hover:bg-slate-50 transition"
                    title="تحريك لأسفل"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleToggleStatus(item)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    item.isActive
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  {item.isActive ? 'إخفاء' : 'إظهار'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 text-slate-600 hover:text-[#2D6A4F] hover:bg-slate-50 rounded-lg transition"
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
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 gap-3">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-[#17354F] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#2D6A4F]" />
                  {selectedItem ? 'تعديل شريحة السلايدر' : 'إضافة شريحة جديدة'}
                </h3>
                {selectedItem && <AutoSaveBadge />}
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  شارة مميزة أعلى العنوان (Badge)
                </label>
                <input
                  type="text"
                  value={formData.badgeText}
                  onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                  placeholder="مثال: وحدة المناظير المتقدمة أو رعاية فائقة"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  العنوان الرئيسي للشريحة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: أحدث تقنيات مناظير الجهاز الهضمي التشخيصية والعلاجية"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  النص الفرعي والتوضيحي
                </label>
                <textarea
                  rows={2}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="تشخيص دقيق واستئصال لحميات القولون والمعدة بأمان تام وبدون ألم..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                />
              </div>

              <div>
                <ImageUploadField
                  label="صورة الشريحة"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  description="صورة عالية الوضوح تحافظ على ملامحها الأصلية تماماً بدون أي تعديل ذكاء اصطناعي"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    نص زر الإجراء الأول (CTA)
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="حجز موعد استشارة"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    رابط زر الإجراء الأول
                  </label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    placeholder="#booking أو رابط صفحة"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    نص الزر الثانوي (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryButtonText}
                    onChange={(e) => setFormData({ ...formData, secondaryButtonText: e.target.value })}
                    placeholder="تواصل عبر واتساب"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    رابط الزر الثانوي
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryButtonLink}
                    onChange={(e) => setFormData({ ...formData, secondaryButtonLink: e.target.value })}
                    placeholder="#contact أو رابط خارجي"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm text-left"
                    dir="ltr"
                  />
                </div>
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
                  <option value="active">معروضة في السلايدر</option>
                  <option value="inactive">مخفية مؤقتًا</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSavingSlider}
                    onClick={() => saveSliderWithStatus(false)}
                    className="px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-700" />
                    حفظ كمسودة (Save Draft)
                  </button>
                  <button
                    type="button"
                    disabled={isSavingSlider}
                    onClick={() => saveSliderWithStatus(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1f4a37] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    نشر وتفعيل (Publish)
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
