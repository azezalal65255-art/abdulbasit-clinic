import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  PhoneCall,
  Save,
  MapPin,
  Mail,
  Share2,
  RefreshCw,
  ExternalLink,
  Eye,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Navigation,
} from 'lucide-react';
import { useAutoSaveForm } from '../../hooks/useAutoSaveForm';
import { AutoSaveBadge } from './AutoSaveBadge';

interface ContactSettingsViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const ContactSettingsView: React.FC<ContactSettingsViewProps> = ({ showToast }) => {
  const [contact, setContact] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'map'>('info');

  const fetchContact = async () => {
    try {
      const data = await api.getContact();
      // Ensure default values are populated if missing
      setContact({
        showMap: true,
        zoomLevel: 18,
        directionsBtnText: 'الحصول على الاتجاهات (خرائط جوجل)',
        latitude: '15.3361629',
        longitude: '44.2213114',
        ...data,
      });
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل بيانات التواصل والخريطة');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const { markSavedImmediately } = useAutoSaveForm({
    key: 'clinic-contact-v2',
    data: contact,
    isReady: !isLoading && contact !== null,
    onSave: async (updated) => {
      await api.updateContact(updated);
    },
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateContact(contact);
      markSavedImmediately(contact);
      showToast('success', 'تم حفظ وتحديث بيانات العيادة وإعدادات الخريطة التفاعلية بنجاح 100%');
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-[#667788]">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
        جاري تحميل البيانات والموقع الجغرافي...
      </div>
    );
  }

  // Generate dynamic embed preview URL
  let mapPreviewUrl = contact?.googleMapsEmbed;
  if (!mapPreviewUrl && contact?.latitude && contact?.longitude) {
    mapPreviewUrl = `https://maps.google.com/maps?q=${contact.latitude},${contact.longitude}&z=${contact.zoomLevel || 18}&output=embed`;
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 text-right" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">إدارة الخريطة وبيانات التواصل والموقع</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            التحكم الكامل في الخريطة التفاعلية، أرقام الهواتف، العناوين، وأزرار الاتجاهات في الموقع العام
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AutoSaveBadge />
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 py-2 px-5 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            حفظ وتحديث التغييرات
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="bg-white p-2 rounded-xl border border-[#E2EAF0] flex items-center gap-1 max-w-xs text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-center transition-all cursor-pointer ${
            activeTab === 'info' ? 'bg-[#064B82] text-white' : 'text-gray-500 hover:bg-slate-50'
          }`}
        >
          بيانات التواصل
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-center transition-all cursor-pointer ${
            activeTab === 'map' ? 'bg-[#064B82] text-white' : 'text-gray-500 hover:bg-slate-50'
          }`}
        >
          إعدادات الخريطة التفاعلية
        </button>
      </div>

