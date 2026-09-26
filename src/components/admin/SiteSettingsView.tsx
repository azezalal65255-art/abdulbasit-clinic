import { PROTECTED_SUPABASE_CLINIC_LOGO } from "../../constants/clinicAssets";
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ImageUploadField } from './ImageUploadField';
import { uploadOriginalImage } from '../../services/uploadService';
import { useClinicData } from '../../context/ClinicDataContext';
import {
  Settings,
  Save,
  RefreshCw,
  Layout,
  AlertTriangle,
  Type,
  FileText,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { useAutoSaveForm } from '../../hooks/useAutoSaveForm';
import { AutoSaveBadge } from './AutoSaveBadge';

interface SiteSettingsViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const SiteSettingsView: React.FC<SiteSettingsViewProps> = ({ showToast }) => {
  const { refreshContent } = useClinicData();
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data || {});
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل الإعدادات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Real-time Auto Save to Database & Persistent Storage
  const { markSavedImmediately } = useAutoSaveForm({
    key: 'site-settings',
    data: settings,
    isReady: !isLoading && settings !== null,
    onSave: async (updated) => {
      await api.updateSettings(updated);
      await refreshContent();
    },
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateSettings(settings);
      if (res) {
        setSettings(res);
      }
      markSavedImmediately(settings);
      await refreshContent();
      showToast('success', 'تم حفظ إعدادات الموقع العام وتحديث الواجهة مباشرة بنجاح');
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'يرجى اختيار ملف صورة صالح (JPG, PNG, WebP, SVG)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('error', 'حجم الشعار كبير جداً، يرجى اختيار ملف أقل من 15 ميغابايت');
      return;
    }

    try {
      const uploadedUrl = await uploadOriginalImage(file);
      const updatedSettings = { ...settings, logoUrl: uploadedUrl };
      setSettings(updatedSettings);
      await api.updateSettings(updatedSettings);
      await refreshContent();
      showToast('success', 'تم رفع وحفظ الشعار في Supabase Storage وتحديث الموقع مباشرة');
    } catch (err: any) {
      showToast('error', err.message || 'تعذر رفع الصورة. يرجى المحاولة مرة أخرى.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-[#667788]">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
        جاري تحميل الإعدادات...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">إعدادات الموقع العام والمظهر التحريري</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            الاسم الظاهر في الهيدر، العنوان الترويجي للواجهة الرئيسية، وأزرار الحجز
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Identity */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#17354F] flex items-center gap-2 border-b border-[#E2EAF0] pb-2.5">
            <Layout className="w-4 h-4 text-[#064B82]" />
            هوية الموقع والعناوين الرسمية
          </h3>

          <div>
            <label className="block text-xs font-bold text-[#17354F] mb-1">اسم العيادة الرسمي</label>
            <input
              type="text"
              required
              value={settings?.clinicName || ''}
              onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
              className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-bold text-[#064B82]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17354F] mb-1">اسم الطبيب</label>
            <input
              type="text"
              required
              value={settings?.doctorName || ''}
              onChange={(e) => setSettings({ ...settings, doctorName: e.target.value })}
              className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17354F] mb-1">تخصص الطبيب</label>
            <input
              type="text"
              required
              value={settings?.doctorSpecialty || ''}
              onChange={(e) => setSettings({ ...settings, doctorSpecialty: e.target.value })}
              className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
            />
          </div>

          <div className="space-y-3 pt-1">
            <ImageUploadField
              label="شعار المركز الطبي الرسمي"
              sublabel="رفع مباشر من جهازك أو اختيار من الوسائط بجودته الأصلية 100% دون أي روابط"
              value={settings?.logoUrl || ''}
              onChange={(url) => {
                setSettings({ ...settings, logoUrl: url });
                showToast('success', 'تم تحديث شعار المركز بنجاح');
              }}
              category="عيادة"
              aspectRatio="square"
            />
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">خيارات سريعة:</span>
              <button
                type="button"
                onClick={() => {
                  setSettings({ ...settings, logoUrl: PROTECTED_SUPABASE_CLINIC_LOGO });
                  showToast('info', 'تم اختيار الشعار الافتراضي للمركز');
                }}
                className="inline-flex items-center gap-1 py-1 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[11px] font-bold text-slate-700 rounded-lg cursor-pointer transition-colors"
              >
                <span>الشعار الافتراضي</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section Copy */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#17354F] flex items-center gap-2 border-b border-[#E2EAF0] pb-2.5">
            <Type className="w-4 h-4 text-[#064B82]" />
            نصوص الواجهة الترحيبية (Hero Section)
          </h3>

          <div>
            <label className="block text-xs font-bold text-[#17354F] mb-1">العنوان الرئيسي العريض (Headline)</label>
            <input
              type="text"
              required
              value={settings?.heroHeadline || ''}
              onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
              placeholder="رعاية متقدمة لأمراض الجهاز الهضمي والكبد والمناظير"
              className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-bold text-[#064B82]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17354F] mb-1">النص الوصفي الترحيبي (Subheadline)</label>
            <textarea
              rows={3}
              required
              value={settings?.heroSubheadline || ''}
              onChange={(e) => setSettings({ ...settings, heroSubheadline: e.target.value })}
              className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17354F] mb-1">نص زر الحجز الرئيسي</label>
            <input
              type="text"
              value={settings?.bookButtonText || ''}
              onChange={(e) => setSettings({ ...settings, bookButtonText: e.target.value })}
              placeholder="حجز موعد استشارة"
              className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17354F] mb-1">نص رسالة الواتساب الافتراضية</label>
            <input
              type="text"
              value={settings?.defaultWhatsAppText || ''}
              onChange={(e) => setSettings({ ...settings, defaultWhatsAppText: e.target.value })}
              className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
