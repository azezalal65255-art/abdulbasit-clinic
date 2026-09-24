import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
  ExternalLink,
  FileText,
  BookOpen,
  Calendar,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface ResearchViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const ResearchView: React.FC<ResearchViewProps> = ({ showToast }) => {
  const [studies, setStudies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    journal: '',
    year: new Date().getFullYear().toString(),
    authors: 'د. عبدالباسط عبده الحاج مقبل',
    abstract: '',
    url: '',
    pdfUrl: '',
    category: 'أمراض الكبد والمناظير',
    order: 1,
    isActive: true,
  });

  const fetchResearch = async () => {
    try {
      const data = await api.getResearch();
      setStudies(data || []);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل الأبحاث والدراسات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResearch();
  }, []);

  const openNewModal = () => {
    setSelectedItem(null);
    setFormData({
      title: '',
      journal: 'مجلة قصر العيني للطب والعلوم السريرية',
      year: new Date().getFullYear().toString(),
      authors: 'د. عبدالباسط عبده الحاج مقبل وآخرون',
      abstract: '',
      url: '',
      pdfUrl: '',
      category: 'أمراض الكبد والمناظير',
      order: studies.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setFormData({
      title: item.title || '',
      journal: item.journal || '',
      year: item.year || new Date().getFullYear().toString(),
      authors: item.authors || '',
      abstract: item.abstract || '',
      url: item.url || '',
      pdfUrl: item.pdfUrl || '',
      category: item.category || 'أمراض الكبد والمناظير',
      order: item.order || 1,
      isActive: item.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'عنوان البحث العلمي مطلوب');
      return;
    }

    try {
      if (selectedItem) {
        await api.updateResearch(selectedItem.id, formData);
        showToast('success', 'تم تعديل البحث العلمي بنجاح');
      } else {
        await api.createResearch(formData);
        showToast('success', 'تمت إضافة البحث العلمي بنجاح');
      }
      setIsModalOpen(false);
      fetchResearch();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ البحث العلمي');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف البحث العلمي: "${title}"؟`)) return;

    try {
      await api.deleteResearch(id);
      showToast('success', 'تم نقل البحث إلى سلة المحذوفات');
      fetchResearch();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حذف البحث');
    }
  };

  const handleToggleStatus = async (item: any) => {
    try {
      await api.updateResearch(item.id, { isActive: !item.isActive });
      showToast('info', item.isActive ? 'تم إخفاء البحث' : 'تم تفعيل عرض البحث');
      fetchResearch();
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحديث الحالة');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= studies.length) return;

    const newOrder = [...studies];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    setStudies(newOrder);

    try {
      await api.reorderResearch(newOrder.map((r) => r.id));
      showToast('success', 'تم تحديث الترتيب');
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ الترتيب');
      fetchResearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#17354F] flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#2D6A4F]" />
            الأبحاث والدراسات العلمية
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            إدارة وتوثيق الأوراق البحثية المحكّمة المنشورة في المجلات والدوريات الطبية المعتمدة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchResearch}
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
            إضافة بحث جديد
          </button>
        </div>
      </div>

      {/* Research List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="w-8 h-8 text-[#2D6A4F] animate-spin" />
        </div>
      ) : studies.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">لا توجد أبحاث علمية مضافة حتى الآن</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            قم بإضافة الدراسات والأوراق الطبية المنشورة لتعزيز المكانة الأكاديمية والسريرية للعيادة.
          </p>
          <button
            onClick={openNewModal}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#2D6A4F] text-white rounded-xl font-medium shadow-sm hover:bg-[#1f4a37] transition"
          >
            <Plus className="w-5 h-5" />
            إضافة بحث الآن
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {studies.map((item, idx) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-6 border shadow-sm transition hover:shadow-md flex flex-col md:flex-row md:items-start justify-between gap-6 ${
                item.isActive ? 'border-slate-100' : 'border-slate-200 opacity-75 bg-slate-50'
              }`}
            >
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[#2D6A4F] bg-[#2D6A4F]/10 px-2.5 py-1 rounded-full">
                    {item.category || 'طب الجهاز الهضمي'}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {item.year}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.isActive ? 'معروض' : 'مخفي'}
                  </span>
                </div>

                <h3 className="font-bold text-[#17354F] text-lg leading-snug">
                  {item.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="font-medium flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    {item.journal}
                  </span>
                  {item.authors && (
                    <span className="text-slate-500">المؤلفون: {item.authors}</span>
                  )}
                </div>

                {item.abstract && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1">الملخص (Abstract):</span>
                    {item.abstract}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-1">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D6A4F] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      رابط البحث في الدورية
                    </a>
                  )}
                  {item.pdfUrl && (
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      تحميل نسخة PDF
                    </a>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center md:flex-col justify-end gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
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
                    disabled={idx === studies.length - 1}
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
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg text-[#17354F] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#2D6A4F]" />
                {selectedItem ? 'تعديل البحث العلمي' : 'إضافة بحث علمي جديد'}
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
                  عنوان البحث أو الورقة العلمية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: التدخلات التنظيرية الحديثة في علاج نزيف الجهاز الهضمي العلوي"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    المجلة / الدورية العلمية
                  </label>
                  <input
                    type="text"
                    value={formData.journal}
                    onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                    placeholder="مجلة قصر العيني للطب السريري"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    سنة النشر
                  </label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2023"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    المؤلفون والباحثون
                  </label>
                  <input
                    type="text"
                    value={formData.authors}
                    onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                    placeholder="د. عبدالباسط مقبل، د. أحمد..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    التصنيف التخصصي
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="أمراض الكبد والمناظير"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  رابط البحث الخارجي (DOI أو موقع المجلة)
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://doi.org/... أو https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  رابط ملف PDF الكامل للبحث (اختياري)
                </label>
                <input
                  type="text"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  placeholder="https://... رابط مباشر لملف البحث"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] text-sm text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  الملخص العلمي (Abstract)
                </label>
                <textarea
                  rows={4}
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  placeholder="ملخص يوضح أهداف البحث ومنهجيته وأبرز النتائج السريرية..."
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
                  {selectedItem ? 'حفظ التعديلات' : 'إضافة البحث'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
