import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ImageUploadField } from './ImageUploadField';
import {
  Eye,
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
  Clock,
  FileCheck,
  CheckCircle2,
  Image as ImageIcon,
  Save,
  Send,
} from 'lucide-react';
import { useAutoSave } from '../../context/AutoSaveContext';
import { AutoSaveBadge } from './AutoSaveBadge';

interface EndoscopyViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const EndoscopyView: React.FC<EndoscopyViewProps> = ({ showToast }) => {
  const [procedures, setProcedures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    indicationsText: '',
    duration: '',
    prepSummary: '',
    isActive: true,
  });

  const fetchProcedures = async () => {
    try {
      const data = await api.getEndoscopy();
      setProcedures(data || []);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل إجراءات المناظير');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProcedures();
  }, []);

  const openNewModal = () => {
    setSelectedItem(null);
    setFormData({
      title: '',
      description: '',
      image: '/images/endoscopy-unit.jpg',
      indicationsText: '',
      duration: '15 - 20 دقيقة',
      prepSummary: 'صيام 6 إلى 8 ساعات قبل الإجراء',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      image: item.image || '',
      indicationsText: Array.isArray(item.indications) ? item.indications.join('\n') : '',
      duration: item.duration || '',
      prepSummary: item.prepSummary || '',
      isActive: item.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const { triggerAutoSave, setSaveStatus } = useAutoSave();
  const [isSavingProcedure, setIsSavingProcedure] = useState(false);

  // Auto-save edited Endoscopy Procedure when modal is active
  useEffect(() => {
    if (!isModalOpen || !selectedItem?.id || !formData.title.trim()) return;

    triggerAutoSave(
      `endoscopy-${selectedItem.id}`,
      async () => {
        const payload = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          image: formData.image.trim(),
          indications: formData.indicationsText
            .split('\n')
            .map((i) => i.trim())
            .filter(Boolean),
          duration: formData.duration.trim(),
          prepSummary: formData.prepSummary.trim(),
          isActive: formData.isActive,
        };

        await api.updateEndoscopy(selectedItem.id, payload);
        setProcedures((prev) =>
          prev.map((item) => (item.id === selectedItem.id ? { ...item, ...payload } : item))
        );
      },
      { debounceMs: 1400 }
    );
  }, [formData, isModalOpen, selectedItem?.id, triggerAutoSave]);

  const saveProcedureWithStatus = async (statusTarget?: boolean) => {
    if (!formData.title.trim()) {
      showToast('error', 'عنوان الإجراء حقل مطلوب');
      return;
    }

    setIsSavingProcedure(true);
    const chosenActive = statusTarget !== undefined ? statusTarget : formData.isActive;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      image: formData.image.trim(),
      indications: formData.indicationsText
        .split('\n')
        .map((i) => i.trim())
        .filter(Boolean),
      duration: formData.duration.trim(),
      prepSummary: formData.prepSummary.trim(),
      isActive: chosenActive,
    };

    try {
      if (selectedItem) {
        await api.updateEndoscopy(selectedItem.id, payload);
        showToast(
          'success',
          payload.isActive
            ? 'تم حفظ وتفعيل إجراء المنظار بنجاح على الموقع'
            : 'تم حفظ إجراء المنظار كمسودة غير مفعلة (Save Draft)'
        );
      } else {
        await api.createEndoscopy(payload);
        showToast(
          'success',
          payload.isActive
            ? 'تمت إضافة ونشر إجراء المنظار بنجاح'
            : 'تمت إضافة إجراء المنظار كمسودة (Save Draft)'
        );
      }
      setSaveStatus('saved');
      setIsModalOpen(false);
      fetchProcedures();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ الإجراء');
      setSaveStatus('error', err.message);
    } finally {
      setIsSavingProcedure(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProcedureWithStatus(formData.isActive);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف: "${title}"؟`)) return;
    try {
      await api.deleteEndoscopy(id);
      showToast('info', 'تم نقل المنظار إلى سلة المحذوفات');
      fetchProcedures();
    } catch (err: any) {
      showToast('error', err.message || 'فشل الحذف');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">إدارة مناظير الجهاز الهضمي والتحضير</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            تتحكم هذه القائمة بقسم المناظير التشخيصية والعلاجية، مدة الفحص وإرشادات التحضير للمريض
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-1.5 py-2 px-4 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          إضافة إجراء منظار جديد
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-[#667788]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
          جاري تحميل إجراءات المناظير...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {procedures.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-[#E2EAF0] shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="h-40 bg-gray-100 overflow-hidden relative">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-[#064B82]/90 text-white text-xs font-bold px-3 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    منظار متقدم
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-sm font-bold text-[#17354F]">{p.title}</h3>
                  <p className="text-xs text-[#667788] leading-relaxed line-clamp-2">{p.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#E2EAF0]/60">
                    <div className="bg-[#F8FAFC] p-2 rounded-lg flex items-center gap-1.5 text-gray-700">
                      <Clock className="w-3.5 h-3.5 text-[#0B70B7]" />
                      <span>{p.duration || 'غير محدد'}</span>
                    </div>
                    <div className="bg-[#F8FAFC] p-2 rounded-lg flex items-center gap-1.5 text-gray-700">
                      <FileCheck className="w-3.5 h-3.5 text-[#55A630]" />
                      <span className="truncate">{p.prepSummary || 'صيام مسبق'}</span>
                    </div>
                  </div>

                  {p.indications && p.indications.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-gray-400 block">دواعي الإجراء:</span>
                      {p.indications.slice(0, 2).map((ind: string, i: number) => (
                        <div key={i} className="text-[11px] text-[#064B82] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#55A630] flex-shrink-0" />
                          <span className="truncate">{ind}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-[#E2EAF0] bg-[#F8FAFC]/50 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(p)}
                  className="py-1 px-3 bg-blue-50 text-[#064B82] hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  تعديل الإجراء
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.title)}
                  className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Endoscopy */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF0] max-w-lg w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-[#E2EAF0] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-[#064B82]">
                  {selectedItem ? 'تعديل إجراء المنظار' : 'إضافة إجراء منظار جديد'}
                </h3>
                {selectedItem && <AutoSaveBadge />}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar text-right">
              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">اسم إجراء المنظار *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: منظار المعدة والمريء التشخيصي (Gastroscopy)"
                  className="w-full py-2.5 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
                />
              </div>

              <div>
                <ImageUploadField
                  label="صورة إجراء المنظار أو الأجهزة"
                  sublabel="رفع مباشر من جهازك أو اختيار من وسائط العيادة"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  onRemove={() => setFormData({ ...formData, image: '' })}
                  category="أجهزة"
                  aspectRatio="video"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">المدة التقديرية</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="15 - 20 دقيقة"
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">ملخص التحضير والصيام</label>
                  <input
                    type="text"
                    value={formData.prepSummary}
                    onChange={(e) => setFormData({ ...formData, prepSummary: e.target.value })}
                    placeholder="صيام 6 إلى 8 ساعات"
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">الوصف والشرح الطبي</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">
                  دواعي إجراء المنظار (كل سطر يمثل نقطة):
                </label>
                <textarea
                  rows={3}
                  value={formData.indicationsText}
                  onChange={(e) => setFormData({ ...formData, indicationsText: e.target.value })}
                  placeholder="صعوبة أو ألم عند البلع&#10;نزيف الجهاز الهضمي أو فقر الدم غير المبرر&#10;أخذ عينات للأنسجة والكشف عن جرثومة المعدة"
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#E2EAF0] flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-3 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSavingProcedure}
                    onClick={() => saveProcedureWithStatus(false)}
                    className="py-2 px-3.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-700" />
                    حفظ كمسودة (Save Draft)
                  </button>
                  <button
                    type="button"
                    disabled={isSavingProcedure}
                    onClick={() => saveProcedureWithStatus(true)}
                    className="py-2 px-4 rounded-xl bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
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
