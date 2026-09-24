import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
  MessageCircleQuestion,
  Layers,
  Save,
  Send,
} from 'lucide-react';
import { useAutoSave } from '../../context/AutoSaveContext';
import { AutoSaveBadge } from './AutoSaveBadge';

interface FaqViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const FaqView: React.FC<FaqViewProps> = ({ showToast }) => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'عام',
    isActive: true,
  });

  const fetchFaqs = async () => {
    try {
      const data = await api.getFaqs();
      setFaqs(data || []);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل الأسئلة الشائعة');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openNewModal = () => {
    setSelectedFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'عام',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (f: any) => {
    setSelectedFaq(f);
    setFormData({
      question: f.question || '',
      answer: f.answer || '',
      category: f.category || 'عام',
      isActive: f.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const { triggerAutoSave, setSaveStatus } = useAutoSave();
  const [isSavingFaq, setIsSavingFaq] = useState(false);

  // Auto-save edited FAQ when modal is active
  useEffect(() => {
    if (!isModalOpen || !selectedFaq?.id || !formData.question.trim() || !formData.answer.trim()) return;

    triggerAutoSave(
      `faq-${selectedFaq.id}`,
      async () => {
        await api.updateFaq(selectedFaq.id, formData);
        setFaqs((prev) =>
          prev.map((item) => (item.id === selectedFaq.id ? { ...item, ...formData } : item))
        );
      },
      { debounceMs: 1300 }
    );
  }, [formData, isModalOpen, selectedFaq?.id, triggerAutoSave]);

  const saveFaqWithStatus = async (statusTarget?: boolean) => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      showToast('error', 'السؤال والإجابة حقول مطلوبة');
      return;
    }

    setIsSavingFaq(true);
    const payload = {
      ...formData,
      isActive: statusTarget !== undefined ? statusTarget : formData.isActive,
    };

    try {
      if (selectedFaq) {
        await api.updateFaq(selectedFaq.id, payload);
        showToast(
          'success',
          payload.isActive
            ? 'تم حفظ وتفعيل السؤال مباشرة في الموقع'
            : 'تم حفظ السؤال كمسودة مخفية (Save Draft)'
        );
      } else {
        await api.createFaq(payload);
        showToast(
          'success',
          payload.isActive
            ? 'تمت إضافة ونشر السؤال بنجاح'
            : 'تمت إضافة السؤال كمسودة (Save Draft)'
        );
      }
      setSaveStatus('saved');
      setIsModalOpen(false);
      fetchFaqs();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ السؤال');
      setSaveStatus('error', err.message);
    } finally {
      setIsSavingFaq(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveFaqWithStatus(formData.isActive);
  };

  const handleDelete = async (id: string, question: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف هذا السؤال؟`)) return;
    try {
      await api.deleteFaq(id);
      showToast('info', 'تم نقل السؤال إلى سلة المحذوفات');
      fetchFaqs();
    } catch (err: any) {
      showToast('error', err.message || 'فشل الحذف');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">إدارة الأسئلة الشائعة وإجاباتها (FAQ)</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            الأسئلة التي يطرحها المرضى بكثرة حول المناظير، المواعيد، الفحوصات والتحضير
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-1.5 py-2 px-4 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          إضافة سؤال جديد
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-[#667788]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
          جاري تحميل الأسئلة...
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((f, index) => (
            <div
              key={f.id}
              className="bg-white rounded-2xl p-5 border border-[#E2EAF0] shadow-sm hover:border-blue-200 transition-colors flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-[#064B82] text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-bold text-[#17354F]">{f.question}</h3>
                  {f.category && (
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      {f.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#667788] leading-relaxed pr-8">{f.answer}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(f)}
                  className="p-1.5 rounded-lg bg-blue-50 text-[#064B82] hover:bg-blue-100 cursor-pointer"
                  title="تعديل"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(f.id, f.question)}
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit FAQ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF0] max-w-lg w-full flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-[#E2EAF0] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-[#064B82]">
                  {selectedFaq ? 'تعديل السؤال الطبي' : 'إضافة سؤال وإجابة جديدة'}
                </h3>
                {selectedFaq && <AutoSaveBadge />}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">السؤال *</label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="مثال: هل منظار المعدة مؤلم وهل يحتاج لتخدير؟"
                  className="w-full py-2.5 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">تصنيف السؤال</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="المناظير، الحجوزات، التحضير، الكبد..."
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">الإجابة الطبية الوافية *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="اكتب الإجابة بأسلوب مطمئن ومفهوم للمريض..."
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-[#0B70B7]"
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
                    disabled={isSavingFaq}
                    onClick={() => saveFaqWithStatus(false)}
                    className="py-2 px-3.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-700" />
                    حفظ كمسودة (Save Draft)
                  </button>
                  <button
                    type="button"
                    disabled={isSavingFaq}
                    onClick={() => saveFaqWithStatus(true)}
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
