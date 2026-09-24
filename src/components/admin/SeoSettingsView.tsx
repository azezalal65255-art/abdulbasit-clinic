import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Search,
  Save,
  Globe,
  Share2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAutoSaveForm } from '../../hooks/useAutoSaveForm';
import { AutoSaveBadge } from './AutoSaveBadge';

interface SeoSettingsViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const SeoSettingsView: React.FC<SeoSettingsViewProps> = ({ showToast }) => {
  const [seo, setSeo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  const fetchSeo = async () => {
    try {
      const data = await api.getSeo();
      setSeo(data || {});
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل إعدادات SEO');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeo();
  }, []);

  // Real-time Auto Save to Database & Persistent Storage
  const { markSavedImmediately } = useAutoSaveForm({
    key: 'clinic-seo',
    data: seo,
    isReady: !isLoading && seo !== null,
    onSave: async (updated) => {
      await api.updateSeo(updated);
    },
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSeo(seo);
      markSavedImmediately(seo);
      showToast('success', 'تم حفظ إعدادات محركات البحث (SEO) بنجاح');
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ التعديلات');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    const current = seo.keywords || [];
    if (!current.includes(newKeyword.trim())) {
      setSeo({ ...seo, keywords: [...current, newKeyword.trim()] });
    }
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kw: string) => {
    setSeo({
      ...seo,
      keywords: (seo.keywords || []).filter((k: string) => k !== kw),
    });
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-[#667788]">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
        جاري تحميل إعدادات SEO...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">تهيئة محركات البحث ووسوم المشاركة (SEO)</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            تحسين ظهور موقع العيادة في نتائج Google ووسوم المشاركة على واتساب وفيسبوك
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AutoSaveBadge />
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 py-2 px-5 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ يدوي
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main Meta Tags */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#17354F] flex items-center gap-2 border-b border-[#E2EAF0] pb-2.5">
              <Search className="w-4 h-4 text-[#064B82]" />
              الوسوم الوصفية الأساسية (Meta Tags)
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#17354F] mb-1">
                عنوان الصفحة لمحركات البحث (Meta Title) *
              </label>
              <input
                type="text"
                required
                value={seo?.metaTitle || ''}
                onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                placeholder="عيادة د. عبدالباسط عبده الحاج مقبل | استشاري الباطنة والجهاز الهضمي والكبد والمناظير"
                className="w-full py-2.5 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-bold text-[#064B82]"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                الطول المثالي بين 50 - 65 حرف ({seo?.metaTitle?.length || 0} حرف)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17354F] mb-1">
                الوصف التعريفي (Meta Description) *
              </label>
              <textarea
                rows={3}
                required
                value={seo?.metaDescription || ''}
                onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                placeholder="عيادة استشارية متخصصة في تشخيص وعلاج أمراض الجهاز الهضمي والكبد ومناظير المعدة والقولون بصنعاء بإشراف استشاري قصر العيني د. عبدالباسط مقبل."
                className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs leading-relaxed"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                الطول الموصى به بين 120 - 160 حرف ({seo?.metaDescription?.length || 0} حرف)
              </span>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-xs font-bold text-[#17354F] mb-1">الكلمات المفتاحية (Keywords)</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(seo?.keywords || []).map((kw: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-[#064B82] border border-blue-100 py-1 px-2.5 rounded-lg font-medium"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="hover:text-rose-600 cursor-pointer text-xs ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="أضف كلمة مفتاحية (مثال: دكتور باطنية صنعاء)..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  className="flex-1 py-1.5 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="py-1.5 px-4 bg-[#064B82] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  إضافة
                </button>
              </div>
            </div>
          </div>

          {/* Social Sharing (Open Graph) */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#17354F] flex items-center gap-2 border-b border-[#E2EAF0] pb-2.5">
              <Share2 className="w-4 h-4 text-[#064B82]" />
              وسوم المشاركة على منصات التواصل (Open Graph)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">عنوان المشاركة (OG Title)</label>
                <input
                  type="text"
                  value={seo?.ogTitle || ''}
                  onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">رابط صورة المشاركة (OG Image)</label>
                <input
                  type="text"
                  value={seo?.ogImage || ''}
                  onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Search Preview (1 Col) */}
        <div>
          <div className="sticky top-24 bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#064B82]">
              <Sparkles className="w-4 h-4 text-amber-500" />
              معاينة نتيجة البحث على Google:
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs space-y-1 text-right">
              <div className="flex items-center gap-2 text-xs text-gray-500" dir="ltr">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                  G
                </span>
                <span className="text-[11px] text-gray-600 truncate">https://dr-abdulbasit.com</span>
              </div>
              <h4 className="text-sm font-bold text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                {seo?.metaTitle || 'عيادة د. عبدالباسط عبده الحاج مقبل'}
              </h4>
              <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-3">
                {seo?.metaDescription || 'تشخيص وعلاج أمراض الجهاز الهضمي والكبد والمناظير بصنعاء...'}
              </p>
            </div>

            <p className="text-[11px] text-[#667788] leading-relaxed pt-2 border-t border-[#E2EAF0]">
              تساعد هذه الكلمات الدقيقة المرضى في العثور على عيادة الدكتور عند البحث عن "استشاري كبد بصنعاء" أو "منظار قولون ومعدة".
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};
