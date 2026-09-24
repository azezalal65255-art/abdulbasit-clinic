import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Layers,
  FileText,
  HeartPulse,
} from 'lucide-react';

interface CategoriesViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ showToast }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    order: 1,
    isActive: true,
  });

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data || []);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل التصنيفات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openNewModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      order: categories.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      order: cat.order || 1,
      isActive: cat.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'اسم التصنيف حقل إلزامي');
      return;
    }

    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, formData);
        showToast('success', `تم تحديث تصنيف "${formData.name}" بنجاح`);
      } else {
        await api.createCategory(formData);
        showToast('success', `تمت إضافة تصنيف "${formData.name}" بنجاح`);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      showToast('error', err.message || 'تعذر حفظ التصنيف');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف تصنيف "${name}"؟`)) return;

    try {
      await api.deleteCategory(id);
      showToast('success', 'تم حذف التصنيف بنجاح');
      fetchCategories();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حذف التصنيف');
    }
  };

  const handleToggleActive = async (cat: any) => {
    try {
      await api.updateCategory(cat.id, { isActive: !cat.isActive });
      showToast('success', `تم ${!cat.isActive ? 'تفعيل' : 'تعطيل'} التصنيف`);
      fetchCategories();
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحديث الحالة');
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2EAF0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-[#064B82]" />
            <h2 className="text-xl font-bold text-[#17354F]">إدارة التصنيفات الطبية</h2>
          </div>
          <p className="text-sm text-[#667788] mt-1">
            تصنيف الخدمات والحالات والمقالات الطبية (الباطنة، الكبد، الجهاز الهضمي، المعدة، القولون، البنكرياس، المناظير، التوعية الطبية، النصائح الصحية)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            className="p-2.5 rounded-xl border border-[#E2EAF0] text-[#667788] hover:bg-[#F4F8FB] transition-colors cursor-pointer"
            title="تحديث"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#064B82] hover:bg-[#0B70B7] text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            إضافة تصنيف جديد
          </button>
        </div>
      </div>

      {/* Search & Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#064B82] flex items-center justify-center font-bold text-lg">
            {categories.length}
          </div>
          <div>
            <div className="text-xs text-[#667788]">إجمالي التصنيفات</div>
            <div className="text-sm font-bold text-[#17354F]">تصنيفات محتوى معتمدة</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#55A630] flex items-center justify-center font-bold text-lg">
            {categories.filter((c) => c.isActive).length}
          </div>
          <div>
            <div className="text-xs text-[#667788]">التصنيفات المفعلة</div>
            <div className="text-sm font-bold text-emerald-700">تظهر في الموقع</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm flex items-center">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#667788] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="البحث في التصنيفات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-2 text-sm border border-[#E2EAF0] rounded-xl focus:outline-none focus:border-[#064B82]"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
              cat.isActive ? 'border-[#E2EAF0] hover:border-[#0B70B7]' : 'border-gray-200 opacity-60 bg-gray-50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#064B82] flex items-center justify-center font-bold text-xs">
                    {cat.order || 1}
                  </div>
                  <h3 className="font-bold text-[#17354F] text-base">{cat.name}</h3>
                </div>
                <button
                  onClick={() => handleToggleActive(cat)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-full transition-colors cursor-pointer ${
                    cat.isActive
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {cat.isActive ? 'مفعل' : 'معطل'}
                </button>
              </div>

              <div className="text-xs font-mono text-[#0B70B7] bg-blue-50/50 px-2 py-0.5 rounded inline-block mb-3">
                slug: {cat.slug || cat.id}
              </div>

              <p className="text-xs text-[#667788] leading-relaxed line-clamp-3">
                {cat.description || 'لا يوجد وصف محدد لهذا التصنيف'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0F4F8] flex items-center justify-between">
              <span className="text-[11px] text-[#667788]">
                الترتيب: {cat.order}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 rounded-lg text-[#064B82] hover:bg-[#F4F8FB] transition-colors cursor-pointer"
                  title="تعديل"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#E2EAF0]">
          <FolderTree className="w-12 h-12 text-[#667788] mx-auto mb-3 opacity-40" />
          <p className="text-base font-bold text-[#17354F]">لا توجد تصنيفات مطابقة</p>
          <p className="text-xs text-[#667788] mt-1">تأكد من عبارة البحث أو قم بإضافة تصنيف جديد</p>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2EAF0] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2EAF0]">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-[#064B82]" />
                <h3 className="font-bold text-[#17354F] text-lg">
                  {editingCategory ? 'تعديل التصنيف الطبي' : 'إضافة تصنيف طبي جديد'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#F4F8FB] text-[#667788] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">اسم التصنيف *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أمراض البنكرياس"
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      name: val,
                      slug: !editingCategory ? val.trim().toLowerCase().replace(/\s+/g, '-') : formData.slug,
                    });
                  }}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E2EAF0] rounded-xl focus:outline-none focus:border-[#064B82]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">الرابط اللطيف (Slug) للـ URL</label>
                <input
                  type="text"
                  placeholder="pancreas-diseases"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E2EAF0] rounded-xl focus:outline-none focus:border-[#064B82] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">الوصف الطبي للتصنيف</label>
                <textarea
                  rows={3}
                  placeholder="وصف مختصر لمجال هذا التصنيف والحالات التابعة له..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E2EAF0] rounded-xl focus:outline-none focus:border-[#064B82]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">ترتيب الظهور</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#E2EAF0] rounded-xl focus:outline-none focus:border-[#064B82]"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-[#F4F8FB] rounded-xl border border-[#E2EAF0]">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-[#064B82] rounded border-gray-300"
                    />
                    <span className="text-xs font-bold text-[#17354F]">تفعيل ونشر التصنيف</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2EAF0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-[#E2EAF0] text-[#667788] text-sm font-bold rounded-xl hover:bg-[#F4F8FB] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#064B82] hover:bg-[#0B70B7] text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingCategory ? 'حفظ التعديلات' : 'إضافة التصنيف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
