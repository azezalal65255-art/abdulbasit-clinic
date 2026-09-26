import { PROTECTED_SUPABASE_DOCTOR_PHOTO, PROTECTED_SUPABASE_CLINIC_LOGO } from "../../constants/clinicAssets";
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ImageUploadField } from './ImageUploadField';
import {
  Home,
  Layout,
  Sliders,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Phone,
} from 'lucide-react';
import { ImagePickerModal } from '../ImagePickerModal';
import { useAutoSaveForm } from '../../hooks/useAutoSaveForm';
import { AutoSaveBadge } from './AutoSaveBadge';

interface HomePageManagerViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

const SECTION_LABELS: Record<string, string> = {
  hero: 'الواجهة الرئيسية والبانر التعريفي (Hero)',
  specialties: 'شريط التخصصات الطبية الدقيقة',
  services: 'قسم الخدمات الطبية التخصصية',
  conditions: 'قسم الحالات المرضية الشائعة',
  endoscopy: 'قسم وحدة المناظير الهضمية',
  about: 'قسم نبذة عن الدكتور وسيرته الذاتية',
  visionMission: 'قسم الرؤية والرسالة والقيم',
  stats: 'شريط الإحصائيات والأرقام والإنجازات',
  booking: 'قسم نموذج حجز المواعيد السريع',
  articles: 'قسم المقالات والتوعية الطبية',
  faq: 'قسم الأسئلة الشائعة حول المناظير والعيادة',
  contact: 'قسم بيانات التواصل وساعات العمل والخريطة',
};

