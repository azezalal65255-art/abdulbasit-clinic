import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ImageUploadField } from './ImageUploadField';
import { useClinicData } from '../../context/ClinicDataContext';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
  Eye,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Tag,
  Search,
  Sparkles,
  Save,
  Send,
  RotateCcw,
} from 'lucide-react';
import { useAutoSave } from '../../context/AutoSaveContext';
import { AutoSaveBadge } from './AutoSaveBadge';

interface ArticlesViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const ArticlesView: React.FC<ArticlesViewProps> = ({ showToast }) => {
  const { refreshContent } = useClinicData();
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived' | 'trash'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    category: 'الجهاز الهضمي',
    readTime: '4 دقائق',
    image: 'https://rmvhgoewsegyohdbsjsd.supabase.co/storage/v1/object/public/media/images/clinic-logo.jpg',
    content: '',
    status: 'published',
    keywordsText: '',
    tagsText: '',
    metaTitle: '',
    metaDescription: '',
  });

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const data = await api.getArticles({
        status: statusFilter,
        category: categoryFilter,
        search: searchQuery,
      });
      setArticles(data || []);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل المقالات الطبية');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [statusFilter, categoryFilter]);

  const openNewModal = () => {
    setSelectedArticle(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      category: 'الجهاز الهضمي',
      readTime: '4 دقائق',
      image: '/images/clinic-waiting.jpg',
      content: '',
      status: 'published',
      keywordsText: '',
      tagsText: '',
      metaTitle: '',
      metaDescription: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (a: any) => {
    setSelectedArticle(a);
    const keywordsArr = Array.isArray(a.keywords) ? a.keywords : [];
    const tagsArr = Array.isArray(a.tags) ? a.tags : [];

    setFormData({
      title: a.title || '',
      slug: a.slug || '',
      excerpt: a.excerpt || '',
      category: a.category || 'الجهاز الهضمي',
      readTime: a.readTime || '4 دقائق',
      image: a.image || '',
      content: Array.isArray(a.content) ? a.content.join('\n\n') : a.content || '',
      status: a.status || 'published',
      keywordsText: keywordsArr.join(', '),
      tagsText: tagsArr.join(', '),
      metaTitle: a.metaTitle || '',
      metaDescription: a.metaDescription || '',
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: prev.slug ? prev.slug : val.trim().toLowerCase().replace(/[^\w\u0621-\u064A]+/g, '-'),
      metaTitle: prev.metaTitle ? prev.metaTitle : `${val} | د. عبدالباسط مقبل`,
    }));
  };

  const { triggerAutoSave, setSaveStatus } = useAutoSave();
  const [isSavingArticle, setIsSavingArticle] = useState(false);

  // Trigger auto-save for edited articles when form data changes
  useEffect(() => {
    if (!isModalOpen || !selectedArticle?.id || !formData.title.trim()) return;

    triggerAutoSave(
      `article-${selectedArticle.id}`,
      async () => {
        const keywords = formData.keywordsText
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean);

        const tags = formData.tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

        const payload = {
          title: formData.title.trim(),
          slug: formData.slug.trim() || `article-${Date.now()}`,
          excerpt: formData.excerpt.trim(),
          category: formData.category,
          readTime: formData.readTime.trim(),
          image: formData.image.trim(),
          content: formData.content.split('\n\n').map((p) => p.trim()).filter(Boolean),
          status: formData.status,
          keywords,
          tags,
          metaTitle: formData.metaTitle.trim() || undefined,
          metaDescription: formData.metaDescription.trim() || formData.excerpt.trim(),
        };

        await api.updateArticle(selectedArticle.id, payload);
        // Silently update article in list
        setArticles((prev) =>
          prev.map((item) => (item.id === selectedArticle.id ? { ...item, ...payload } : item))
        );
      },
      { debounceMs: 1400 }
    );
  }, [formData, isModalOpen, selectedArticle?.id, triggerAutoSave]);

  const saveArticleWithStatus = async (targetStatus?: 'draft' | 'published') => {
    if (!formData.title.trim() || !formData.excerpt.trim()) {
      showToast('error', 'عنوان المقال والموجز حقول مطلوبة');
      return;
    }

    setIsSavingArticle(true);
    const chosenStatus = targetStatus || formData.status || 'published';

    const keywords = formData.keywordsText
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const tags = formData.tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim() || `article-${Date.now()}`,
      excerpt: formData.excerpt.trim(),
      category: formData.category,
      readTime: formData.readTime.trim(),
      image: formData.image.trim(),
      content: formData.content.split('\n\n').map((p) => p.trim()).filter(Boolean),
      status: chosenStatus,
      keywords,
      tags,
      metaTitle: formData.metaTitle.trim() || undefined,
      metaDescription: formData.metaDescription.trim() || formData.excerpt.trim(),
    };

    try {
      if (selectedArticle) {
        await api.updateArticle(selectedArticle.id, payload);
        showToast(
          'success',
          chosenStatus === 'published'
            ? 'تم حفظ ونشر المقال الطبي بنجاح على الموقع'
            : 'تم حفظ المقال كمسودة (Save Draft) بنجاح'
        );
      } else {
        await api.createArticle(payload);
        showToast(
          'success',
          chosenStatus === 'published'
            ? 'تم إنشاء ونشر المقال الطبي بنجاح على الموقع'
            : 'تم حفظ المقال الجديد كمسودة (Save Draft) بنجاح'
        );
      }
      setSaveStatus('saved');
      setIsModalOpen(false);
      await fetchArticles();
      await refreshContent();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ المقال');
      setSaveStatus('error', err.message);
    } finally {
      setIsSavingArticle(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveArticleWithStatus(formData.status as any);
  };

  const handleToggleStatus = async (a: any) => {
    const newStatus = a.status === 'published' ? 'draft' : 'published';
    try {
      await api.updateArticle(a.id, { status: newStatus });
      showToast('success', newStatus === 'published' ? 'تم نشر المقال على الموقع' : 'تم تحويل المقال إلى مسودة');
      await fetchArticles();
      await refreshContent();
    } catch (err: any) {
      showToast('error', err.message || 'فشل تغيير حالة المقال');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف مقال: "${title}"؟ ستُنقل إلى سلة المحذوفات.`)) return;
    try {
      await api.deleteArticle(id);
      showToast('info', 'تم نقل المقال إلى سلة المحذوفات');
      await fetchArticles();
      await refreshContent();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حذف المقال');
    }
  };

  const handleRestore = async (id: string, title: string) => {
    try {
      await api.restoreArticle(id);
      showToast('success', `تمت استعادة مقال "${title}" بنجاح ونشره على الموقع`);
      await fetchArticles();
      await refreshContent();
    } catch (err: any) {
      showToast('error', err.message || 'فشل استعادة المقال');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles();
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">المكتبة والمقالات الطبية التوعوية (Medical CMS)</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            إدارة كافة المقالات والمواضيع الطبية السابقة والجديدة مع دعم كامل للمسودات والأرشيف وسلة الاسترجاع
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchArticles}
            className="p-2 text-gray-500 hover:text-[#064B82] hover:bg-gray-100 rounded-xl transition-colors"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-1.5 py-2 px-4 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            كتابة مقال طبي جديد
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-[#064B82] font-bold shadow-xs'
                  : 'text-[#667788] hover:text-[#17354F]'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'published'
                  ? 'bg-white text-emerald-700 font-bold shadow-xs'
                  : 'text-[#667788] hover:text-[#17354F]'
              }`}
            >
              منشور
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'draft'
                  ? 'bg-white text-amber-700 font-bold shadow-xs'
                  : 'text-[#667788] hover:text-[#17354F]'
              }`}
            >
              مسودة
            </button>
            <button
              onClick={() => setStatusFilter('archived')}
              className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'archived'
                  ? 'bg-white text-purple-700 font-bold shadow-xs'
                  : 'text-[#667788] hover:text-[#17354F]'
              }`}
            >
              مؤرشف
            </button>
            <button
              onClick={() => setStatusFilter('trash')}
              className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'trash'
                  ? 'bg-white text-rose-700 font-bold shadow-xs'
                  : 'text-[#667788] hover:text-[#17354F]'
              }`}
            >
              سلة المحذوفات
            </button>
          </div>

          {/* Search & Category Filter */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في عناوين ونصوص المقالات..."
                className="w-full py-1.5 pl-8 pr-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-2.5 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs text-[#17354F]"
            >
              <option value="all">كافة التصنيفات</option>
              <option value="الجهاز الهضمي">الجهاز الهضمي</option>
              <option value="أمراض الكبد">أمراض الكبد</option>
              <option value="مناظير طبية">مناظير طبية</option>
              <option value="وقاية وتغذية">وقاية وتغذية</option>
              <option value="نصائح طبية">نصائح طبية عامة</option>
            </select>
          </form>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-[#667788]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
          جاري تحميل المقالات...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a) => (
            <div
              key={a.id}
              className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden flex flex-col justify-between ${
                a.status === 'published' ? 'border-[#E2EAF0]' : 'border-dashed border-amber-300 bg-amber-50/20'
              }`}
            >
              <div>
                <div className="h-40 bg-gray-100 relative overflow-hidden">
                  {a.image ? (
                    <img
                      src={a.image}
                      alt={a.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute top-3 right-3 bg-[#064B82]/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md backdrop-blur-xs">
                    {a.category}
                  </span>
                  <span
                    className={`absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      a.status === 'published'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-amber-400 text-amber-950'
                    }`}
                  >
                    {a.status === 'published' ? 'منشور للعامة' : 'مسودة غير منشورة'}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-[#17354F] leading-tight line-clamp-2">{a.title}</h3>
                  <p className="text-xs text-[#667788] line-clamp-2 leading-relaxed">{a.excerpt}</p>

                  {/* SEO Keywords Badges */}
                  {Array.isArray(a.keywords) && a.keywords.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1 items-center">
                      <Search className="w-3 h-3 text-[#064B82]" />
                      {a.keywords.slice(0, 3).map((kw: string, kidx: number) => (
                        <span
                          key={kidx}
                          className="bg-[#EBF3FA] text-[#064B82] text-[10px] font-medium px-2 py-0.5 rounded-md"
                        >
                          #{kw}
                        </span>
                      ))}
                      {a.keywords.length > 3 && (
                        <span className="text-[10px] text-gray-400 font-semibold">
                          +{a.keywords.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-[#E2EAF0]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {a.date || 'اليوم'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {a.readTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-[#E2EAF0] bg-[#F8FAFC]/60 flex items-center justify-between">
                {statusFilter === 'trash' ? (
                  <button
                    onClick={() => handleRestore(a.id, a.title)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    استعادة المقال
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleStatus(a)}
                    className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      a.status === 'published'
                        ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    {a.status === 'published' ? 'تحويل لمسودة' : 'نشر على الموقع'}
                  </button>
                )}

                <div className="flex items-center gap-1">
                  {statusFilter !== 'trash' && (
                    <button
                      onClick={() => openEditModal(a)}
                      className="p-1.5 rounded-lg bg-blue-50 text-[#064B82] hover:bg-blue-100 cursor-pointer"
                      title="تعديل المقال"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(a.id, a.title)}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                    title={statusFilter === 'trash' ? 'حذف نهائي' : 'نقل إلى سلة المحذوفات'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && articles.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E2EAF0] p-12 text-center text-[#667788]">
          <BookOpen className="w-8 h-8 mx-auto text-[#064B82] mb-3 opacity-60" />
          <p className="font-bold text-sm text-[#17354F]">لا توجد مقالات في هذا القسم حالياً</p>
          <p className="text-xs mt-1">يمكنك استخدام فلتر آخر أو كتابة مقال طبي جديد الآن</p>
        </div>
      )}

      {/* Modal Add / Edit Article */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF0] max-w-2xl w-full max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-[#E2EAF0] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-[#064B82]">
                  {selectedArticle ? 'تعديل المقال الطبي' : 'كتابة مقال طبي جديد'}
                </h3>
                {selectedArticle && <AutoSaveBadge />}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar text-right">
              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">عنوان المقال الطبي *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="مثال: دليلك الشامل للتعامل مع جرثومة المعدة وطرق الوقاية منها"
                  className="w-full py-2.5 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">التصنيف</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  >
                    <option value="الجهاز الهضمي">الجهاز الهضمي</option>
                    <option value="أمراض الكبد">أمراض الكبد</option>
                    <option value="مناظير طبية">مناظير طبية</option>
                    <option value="وقاية وتغذية">وقاية وتغذية</option>
                    <option value="نصائح طبية">نصائح طبية عامة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">وقت القراءة المقدر</label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    placeholder="4 دقائق"
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">حالة النشر</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-bold text-[#064B82]"
                  >
                    <option value="published">منشور للعامة (Published)</option>
                    <option value="draft">مسودة داخلية (Draft)</option>
                  </select>
                </div>
              </div>

              <div>
                <ImageUploadField
                  label="صورة غلاف المقال الطبي"
                  sublabel="رفع مباشر من جهازك أو اختيار من وسائط العيادة"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  onRemove={() => setFormData({ ...formData, image: '' })}
                  category="مقالات"
                  aspectRatio="video"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">الموجز والملخص (Excerpt) *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="موجز يظهر في بطاقة المقال على الصفحة الرئيسية وصفحة المقالات..."
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">
                  نص المقال الكامل (افصل بين الفقرات بسطر فارغ):
                </label>
                <textarea
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="اكتب محتوى المقال الطبي هنا بالتفصيل..."
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-[#0B70B7]"
                />
              </div>

              {/* SEO and Keywords Optimization Box */}
              <div className="p-4 bg-gradient-to-br from-[#F4F9FD] to-[#EBF3FA] border border-[#BED8EA] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#064B82]">
                  <Sparkles className="w-4 h-4 text-[#0B70B7]" />
                  <span>تهيئة محركات البحث والكلمات الافتتاحية (SEO & Keywords)</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-[#17354F]">
                      الكلمات الافتتاحية والبحثية (SEO Keywords):
                    </label>
                    <span className="text-[10px] text-gray-500">افصل بين كل كلمة بفاصلة (,)</span>
                  </div>
                  <input
                    type="text"
                    value={formData.keywordsText}
                    onChange={(e) => setFormData({ ...formData, keywordsText: e.target.value })}
                    placeholder="مثال: جرثومة المعدة صنعاء, علاج حموضة المعدة, استشاري باطنية وجهاز هضمي, فحص المنظار"
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
                      placeholder="عنوان المقال | د. عبدالباسط مقبل"
                      className="w-full py-2 px-3 bg-white border border-[#BED8EA] rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#17354F] mb-1">
                      الوسوم الإضافية (Tags):
                    </label>
                    <input
                      type="text"
                      value={formData.tagsText}
                      onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                      placeholder="المعدة, المنظار, حموضة, صحة الكبد"
                      className="w-full py-2 px-3 bg-white border border-[#BED8EA] rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#17354F] mb-1">
                    وصف محركات البحث (Meta Description):
                  </label>
                  <textarea
                    rows={2}
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="وصف مختصر يظهر أسفل رابط المقال في نتائج بحث جوجل..."
                    className="w-full py-2 px-3 bg-white border border-[#BED8EA] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2EAF0] flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>يتم الحفظ التلقائي لكل حرف، ويمكنك الحفظ كمسودة أو النشر فوراً</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="py-2 px-3.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    disabled={isSavingArticle}
                    onClick={() => saveArticleWithStatus('draft')}
                    className="py-2 px-4 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-700" />
                    حفظ كمسودة (Save Draft)
                  </button>
                  <button
                    type="button"
                    disabled={isSavingArticle}
                    onClick={() => saveArticleWithStatus('published')}
                    className="py-2 px-5 rounded-xl bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    نشر في الموقع (Publish)
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