      {activeTab === 'info' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Main Phones & Direct Contacts */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#17354F] flex items-center gap-2 border-b border-[#E2EAF0] pb-2">
              <PhoneCall className="w-4 h-4 text-[#064B82]" />
              أرقام العيادة والواتساب للاتصال المباشر
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#17354F] mb-1">رقم الهاتف الأول (الرئيسي)</label>
                <input
                  type="text"
                  required
                  value={contact?.phone1 || ''}
                  onChange={(e) => setContact({ ...contact, phone1: e.target.value })}
                  placeholder="777XXXXXX"
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#17354F] mb-1">رقم الهاتف الثاني (إضافي)</label>
                <input
                  type="text"
                  value={contact?.phone2 || ''}
                  onChange={(e) => setContact({ ...contact, phone2: e.target.value })}
                  placeholder="01XXXXXX"
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#17354F] mb-1">رقم الواتساب الرسمي (بدون مفتاح الدولة)</label>
              <input
                type="text"
                required
                value={contact?.whatsapp || ''}
                onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                placeholder="777XXXXXX"
                className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                dir="ltr"
              />
              <p className="text-[10px] text-gray-400 mt-1">يُربط مباشرة بكل أزرار الحجز عبر الواتساب في الموقع</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#17354F] mb-1">البريد الإلكتروني للعيادة</label>
              <input
                type="email"
                value={contact?.email || ''}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                placeholder="info@dr-abdulbasit.com"
                className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                dir="ltr"
              />
            </div>
          </div>

          {/* Social Platforms */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#17354F] flex items-center gap-2 border-b border-[#E2EAF0] pb-2">
              <Share2 className="w-4 h-4 text-[#064B82]" />
              حسابات ومنصات التواصل الاجتماعي
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#17354F] mb-1">فيسبوك (Facebook)</label>
                <input
                  type="url"
                  value={contact?.facebook || ''}
                  onChange={(e) => setContact({ ...contact, facebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#17354F] mb-1">إنستغرام (Instagram)</label>
                <input
                  type="url"
                  value={contact?.instagram || ''}
                  onChange={(e) => setContact({ ...contact, instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#17354F] mb-1">يوتيوب (YouTube)</label>
                <input
                  type="url"
                  value={contact?.youtube || ''}
                  onChange={(e) => setContact({ ...contact, youtube: e.target.value })}
                  placeholder="https://youtube.com/@..."
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#17354F] mb-1">تيك توك (TikTok)</label>
                <input
                  type="url"
                  value={contact?.tiktok || ''}
                  onChange={(e) => setContact({ ...contact, tiktok: e.target.value })}
                  placeholder="https://tiktok.com/@..."
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Controls Form - 5 cols */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-xs space-y-4 lg:col-span-5">
            <h3 className="text-xs font-bold text-[#17354F] flex items-center gap-2 border-b border-[#E2EAF0] pb-2">
              <Sliders className="w-4 h-4 text-[#064B82]" />
              لوحة تحكم الخريطة والإحداثيات
            </h3>

            {/* Show Map Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2EAF0]">
              <div>
                <span className="block text-xs font-bold text-[#17354F]">حالة ظهور الخريطة</span>
                <span className="text-[10px] text-gray-500">عرض أو إخفاء قسم خريطة العيادة في واجهة الموقع</span>
              </div>
              <button
                type="button"
                onClick={() => setContact({ ...contact, showMap: !contact.showMap })}
                className="text-[#064B82] focus:outline-none cursor-pointer"
              >
                {contact.showMap ? (
                  <ToggleRight className="w-10 h-10 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-400" />
                )}
              </button>
            </div>

            {/* Latitude & Longitude inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#17354F] mb-1">خط العرض (Latitude)</label>
                <input
                  type="text"
                  value={contact?.latitude || ''}
                  onChange={(e) => setContact({ ...contact, latitude: e.target.value, googleMapsEmbed: '' })}
                  placeholder="15.3361629"
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#17354F] mb-1">خط الطول (Longitude)</label>
                <input
                  type="text"
                  value={contact?.longitude || ''}
                  onChange={(e) => setContact({ ...contact, longitude: e.target.value, googleMapsEmbed: '' })}
                  placeholder="44.2213114"
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Zoom Level */}
            <div>
              <label className="block text-[11px] font-bold text-[#17354F] mb-1">مستوى التكبير (Zoom Level)</label>
              <select
                value={contact?.zoomLevel || 18}
                onChange={(e) => setContact({ ...contact, zoomLevel: Number(e.target.value), googleMapsEmbed: '' })}
                className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
              >
                {[14, 15, 16, 17, 18, 19, 20].map((z) => (
                  <option key={z} value={z}>
                    {z} ({z === 18 ? 'افتراضي' : z > 18 ? 'قريب جداً' : 'بعيد'})
                  </option>
                ))}
              </select>
            </div>

            {/* Google Maps link & Button text */}
            <div>
              <label className="block text-[11px] font-bold text-[#17354F] mb-1">رابط خرائط جوجل المباشر (Google Maps Url)</label>
              <input
                type="url"
                value={contact?.googleMapsUrl || ''}
                onChange={(e) => setContact({ ...contact, googleMapsUrl: e.target.value })}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#17354F] mb-1">اسم المبنى / المقر بالخريطة</label>
              <input
                type="text"
                value={contact?.building || ''}
                onChange={(e) => setContact({ ...contact, building: e.target.value })}
                placeholder="مركز المأمون الطبي التشخيصي"
                className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#17354F] mb-1">وصف تفصيلي للعنوان يظهر على الكارت</label>
              <textarea
                value={contact?.description || ''}
                onChange={(e) => setContact({ ...contact, description: e.target.value })}
                placeholder="صنعاء - شارع تعز (تقاطع شارع تعز) - جولة تعز..."
                className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs h-16"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#17354F] mb-1">نص زر "الحصول على الاتجاهات"</label>
              <input
                type="text"
                value={contact?.directionsBtnText || ''}
                onChange={(e) => setContact({ ...contact, directionsBtnText: e.target.value })}
                placeholder="فتح الموقع على خرائط جوجل"
                className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#17354F] mb-1">رابط التضمين المخصص Iframe (اختياري)</label>
              <input
                type="text"
                value={contact?.googleMapsEmbed || ''}
                onChange={(e) => setContact({ ...contact, googleMapsEmbed: e.target.value })}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                dir="ltr"
              />
              <p className="text-[10px] text-gray-400 mt-1">اتركه فارغاً ليقوم النظام بتوليد خريطة تلقائية بالاعتماد على خط الطول والعرض</p>
            </div>
          </div>

          {/* Interactive Map Live Preview - 7 cols */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-xs lg:col-span-7 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#17354F] flex items-center gap-2 border-b border-[#E2EAF0] pb-2 mb-3">
                <Eye className="w-4 h-4 text-emerald-600" />
                معاينة حية وتفاعلية للخريطة
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                هذه المعاينة توضح شكل الخريطة التي ستظهر لمرضى العيادة والزوار في الواجهة العامة مباشرة بعد الحفظ:
              </p>
            </div>

            {contact.showMap ? (
              <div className="flex-1 min-h-[350px] bg-slate-100 rounded-xl overflow-hidden relative border border-[#E2EAF0]">
                {mapPreviewUrl ? (
                  <iframe
                    title="Live Preview Map"
                    src={mapPreviewUrl}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 text-xs">
                    <MapPin className="w-10 h-10 text-slate-300 animate-bounce mb-2" />
                    يرجى إدخال إحداثيات صالحة لخط الطول والعرض أو رابط تضمين لعرض الخريطة التفاعلية
                  </div>
                )}

                {/* Overlaid location info card mockup */}
                <div className="absolute bottom-3 right-3 max-w-[260px] bg-white/95 backdrop-blur-md p-3 rounded-lg border border-[#BED8EA] shadow-md text-right z-10 hidden sm:block">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded bg-[#064B82] text-white flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#064B82] truncate">
                        {contact?.building || 'مركز المأمون الطبي التشخيصي'}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                        {contact?.description || 'صنعاء - شارع تعز'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 min-h-[350px] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs p-6 text-center">
                <MapPin className="w-10 h-10 text-slate-300 mb-2 opacity-50" />
                <span className="font-bold">الخريطة التفاعلية مخفية حالياً</span>
                <span className="text-[10px] mt-1 text-slate-400">قم بتفعيل "حالة ظهور الخريطة" بالأعلى لمشاهدة المعاينة الحية</span>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-[#E2EAF0] flex items-center justify-between text-[11px] text-[#667788]">
              <span>إحداثيات المقر: {contact?.latitude || 'لا توجد'}, {contact?.longitude || 'لا توجد'}</span>
              <a
                href={contact?.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#064B82] font-bold hover:underline flex items-center gap-1"
              >
                <Navigation className="w-3.5 h-3.5" />
                {contact?.directionsBtnText || 'فتح بخرائط جوجل'}
              </a>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
