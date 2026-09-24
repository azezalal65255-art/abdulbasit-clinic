import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  HeartPulse,
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Flame,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  Tag,
} from 'lucide-react';

interface ConditionsViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const ConditionsView: React.FC<ConditionsViewProps> = ({ showToast }) => {
  const [conditions, setConditions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'digestive',
    icon: 'Flame',
    description: '',
    symptomsText: '',
    treatmentApproach: '',
    keywordsText: '',
    metaTitle: '',
    metaDescription: '',
    isActive: true,
  });

  const fetchConditions = async () => {
    try {
      const data = await api.getConditions();
      setConditions(data || []);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل الحالات المرضية');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  const filtered = conditions.filter((c) => {
    if (categoryFilter === 'all') return true;
    return c.category === categoryFilter;
  });

  const openNewModal = () => {
    setSelectedItem(null);
    setFormData({
      name: '',
      category: 'digestive',
      icon: 'Flame',
      description: '',
      symptomsText: '',
      treatmentApproach: '',
      keywordsText: '',
      metaTitle: '',
      metaDescription: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    const keywordsArr = Array.isArray(item.keywords) ? item.keywords : [];

    setFormData({
      name: item.name || '',
      category: item.category || 'digestive',
      icon: item.icon || 'Flame',
      description: item.description || '',
      symptomsText: Array.isArray(item.symptoms) ? item.symptoms.join('\n') : '',
      treatmentApproach: item.treatmentApproach || '',
      keywordsText: keywordsArr.join(', '),
      metaTitle: item.metaTitle || '',
      metaDescription: item.metaDescription || '',
      isActive: item.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'اسم الحالة المرضية مطلوب');
      return;
    }

    const keywords = formData.keywordsText
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      icon: formData.icon,
      description: formData.description.trim(),
      symptoms: formData.symptomsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      treatmentApproach: formData.treatmentApproach.trim(),
      keywords,
      metaTitle: formData.metaTitle.trim() || undefined,
      metaDescription: formData.metaDescription.trim() || formData.description.trim(),
      isActive: formData.isActive,
    };

    try {
      if (selectedItem) {
        await api.updateCondition(selectedItem.id, payload);
        showToast('success', 'تم تعديل الحالة المرضية والكلمات الافتتاحية بنجاح');
      } else {
        await api.createCondition(payload);
        showToast('success', 'تمت إضافة الحالة الجديدة بالكلمات الافتتاحية بنجاح');
      }
      setIsModalOpen(false);
      fetchConditions();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ الحالة');
    }
  };

  const handleToggleActive = async (item: any) => {
    try {
      await api.updateCondition(item.id, { isActive: !item.isActive });
      showToast('success', item.isActive ? 'تم إخفاء الحالة' : 'تم إظهار الحالة');
      fetchConditions();
    } catch (err: any) {
      showToast('error', err.message || 'فشل تغيير الحالة');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف: "${name}"؟`)) return;
    try {
      await api.deleteCondition(id);
      showToast('info', 'تم نقل الحالة إلى سلة المحذوفات');
      fetchConditions();
    } catch (err: any) {
      showToast('error', err.message || 'فشل الحذف');
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'digestive':
        return <span className="text-[10px] bg-blue-50 text-[#064B82] px-2 py-0.5 rounded-full font-bold">الجهاز الهضمي</span>;
      case 'liver':
        return <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold">أمراض الكبد</span>;
      default:
        return <span className="text-[10px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded-full font-bold">أمراض عامة وباطنة</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">الحالات والأمراض التي تعالجها العيادة</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            تتحكم هذه القائمة بقسم الحالات المرضية وأعراضها وخطة العلاج الموضحة للمرضى
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-semibold text-gray-700"
          >
            <option value="all">كافة التصنيفات</option>
            <option value="digestive">الجهاز الهضمي</option>
            <option value="liver">أمراض الكبد</option>
            <option value="general">باطنية عامة</option>
          </select>

          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-1.5 py-2 px-4 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة حالة جديدة
          </button>
        </div>
      </div>

      {/* Grid of Conditions */}
      {isLoading ? (
        <div className="p-12 text-center text-[#667788]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
          جاري تحميل الحالات...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-sm flex flex-col justify-between ${
                c.isActive ? 'border-[#E2EAF0]' : 'border-gray-200 opacity-60 bg-gray-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  {getCategoryBadge(c.category)}
                  <button
                    onClick={() => handleToggleActive(c)}
                    className={`p-1 text-xs rounded-lg flex items-center gap-1 font-semibold ${
                      c.isActive ? 'text-emerald-700 bg-emerald-50' : 'text-gray-500 bg-gray-200'
                    }`}
                  >
                    {c.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{c.isActive ? 'نشطة' : 'مخفية'}</span>
                  </button>
                </div>

                <h3 className="text-sm font-bold text-[#17354F] mt-1">{c.name}</h3>
                <p className="text-xs text-[#667788] mt-1 line-clamp-2">{c.description}</p>

                {/* Symptoms Preview */}
                {c.symptoms && c.symptoms.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#E2EAF0]/60">
                    <p className="text-[10px] font-bold text-gray-500 mb-1">الأعراض الشائعة:</p>
                    <div className="flex flex-wrap gap-1">
                      {c.symptoms.slice(0, 3).map((sym: string, i: number) => (
                        <span key={i} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {sym}
                        </span>
                      ))}
                      {c.symptoms.length > 3 && (
                        <span className="text-[10px] text-gray-400">+{c.symptoms.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* SEO Keywords */}
                {Array.isArray(c.keywords) && c.keywords.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#E2EAF0]/40 flex flex-wrap gap-1 items-center">
                    <Search className="w-2.5 h-2.5 text-[#064B82]" />
                    {c.keywords.slice(0, 2).map((kw: string, kidx: number) => (
                      <span
                        key={kidx}
                        className="bg-[#EBF3FA] text-[#064B82] text-[9px] font-medium px-1.5 py-0.5 rounded"
                      >
                        #{kw}
                      </span>
                    ))}
                    {c.keywords.length > 2 && (
                      <span className="text-[9px] text-gray-400 font-semibold">
                        +{c.keywords.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-[#E2EAF0] flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(c)}
                  className="py-1 px-3 rounded-lg bg-blue-50 text-[#064B82] text-xs font-semibold hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3 h-3" />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF0] max-w-lg w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#E2EAF0] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#064B82]">
                {selectedItem ? 'تعديل الحالة المرضية' : 'إضافة حالة مرضية جديدة'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar text-right">
              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">اسم المرض أو الشكوى *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: جرثومة المعدة (H. Pylori)"
                  className="w-full py-2.5 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">التصنيف الطبي</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  >
                    <option value="digestive">أمراض الجهاز الهضمي</option>
                    <option value="liver">أمراض الكبد والقنوات المرارية</option>
                    <option value="general">أمراض باطنية عامة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">الأيقونة</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  >
                    <option value="Flame">Flame (لهب / حرقة)</option>
                    <option value="HeartPulse">HeartPulse (نبض)</option>
                    <option value="Activity">Activity (نشاط)</option>
                    <option value="ShieldCheck">ShieldCheck (مناعة)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">الوصف والتعريف بالحالة</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="شرح موجز عن الحالة وأسبابها الشائعة..."
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">
                  أبرز الأعراض (كل سطر يمثل عرضاً):
                </label>
                <textarea
                  rows={3}
                  value={formData.symptomsText}
                  onChange={(e) => setFormData({ ...formData, symptomsText: e.target.value })}
                  placeholder="ألم أو حرقة أعلى المعدة&#10;انتفاخ وغازات مستمرة&#10;فقدان الشهية أو غثيان"
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">منهجية الفحص والعلاج بالعيادة</label>
                <textarea
                  rows={2}
                  value={formData.treatmentApproach}
                  onChange={(e) => setFormData({ ...formData, treatmentApproach: e.target.value })}
                  placeholder="فحص التنفس أو البراز، منظار عند اللزوم، كورس علاج ثلاثي أو رباعي مخصص..."
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                />
              </div>

              {/* SEO and Keywords Box */}
              <div className="p-4 bg-gradient-to-br from-[#F4F9FD] to-[#EBF3FA] border border-[#BED8EA] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#064B82]">
                  <Sparkles className="w-4 h-4 text-[#0B70B7]" />
                  <span>تهيئة محركات البحث والكلمات الافتتاحية للحالة (SEO & Keywords)</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-[#17354F]">
                      الكلمات الافتتاحية والبحثية (Keywords):
                    </label>
                    <span className="text-[10px] text-gray-500">افصل بين كل كلمة بفاصلة (,)</span>
                  </div>
                  <input
                    type="text"
                    value={formData.keywordsText}
                    onChange={(e) => setFormData({ ...formData, keywordsText: e.target.value })}
                    placeholder="مثال: علاج قرحة المعدة, أعراض جرثومة المعدة, استشاري كبد صنعاء, مناظير الجهاز الهضمي"
                    className="w-full py-2 px-3 bg-white border border-[#BED8EA] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
                  />
                  {formData.keywordsText && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.keywordsText
                        .split(',')
                        .map((k) => k.trim())
                        .filter(Boolean)
                        .map((kw, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[10px] bg-white text-[#064B82] border border-[#BED8EA] px-2 py-0.5 rounded-md font-medium shadow-2xs"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {kw}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#17354F] mb-1">
                      عنوان محركات البحث (Meta Title):
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder="عنوان الحالة في جوجل"
                      className="w-full py-2 px-3 bg-white border border-[#BED8EA] rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#17354F] mb-1">
                      وصف محركات البحث (Meta Description):
                    </label>
                    <input
                      type="text"
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="وصف مختصر للحالة في نتائج البحث"
                      className="w-full py-2 px-3 bg-white border border-[#BED8EA] rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="cond_active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#064B82]"
                />
                <label htmlFor="cond_active" className="text-xs font-bold text-[#17354F] cursor-pointer">
                  تفعيل وإظهار هذه الحالة في قسم الحالات على الموقع
                </label>
              </div>

              <div className="pt-3 border-t border-[#E2EAF0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
