import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ImageUploadField } from './ImageUploadField';
import { useClinicData } from '../../context/ClinicDataContext';
import {
  ImageIcon,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Layout,
  ExternalLink,
  ShieldCheck,
  Edit,
  FolderOpen,
} from 'lucide-react';

interface InterfaceImagesViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const InterfaceImagesView: React.FC<InterfaceImagesViewProps> = ({ showToast }) => {
  const { refreshContent } = useClinicData();
  const [activeTab, setActiveTab] = useState<'all' | 'sliders' | 'doctor' | 'services' | 'others'>('all');
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    placement: 'homepage', // sliders, doctor, services, homepage, custom
    buttonText: '',
    buttonLink: '',
    isActive: true,
    order: 1,
  });

  const fetchInterfaceImages = async () => {
    setIsLoading(true);
    try {
      // Build a comprehensive consolidated list of interface images from database components:
      // 1. sliders
      const sliderList = await api.getSliders().catch(() => []);
      // 2. doctor photo
      const docProfile = await api.getDoctorProfile().catch(() => null);
      // 3. services
      const servicesList = await api.getServices().catch(() => []);
      
      const consolidated: any[] = [];

      // Add sliders
      sliderList.forEach((s: any) => {
        consolidated.push({
          id: `slider-${s.id}`,
          originalId: s.id,
          title: s.title || 'شريحة سلايدر',
          description: s.subtitle || '',
          url: s.image || s.imageUrl,
          placement: 'sliders',
          order: s.order || 1,
          isActive: s.isActive !== false,
          source: 'sliders',
        });
      });

      // Add doctor profile photo
      if (docProfile && docProfile.photo) {
        consolidated.push({
          id: 'doctor-photo',
          originalId: 'doctor',
          title: 'صورة الطبيب الشخصية الرسمية',
          description: docProfile.title || 'استشاري أول الباطنة والجهاز الهضمي والكبد والمناظير',
          url: docProfile.photo,
          placement: 'doctor',
          order: 1,
          isActive: true,
          source: 'doctor',
        });
      }

      // Add services
      servicesList.forEach((ser: any) => {
        if (ser.image) {
          consolidated.push({
            id: `service-${ser.id}`,
            originalId: ser.id,
            title: ser.title || 'صورة الخدمة الطبية',
            description: ser.brief || '',
            url: ser.image,
            placement: 'services',
            order: ser.order || 1,
            isActive: ser.isActive !== false,
            source: 'services',
          });
        }
      });

      // Add custom UI images if defined
      const data = await api.getMedia({ status: 'active' }).catch(() => []);
      const customUiImages = data.filter((m: any) => m.category === 'واجهة' || m.category === 'شعار');
      customUiImages.forEach((c: any, index: number) => {
        consolidated.push({
          id: `custom-${c.id}`,
          originalId: c.id,
          title: c.title || c.name || 'صورة مخصصة بالواجهة',
          description: c.altText || '',
          url: c.url,
          placement: 'others',
          order: index + 10,
          isActive: c.status !== 'trash',
          source: 'custom',
        });
      });

      // Filter by tab
      let filtered = consolidated;
      if (activeTab === 'sliders') filtered = consolidated.filter((img) => img.placement === 'sliders');
      else if (activeTab === 'doctor') filtered = consolidated.filter((img) => img.placement === 'doctor');
      else if (activeTab === 'services') filtered = consolidated.filter((img) => img.placement === 'services');
      else if (activeTab === 'others') filtered = consolidated.filter((img) => img.placement === 'others');

      // Sort by placement then order
      filtered.sort((a, b) => a.order - b.order);

      setImages(filtered);
    } catch (err: any) {
      showToast('error', err.message || 'تعذر تحميل صور واجهة الموقع');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterfaceImages();
  }, [activeTab]);

  const handleEditClick = (img: any) => {
    setSelectedItem(img);
    setFormData({
      title: img.title || '',
      description: img.description || '',
      url: img.url || '',
      placement: img.placement || 'homepage',
      buttonText: img.buttonText || '',
      buttonLink: img.buttonLink || '',
      isActive: img.isActive !== false,
      order: img.order || 1,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) {
      showToast('error', 'يرجى اختيار أو رفع صورة صالحة أولاً');
      return;
    }

    setIsSaving(true);
    try {
      if (selectedItem) {
        // Save back to corresponding original source
        if (selectedItem.source === 'sliders') {
          await api.updateSlider(selectedItem.originalId, {
            title: formData.title,
            subtitle: formData.description,
            image: formData.url,
            isActive: formData.isActive,
            order: formData.order,
          });
        } else if (selectedItem.source === 'doctor') {
          const docProfile = await api.getDoctorProfile();
          await api.updateDoctorProfile({
            ...docProfile,
            photo: formData.url,
          });
        } else if (selectedItem.source === 'services') {
          const serviceItem = await api.getServices().then((res) => res.find((s: any) => s.id === selectedItem.originalId));
          if (serviceItem) {
            await api.updateService(selectedItem.originalId, {
              ...serviceItem,
              title: formData.title,
              brief: formData.description,
              image: formData.url,
              isActive: formData.isActive,
              order: formData.order,
            });
          }
        } else if (selectedItem.source === 'custom') {
          await api.updateMedia(selectedItem.originalId, {
            title: formData.title,
            altText: formData.description,
            url: formData.url,
            category: 'واجهة',
          });
        }

        showToast('success', 'تم حفظ وتحديث صورة واجهة الموقع بنجاح 100%');
        setIsModalOpen(false);
        await fetchInterfaceImages();
        await refreshContent();
      } else {
        // Create custom interface image
        await api.uploadMedia({
          title: formData.title,
          name: formData.title,
          url: formData.url,
          category: 'واجهة',
          altText: formData.description,
        });
        showToast('success', 'تمت إضافة الصورة المخصصة للواجهة بنجاح 100%');
        setIsModalOpen(false);
        await fetchInterfaceImages();
        await refreshContent();
      }
    } catch (err: any) {
      showToast('error', err.message || 'تعذر حفظ تحديثات الصورة');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (img: any) => {
    try {
      const nextActive = !img.isActive;
      if (img.source === 'sliders') {
        await api.updateSlider(img.originalId, { isActive: nextActive });
      } else if (img.source === 'services') {
        const serviceItem = await api.getServices().then((res) => res.find((s: any) => s.id === img.originalId));
        if (serviceItem) {
          await api.updateService(img.originalId, { ...serviceItem, isActive: nextActive });
        }
      } else if (img.source === 'custom') {
        await api.updateMedia(img.originalId, { status: nextActive ? 'active' : 'trash' });
      }
      showToast('success', nextActive ? 'تم تفعيل وعرض الصورة في الواجهة بنجاح' : 'تم إخفاء الصورة مؤقتاً من الواجهة');
      fetchInterfaceImages();
    } catch (err: any) {
      showToast('error', err.message || 'تعذر تغيير حالة ظهور الصورة');
    }
  };

  const handleMoveOrder = async (img: any, direction: 'up' | 'down') => {
    const nextOrder = direction === 'up' ? Math.max(1, img.order - 1) : img.order + 1;
    try {
      if (img.source === 'sliders') {
        await api.updateSlider(img.originalId, { order: nextOrder });
        showToast('success', 'تم تحديث ترتيب شرائح السلايدر بنجاح');
      } else if (img.source === 'services') {
        const serviceItem = await api.getServices().then((res) => res.find((s: any) => s.id === img.originalId));
        if (serviceItem) {
          await api.updateService(img.originalId, { ...serviceItem, order: nextOrder });
          showToast('success', 'تم تحديث ترتيب ظهور صور الخدمات بنجاح');
        }
      }
      fetchInterfaceImages();
    } catch (err: any) {
      showToast('error', err.message || 'تعذر تغيير الترتيب');
    }
  };

  const handleDeleteClick = async (img: any) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العنصر والصورة التابعة له نهائيًا من واجهة الموقع؟')) return;
    try {
      if (img.source === 'sliders') {
        await api.deleteSlider(img.originalId);
      } else if (img.source === 'services') {
        await api.deleteService(img.originalId);
      } else if (img.source === 'custom') {
        await api.deleteMedia(img.originalId, true, true);
      }
      showToast('success', 'تم حذف الصورة والعنصر بنجاح من التخزين الدائم');
      fetchInterfaceImages();
    } catch (err: any) {
      showToast('error', err.message || 'تعذر إتمام عملية الحذف');
    }
  };

  return (
    <div className="space-y-5 text-right" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">إدارة صور واجهة الموقع والبنرات</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            التحكم المطلق في جميع صور ومجسمات العيادة، صور السلايدر، صور الخدمات، وصور الطبيب الرسمية المعروضة
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedItem(null);
            setFormData({
              title: '',
              description: '',
              url: '',
              placement: 'others',
              buttonText: '',
              buttonLink: '',
              isActive: true,
              order: images.length + 1,
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 py-2 px-4 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          إضافة صورة واجهة جديدة
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="bg-white p-3 rounded-2xl border border-[#E2EAF0] shadow-xs flex flex-wrap items-center gap-1.5">
        {[
          { id: 'all', label: 'جميع صور الواجهة' },
          { id: 'sliders', label: 'السلايدر الرئيسي' },
          { id: 'doctor', label: 'صورة الطبيب الشخصية' },
          { id: 'services', label: 'صور الخدمات الطبية' },
          { id: 'others', label: 'صور مخصصة وشعارات' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#064B82] text-white shadow-xs'
                : 'text-[#667788] hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Images Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-[#667788]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
          جاري جلب صور الواجهة وتحليل مقاساتها...
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white p-12 text-center border border-[#E2EAF0] rounded-2xl text-[#667788]">
          <ImageIcon className="w-10 h-10 mx-auto text-[#064B82] mb-3 opacity-60" />
          <p className="font-bold text-sm">لا توجد صور واجهة في هذا التبويب</p>
          <p className="text-xs mt-1">يمكنك رفع وإضافة صورة جديدة لتظهر في هذا التصنيف</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {images.map((img) => (
            <div
              key={img.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs ${
                !img.isActive ? 'border-amber-200 bg-amber-50/10' : 'border-[#E2EAF0] hover:border-[#0B70B7]/30'
              }`}
            >
              {/* Media Preview Area */}
              <div className="aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center">
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Placement Tag & Status badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <span className="bg-[#064B82]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                    <Layout className="w-2.5 h-2.5" />
                    {img.placement === 'sliders'
                      ? 'شريحة سلايدر'
                      : img.placement === 'doctor'
                      ? 'صورة الطبيب'
                      : img.placement === 'services'
                      ? 'صورة خدمة'
                      : 'أخرى / شعار'}
                  </span>
                  {!img.isActive && (
                    <span className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                      <EyeOff className="w-2.5 h-2.5" />
                      مخفية مؤقتاً
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2 right-2">
                  <span className="bg-emerald-600/90 text-white text-[8px] font-bold px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    تخزين دائم وموثق
                  </span>
                </div>
              </div>

              {/* Data and Settings Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#17354F] line-clamp-1">{img.title}</h4>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 h-8 leading-relaxed">
                    {img.description || 'لا يوجد وصف مضاف لهذه الصورة'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2EAF0] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {img.source !== 'doctor' && (
                      <>
                        <button
                          onClick={() => handleMoveOrder(img, 'up')}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-gray-700 cursor-pointer"
                          title="نقل لأعلى"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(img, 'down')}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-gray-700 cursor-pointer"
                          title="نقل لأسفل"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] text-gray-400 font-mono font-bold px-1.5">
                          ترتيب: {img.order}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleActive(img)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        img.isActive
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                      }`}
                      title={img.isActive ? 'إخفاء مؤقت' : 'عرض وتفعيل'}
                    >
                      {img.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleEditClick(img)}
                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#064B82] cursor-pointer"
                      title="تعديل أو استبدال الصورة"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {img.source !== 'doctor' && (
                      <button
                        onClick={() => handleDeleteClick(img)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                        title="حذف نهائي"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF0] max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 text-right">
            <div className="flex items-center justify-between border-b border-[#E2EAF0] pb-3">
              <h3 className="text-sm font-bold text-[#064B82]">
                {selectedItem ? 'تعديل واستبدال صورة الواجهة' : 'إضافة صورة واجهة جديدة'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">عنوان الصورة / المسمى التعريفي *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: رعاية طبية تخصصية متميزة"
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">الوصف الفرعي / النص التوضيحي</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="نص توضيحي قصير يظهر بجوار أو أسفل الصورة"
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs h-20 resize-none"
                />
              </div>

              {!selectedItem && (
                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">موضع الظهور بالواجهة *</label>
                  <select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  >
                    <option value="others">صور مخصصة وشعارات</option>
                    <option value="sliders">شريحة سلايدر جديدة</option>
                  </select>
                </div>
              )}

              {/* Robust Upload Field component */}
              <ImageUploadField
                label="ملف الصورة الدائم"
                sublabel="ارفع الصورة مباشرة من جهازك للحفظ في التخزين الدائم (JPG, PNG, WebP)"
                value={formData.url}
                onChange={(url) => setFormData({ ...formData, url })}
                category={formData.placement}
              />

              <div className="pt-3 border-t border-[#E2EAF0] flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  إلغاء التعديل
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2 px-5 bg-[#064B82] hover:bg-[#0B70B7] text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  حفظ وتفعيل الصورة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