export const HomePageManagerView: React.FC<HomePageManagerViewProps> = ({ showToast }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState<any>({
    siteName: 'عيادة الدكتور عبدالباسط مقبل',
    heroDoctorPhoto: PROTECTED_SUPABASE_DOCTOR_PHOTO,
    whatsappNumber: '777554626',
    defaultWhatsAppText: 'مرحبًا د. عبدالباسط، أود الاستفسار وحجز موعد في العيادة.',
    sectionsConfig: {
      hero: true,
      specialties: true,
      services: true,
      conditions: true,
      endoscopy: true,
      about: true,
      visionMission: true,
      stats: true,
      booking: true,
      articles: true,
      faq: true,
      contact: true,
    },
    sectionsOrder: [
      'hero',
      'specialties',
      'services',
      'conditions',
      'endoscopy',
      'about',
      'visionMission',
      'stats',
      'booking',
      'articles',
      'faq',
      'contact',
    ],
    banners: [
      {
        id: 'ban_1',
        title: 'رعاية تخصصية لأمراض الجهاز الهضمي والكبد والمناظير',
        subtitle: 'بإشراف د. عبدالباسط عبده الحاج مقبل - استشاري الباطنة والجهاز الهضمي والكبد والمناظير',
        imageUrl: PROTECTED_SUPABASE_DOCTOR_PHOTO,
        buttonText: 'احجز موعد استشارة',
        buttonLink: '#booking',
        isActive: true,
      },
    ],
  });

  const [doctor, setDoctor] = useState<any>({
    name: 'الدكتور / عبدالباسط عبده الحاج مقبل',
    title: 'استشاري أمراض الباطنة والكبد ومناظير الجهاز الهضمي',
    experienceYears: 15,
    bio: '',
  });

  // Active Tab inside Homepage Manager
  const [activeTab, setActiveTab] = useState<'sections' | 'hero' | 'banners' | 'whatsapp'>('sections');
  const [imagePickerTarget, setImagePickerTarget] = useState<{ type: 'hero' | 'banner'; bannerId?: string } | null>(null);

  const fetchHomeData = async () => {
    try {
      const data = await api.getHomePageSettings();
      if (data.settings) {
        setSettings((prev: any) => ({
          ...prev,
          ...data.settings,
          sectionsConfig: {
            ...prev.sectionsConfig,
            ...(data.settings.sectionsConfig || {}),
          },
          sectionsOrder: data.settings.sectionsOrder && data.settings.sectionsOrder.length > 0
            ? data.settings.sectionsOrder
            : prev.sectionsOrder,
          banners: data.settings.banners || prev.banners,
        }));
      }
      if (data.doctor) {
        setDoctor(data.doctor);
      }
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل إعدادات الصفحة الرئيسية');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  // Real-time Auto Save to Database & Persistent Storage for Homepage
  const { markSavedImmediately } = useAutoSaveForm({
    key: 'homepage-manager',
    data: { settings, doctor },
    isReady: !isLoading && settings !== null,
    onSave: async (payload) => {
      await api.updateHomePageSettings(payload);
    },
  });

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await api.updateHomePageSettings({
        settings,
        doctor,
      });
      markSavedImmediately({ settings, doctor });
      showToast('success', 'تم حفظ وتحديث الصفحة الرئيسية بنجاح! التغييرات تظهر في الموقع مباشرة.');
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ إعدادات الصفحة الرئيسية');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (sectionKey: string) => {
    setSettings((prev: any) => ({
      ...prev,
      sectionsConfig: {
        ...prev.sectionsConfig,
        [sectionKey]: !prev.sectionsConfig[sectionKey],
      },
    }));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const order = [...settings.sectionsOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= order.length) return;

    const temp = order[index];
    order[index] = order[targetIndex];
    order[targetIndex] = temp;

    setSettings((prev: any) => ({
      ...prev,
      sectionsOrder: order,
    }));
  };

  const addBanner = () => {
    const newBan = {
      id: `ban_${Date.now()}`,
      title: 'عنوان البانر الترويجي الجديد',
      subtitle: 'وصف فرعي يبرز إحدى خدمات العيادة أو مواعيد الاستشارة',
      imageUrl: PROTECTED_SUPABASE_DOCTOR_PHOTO,
      buttonText: 'احجز الآن',
      buttonLink: '#booking',
      isActive: true,
    };
    setSettings((prev: any) => ({
      ...prev,
      banners: [...prev.banners, newBan],
    }));
  };

  const removeBanner = (id: string) => {
    setSettings((prev: any) => ({
      ...prev,
      banners: prev.banners.filter((b: any) => b.id !== id),
    }));
  };

  const updateBanner = (id: string, field: string, val: any) => {
    setSettings((prev: any) => ({
      ...prev,
      banners: prev.banners.map((b: any) => (b.id === id ? { ...b, [field]: val } : b)),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2EAF0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6 text-[#064B82]" />
            <h2 className="text-xl font-bold text-[#17354F]">إدارة الصفحة الرئيسية (Homepage CMS)</h2>
          </div>
          <p className="text-sm text-[#667788] mt-1">
            التحكم في ترتيب وأقسام الصفحة الرئيسية، البانرات الترويجية، صورة الطبيب الرسمية، وروابط الحجز والواتساب
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AutoSaveBadge />
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#E2EAF0] text-[#17354F] hover:bg-[#F4F8FB] text-sm font-bold transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            معاينة الموقع
          </a>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#064B82] hover:bg-[#0B70B7] text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'جارِ الحفظ...' : 'حفظ يدوي'}
          </button>
        </div>
      </div>

      {/* Inner Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2EAF0] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sections')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'sections'
              ? 'bg-[#064B82] text-white shadow-xs'
              : 'text-[#667788] hover:bg-white hover:text-[#17354F]'
          }`}
        >
          <Layout className="w-4 h-4" />
          ترتيب وظهور الأقسام
        </button>

        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-[#064B82] text-white shadow-xs'
              : 'text-[#667788] hover:bg-white hover:text-[#17354F]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          واجهة الطبيب والهيدر (Hero)
        </button>

        <button
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'banners'
              ? 'bg-[#064B82] text-white shadow-xs'
              : 'text-[#667788] hover:bg-white hover:text-[#17354F]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          البانرات الإعلانية ({settings.banners?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'whatsapp'
              ? 'bg-[#064B82] text-white shadow-xs'
              : 'text-[#667788] hover:bg-white hover:text-[#17354F]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          الواتساب والتواصل المباشر
        </button>
      </div>

      {/* Tab 1: Sections Visibility & Reordering */}
      {activeTab === 'sections' && (
        <div className="bg-white rounded-2xl border border-[#E2EAF0] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#17354F] text-base">ترتيب أقسام الصفحة الرئيسية وحالتها</h3>
              <p className="text-xs text-[#667788] mt-1">
                يمكنك إعادة ترتيب الأقسام بالنقر على الأسهم، أو إخفاء/إظهار أي قسم فورياً من الموقع.
              </p>
            </div>
            <span className="text-xs bg-blue-50 text-[#064B82] px-3 py-1 rounded-full font-bold">
              {settings.sectionsOrder?.length || 12} أقسام مفهرسة
            </span>
          </div>

          <div className="divide-y divide-[#F0F4F8] border border-[#E2EAF0] rounded-2xl overflow-hidden">
            {settings.sectionsOrder?.map((secKey: string, index: number) => {
              const isEnabled = settings.sectionsConfig?.[secKey] !== false;
              return (
                <div
                  key={secKey}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    isEnabled ? 'bg-white hover:bg-[#F9FBFC]' : 'bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#E2EAF0] text-[#17354F] flex items-center justify-center font-bold text-xs">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-[#17354F]">
                        {SECTION_LABELS[secKey] || secKey}
                      </h4>
                      <span className="text-[11px] font-mono text-[#667788]">{secKey}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Up / Down Controls */}
                    <div className="flex items-center border border-[#E2EAF0] rounded-xl overflow-hidden bg-white">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveSection(index, 'up')}
                        className="p-2 hover:bg-[#F4F8FB] text-[#17354F] disabled:opacity-30 cursor-pointer"
                        title="تحريك لأعلى"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-[1px] h-4 bg-[#E2EAF0]" />
                      <button
                        type="button"
                        disabled={index === settings.sectionsOrder.length - 1}
                        onClick={() => moveSection(index, 'down')}
                        className="p-2 hover:bg-[#F4F8FB] text-[#17354F] disabled:opacity-30 cursor-pointer"
                        title="تحريك لأسفل"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleSection(secKey)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isEnabled
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {isEnabled ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          معروض
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          مخفي
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Hero Section & Doctor Profile */}
      {activeTab === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctor Photo & Identity Guard */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-4">
            <h3 className="font-bold text-[#17354F] text-base">صورة الدكتور الرسمية والشعار</h3>
            <p className="text-xs text-[#667788]">
              تطبيق معايير الدقة والأصالة: الحفاظ على ملامح الطبيب وشعار المركز بنسبة 100% دون أي تعديل أو تشويه.
            </p>

            <div className="space-y-2">
              <ImageUploadField
                label="صورة الطبيب المعتمدة في الواجهة الرئيسية"
                sublabel="رفع مباشر من جهازك أو اختيار من وسائط العيادة"
                value={settings.heroDoctorPhoto || PROTECTED_SUPABASE_DOCTOR_PHOTO}
                onChange={(url) => setSettings({ ...settings, heroDoctorPhoto: url })}
                category="طبيب"
                aspectRatio="portrait"
              />
            </div>

            <div className="pt-3 border-t border-[#F0F4F8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={PROTECTED_SUPABASE_CLINIC_LOGO} alt="Logo" className="w-10 h-10 object-contain rounded-lg border border-[#E2EAF0]" />
                <div>
                  <div className="text-xs font-bold text-[#17354F]">شعار المركز الطبي</div>
                  <div className="text-[10px] text-[#667788]">https://rmvhgoewsegyohdbsjsd.supabase.co/.../clinic-logo.jpg</div>
                </div>
              </div>
              <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-bold">
                أصلي 100%
              </span>
            </div>
          </div>

          {/* Hero Content Editor */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-4">
            <h3 className="font-bold text-[#17354F] text-base">بيانات الواجهة الرئيسية (Hero Section)</h3>

            <div>
              <label className="block text-xs font-bold text-[#17354F] mb-1">اسم الطبيب</label>
              <input
                type="text"
                value={doctor.name}
                onChange={(e) => setDoctor({ ...doctor, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E2EAF0] rounded-xl focus:outline-none focus:border-[#064B82]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17354F] mb-1">المسمى المهني والتخصصي</label>
              <input
                type="text"
                value={doctor.title}
                onChange={(e) => setDoctor({ ...doctor, title: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E2EAF0] rounded-xl focus:outline-none focus:border-[#064B82]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">سنوات الخبرة الطبية</label>
                <input
                  type="number"
                  value={doctor.experienceYears || 15}
                  onChange={(e) => setDoctor({ ...doctor, experienceYears: parseInt(e.target.value, 10) || 15 })}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E2EAF0] rounded-xl focus:outline-none focus:border-[#064B82]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">اسم الموقع العام</label>
                <input
                  type="text"
                  value={settings.siteName || 'عيادة الدكتور عبدالباسط مقبل'}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E2EAF0] rounded-xl focus:outline-none focus:border-[#064B82]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17354F] mb-1">النبذة التعريفية السريعة في الهيدر</label>
              <textarea
                rows={4}
                value={doctor.bio}
                onChange={(e) => setDoctor({ ...doctor, bio: e.target.value })}
                placeholder="استشاري متميز يقدم رعاية دقيقة مبنية على البراهين الطبية..."
                className="w-full px-3.5 py-2.5 text-sm border border-[#E2EAF0] rounded-xl focus:outline-none focus:border-[#064B82]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Banners Slider */}
      {activeTab === 'banners' && (
        <div className="bg-white rounded-2xl border border-[#E2EAF0] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#17354F] text-base">بانرات الصفحة الرئيسية</h3>
              <p className="text-xs text-[#667788] mt-1">
                إضافة سلايدات إعلانية أو توعوية تظهر في أعلى الصفحة الرئيسية
              </p>
            </div>
            <button
              type="button"
              onClick={addBanner}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إضافة بانر جديد
            </button>
          </div>

          <div className="space-y-4 mt-4">
            {settings.banners?.map((ban: any, idx: number) => (
              <div key={ban.id || idx} className="p-4 rounded-2xl border border-[#E2EAF0] bg-[#F9FBFC] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-[#064B82] flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-[#17354F]">بانر #{idx + 1}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-[#17354F] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ban.isActive !== false}
                        onChange={(e) => updateBanner(ban.id, 'isActive', e.target.checked)}
                        className="w-3.5 h-3.5 text-[#064B82] rounded"
                      />
                      تفعيل
                    </label>
                    <button
                      type="button"
                      onClick={() => removeBanner(ban.id)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="حذف البانر"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#17354F] mb-1">العنوان الرئيسي</label>
                    <input
                      type="text"
                      value={ban.title || ''}
                      onChange={(e) => updateBanner(ban.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E2EAF0] rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#17354F] mb-1">العنوان الفرعي / الشرح</label>
                    <input
                      type="text"
                      value={ban.subtitle || ''}
                      onChange={(e) => updateBanner(ban.id, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E2EAF0] rounded-xl bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ImageUploadField
                      label="صورة البانر"
                      sublabel="رفع مباشر من جهازك أو اختيار من الوسائط دون الحاجة لروابط"
                      value={ban.imageUrl || ''}
                      onChange={(url) => updateBanner(ban.id, 'imageUrl', url)}
                      onRemove={() => updateBanner(ban.id, 'imageUrl', '')}
                      category="عام"
                      aspectRatio="wide"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#17354F] mb-1">نص الزر</label>
                    <input
                      type="text"
                      value={ban.buttonText || 'احجز موعد'}
                      onChange={(e) => updateBanner(ban.id, 'buttonText', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E2EAF0] rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#17354F] mb-1">رابط الزر</label>
                    <input
                      type="text"
                      value={ban.buttonLink || '#booking'}
                      onChange={(e) => updateBanner(ban.id, 'buttonLink', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E2EAF0] rounded-xl bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: WhatsApp & Quick Direct Contact */}
      {activeTab === 'whatsapp' && (
        <div className="bg-white rounded-2xl border border-[#E2EAF0] p-6 shadow-sm space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-[#17354F] text-base">إعدادات المحادثة وحجز الواتساب التلقائي</h3>
          </div>
          <p className="text-xs text-[#667788]">
            عندما ينقر المريض على زر "احجز عبر الواتساب" أو أيقونة المراسلة المباشرة، سيتم توجيهه إلى هذا الرقم مع النص المجهز مسبقاً.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#17354F] mb-1">رقم الواتساب للعيادة (مع المفتاح أو محلياً)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#667788] absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="777554626 أو 967777554626"
                  value={settings.whatsappNumber || '777554626'}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  className="w-full pr-9 pl-3 py-2.5 text-sm border border-[#E2EAF0] rounded-xl font-mono focus:outline-none focus:border-[#064B82]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17354F] mb-1">رسالة الترحيب والطلب التلقائية</label>
              <textarea
                rows={3}
                value={settings.defaultWhatsAppText || 'مرحبًا د. عبدالباسط، أود الاستفسار وحجز موعد في العيادة.'}
                onChange={(e) => setSettings({ ...settings, defaultWhatsAppText: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E2EAF0] rounded-xl focus:outline-none focus:border-[#064B82]"
              />
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-xs font-bold text-emerald-800 mb-1">تجربة الرابط المباشر للواتساب:</div>
              <a
                href={`https://wa.me/${String(settings.whatsappNumber || '777554626').replace(/^0+/, '').replace(/^\+/, '').startsWith('967') ? settings.whatsappNumber : `967${settings.whatsappNumber}`}?text=${encodeURIComponent(settings.defaultWhatsAppText || '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-700 underline font-mono break-all inline-flex items-center gap-1"
              >
                انقر لاختبار الرابط المباشر
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={Boolean(imagePickerTarget)}
        onClose={() => setImagePickerTarget(null)}
        currentImageUrl={
          imagePickerTarget?.type === 'hero'
            ? settings.heroDoctorPhoto
            : imagePickerTarget?.bannerId
            ? settings.banners?.find((b: any) => b.id === imagePickerTarget.bannerId)?.imageUrl
            : ''
        }
        onSelectImage={(url) => {
          if (imagePickerTarget?.type === 'hero') {
            setSettings((prev: any) => ({ ...prev, heroDoctorPhoto: url }));
            showToast('info', 'تم اختيار وتطبيق صورة الدكتور الجديدة');
          } else if (imagePickerTarget?.type === 'banner' && imagePickerTarget.bannerId) {
            updateBanner(imagePickerTarget.bannerId, 'imageUrl', url);
            showToast('info', 'تم اختيار وتطبيق صورة البانر الجديدة');
          }
          setImagePickerTarget(null);
        }}
        title={
          imagePickerTarget?.type === 'hero'
            ? 'اختيار صورة الطبيب للواجهة الرئيسية'
            : 'اختيار صورة البانر الترويجي'
        }
      />
    </div>
  );
};
