import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Activity,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Stethoscope,
  HeartPulse,
  Flame,
  ShieldCheck,
  Microscope,
  Thermometer,
  Layers,
} from 'lucide-react';

interface ServicesViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

const AVAILABLE_ICONS = [
  'Activity',
  'Stethoscope',
  'Eye',
  'HeartPulse',
  'Flame',
  'ShieldCheck',
  'Microscope',
  'Thermometer',
  'Layers',
];

export const ServicesView: React.FC<ServicesViewProps> = ({ showToast }) => {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    iconName: 'Activity',
    featuresText: '',
    isActive: true,
  });

  const fetchServices = async () => {
    try {
      const data = await api.getServices();
      setServices(data || []);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل الخدمات الطبية');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openNewModal = () => {
    setSelectedService(null);
    setFormData({
      title: '',
      description: '',
      iconName: 'Activity',
      featuresText: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (s: any) => {
    setSelectedService(s);
    setFormData({
      title: s.title || '',
      description: s.description || '',
      iconName: s.iconName || 'Activity',
      featuresText: Array.isArray(s.features) ? s.features.join('\n') : '',
      isActive: s.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'عنوان الخدمة حقل مطلوب');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      iconName: formData.iconName,
      features: formData.featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
      isActive: formData.isActive,
    };

    try {
      if (selectedService) {
        await api.updateService(selectedService.id, payload);
        showToast('success', 'تم تعديل الخدمة بنجاح وانعكست على الموقع العام');
      } else {
        await api.createService(payload);
        showToast('success', 'تمت إضافة الخدمة الجديدة بنجاح');
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ الخدمة');
    }
  };

  const handleToggleActive = async (s: any) => {
    try {
      await api.updateService(s.id, { isActive: !s.isActive });
      showToast('success', s.isActive ? 'تم إخفاء الخدمة من الموقع' : 'تم تفعيل وظهور الخدمة');
      fetchServices();
    } catch (err: any) {
      showToast('error', err.message || 'فشل تغيير حالة الخدمة');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف خدمة: "${title}"؟ ستُنقل إلى سلة المحذوفات.`)) {
      return;
    }
    try {
      await api.deleteService(id);
      showToast('info', 'تم نقل الخدمة إلى سلة المحذوفات');
      fetchServices();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حذف الخدمة');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">إدارة الخدمات والتخصصات الطبية</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            تتحكم هذه القائمة بالبطاقات والخدمات المعروضة في قسم "الخدمات والتخصصات" بالموقع
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-1.5 py-2 px-4 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          إضافة خدمة طبية جديدة
        </button>
      </div>

      {/* Grid of Services */}
      {isLoading ? (
        <div className="p-12 text-center text-[#667788]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
          جاري تحميل الخدمات...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-sm flex flex-col justify-between ${
                s.isActive ? 'border-[#E2EAF0]' : 'border-gray-200 opacity-60 bg-gray-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#064B82] flex items-center justify-center font-bold">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(s)}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        s.isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title={s.isActive ? 'ظاهرة على الموقع (انقر للإخفاء)' : 'مخفية (انقر للإظهار)'}
                    >
                      {s.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{s.isActive ? 'نشطة' : 'معطلة'}</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#17354F]">{s.title}</h3>
                <p className="text-xs text-[#667788] mt-1.5 line-clamp-3 leading-relaxed">
                  {s.description}
                </p>

                {/* Features Bullets */}
                {s.features && s.features.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#E2EAF0]/60 space-y-1">
                    {s.features.slice(0, 3).map((f: string, idx: number) => (
                      <div key={idx} className="text-[11px] text-[#064B82] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-[#55A630] flex-shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                    {s.features.length > 3 && (
                      <span className="text-[10px] text-gray-400 block mt-1">
                        +{s.features.length - 3} مزايا إضافية
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-[#E2EAF0] flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(s)}
                  className="py-1.5 px-3 rounded-lg bg-blue-50 text-[#064B82] hover:bg-blue-100 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(s.id, s.title)}
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                  title="حذف الخدمة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Service */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF0] max-w-lg w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#E2EAF0] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#064B82]">
                {selectedService ? 'تعديل الخدمة الطبية' : 'إضافة خدمة طبية جديدة'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar text-right">
              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">عنوان الخدمة *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: مناظير الجهاز الهضمي المتقدمة"
                  className="w-full py-2.5 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">أيقونة الخدمة</label>
                <select
                  value={formData.iconName}
                  onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                >
                  {AVAILABLE_ICONS.map((ico) => (
                    <option key={ico} value={ico}>
                      {ico}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">الوصف العام للخدمة</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف تفصيلي يشرح الخدمة والإجراءات المتبعة..."
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-[#0B70B7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">
                  المزايا والنقاط الرئيسية (كل سطر يمثل نقطة):
                </label>
                <textarea
                  rows={4}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder="منظار معدة تشخيصي وعلاجي&#10;أخذ عينات واستئصال لحميات&#10;تحت إشراف استشاري متخصص"
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-[#0B70B7]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="srv_active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#064B82] focus:ring-[#064B82]"
                />
                <label htmlFor="srv_active" className="text-xs font-bold text-[#17354F] cursor-pointer">
                  تفعيل وظهور هذه الخدمة للزوار على الموقع الإلكتروني
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
                  className="py-2 px-5 rounded-xl bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold cursor-pointer"
                >
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
