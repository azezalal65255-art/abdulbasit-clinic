import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Activity,
  Eye,
  Sparkles,
  UserCheck,
  ClipboardCheck,
  HeartHandshake,
  Stethoscope,
  Search,
  ChevronLeft,
  Calendar,
  CheckCircle2,
  CheckCheck,
  Shield,
  Clock,
  Award,
} from 'lucide-react';
import { MedicalService } from '../types';
import { ALL_MEDICAL_SERVICES, MEDICAL_SERVICES_CATEGORIES } from '../data/medicalServicesData';
import { ServiceDetailModal } from './ServiceDetailModal';
import { soundManager } from '../utils/soundEffects';

interface MedicalServicesSectionProps {
  onServiceClick?: (serviceName: string) => void;
  onSelectService?: (service: MedicalService) => void;
}

export const MedicalServicesSection: React.FC<MedicalServicesSectionProps> = ({
  onServiceClick,
  onSelectService,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalService, setActiveModalService] = useState<MedicalService | null>(null);

  // Filtered services
  const filteredServices = useMemo(() => {
    return ALL_MEDICAL_SERVICES.filter((service) => {
      const matchesCategory =
        selectedCategory === 'all' || service.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.targetCases.some((c) =>
          c.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const renderIcon = (name: string, className = 'w-6 h-6') => {
    switch (name) {
      case 'ShieldAlert':
        return <ShieldAlert className={className} />;
      case 'Activity':
        return <Activity className={className} />;
      case 'Eye':
        return <Eye className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'UserCheck':
        return <UserCheck className={className} />;
      case 'ClipboardCheck':
        return <ClipboardCheck className={className} />;
      case 'HeartHandshake':
        return <HeartHandshake className={className} />;
      default:
        return <Stethoscope className={className} />;
    }
  };

  const handleCardClick = (service: MedicalService) => {
    soundManager.playClickChime();
    setActiveModalService(service);
  };

  const handleBookFromModal = (serviceName: string) => {
    if (onServiceClick) {
      onServiceClick(serviceName);
    }
  };

  return (
    <section
      id="medical-services"
      className="py-14 sm:py-20 bg-[#08324f] text-white relative overflow-hidden"
      dir="rtl"
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#2fa84f] text-xs font-bold mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>رعاية تخصصية بمعايير عالمية</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
            جميع الخدمات الطبية بالعيادة
          </h2>
          
          <div className="w-16 h-1.5 bg-[#2fa84f] rounded-full mx-auto mb-4" />

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            منظومة استشارية وطبية متكاملة تشمل تشخيص وعلاج أمراض الجهاز الهضمي، الكبد، البنكرياس، مناظير الفيديو المتطورة، والأمراض الباطنية المزمنة بدقة وخبرة استشارية عليا.
          </p>
        </div>

        {/* Search Bar & Stats */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن أي خدمة طبية، فحص، أو شكوى مرضية (مثل: منظار، جرثومة، كبد دهني، سكر...)"
              className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#2fa84f] focus:ring-2 focus:ring-[#2fa84f]/30 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-white/10 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                مسح
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none justify-start md:justify-center text-xs sm:text-sm">
          {MEDICAL_SERVICES_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundManager.playClickChime();
                  setSelectedCategory(cat.id);
                }}
                className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 select-none border ${
                  isActive
                    ? 'bg-[#2fa84f] text-white border-[#2fa84f] shadow-md scale-105'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-black/20 text-white' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Services Cards Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                onClick={() => handleCardClick(service)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#2fa84f]/60 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 group cursor-pointer active:scale-[0.99] shadow-lg hover:shadow-2xl hover:-translate-y-1"
              >
                <div>
                  {/* Top Row: Icon + Badges */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-13 h-13 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white group-hover:bg-[#2fa84f] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                      {renderIcon(service.iconName, 'w-6 h-6 text-white')}
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[11px] font-bold text-[#2fa84f] bg-[#2fa84f]/15 border border-[#2fa84f]/30 px-2.5 py-0.5 rounded-full">
                        {service.categoryName}
                      </span>
                      {service.badge && (
                        <span className="text-[10px] font-semibold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md">
                          {service.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Service Title */}
                  <h3 className="text-lg font-black text-white group-hover:text-[#2fa84f] transition-colors mb-2 leading-snug">
                    {service.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal mb-4 line-clamp-3">
                    {service.shortDescription}
                  </p>

                  {/* Target symptoms highlights */}
                  <div className="space-y-1.5 mb-5 pt-3 border-t border-white/10">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">
                      أبرز الحالات المشمولة:
                    </span>
                    {service.targetCases.slice(0, 2).map((target, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 text-xs text-slate-200"
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-[#2fa84f] shrink-0" />
                        <span className="truncate">{target}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2fa84f] group-hover:text-white transition-colors flex items-center gap-1">
                    <span>عرض التفاصيل الكاملة</span>
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundManager.playClickChime();
                      if (onSelectService) {
                        onSelectService(service);
                      } else if (onServiceClick) {
                        onServiceClick(service.title);
                      }
                    }}
                    className="py-1.5 px-3 rounded-lg bg-[#2fa84f] hover:bg-[#279144] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>حجز</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 max-w-lg mx-auto p-6">
            <Search className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-white mb-1">لم يتم العثور على نتائج</h3>
            <p className="text-xs text-slate-300 mb-4">
              لم نجد خدمة تطابق كلمة البحث "{searchQuery}". جرب البحث بكلمة أخرى أو اختر أحد الأقسام أعلاه.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="py-2 px-4 rounded-xl bg-[#2fa84f] text-white text-xs font-bold cursor-pointer hover:bg-[#279144]"
            >
              عرض جميع الخدمات
            </button>
          </div>
        )}

        {/* Quality & Trust Highlights Row */}
        <div className="mt-14 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <Award className="w-6 h-6 text-[#2fa84f] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white mb-1">استشاري معتمد</h4>
            <p className="text-[11px] text-slate-300">دكتوراه وبورد تخصصي دقيق</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <Eye className="w-6 h-6 text-[#0872B9] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white mb-1">مناظير فيديو عالية الدقة</h4>
            <p className="text-[11px] text-slate-300">أحدث التقنيات وبدون أي ألم</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <Shield className="w-6 h-6 text-[#2fa84f] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white mb-1">تعقيم عالمي صارم</h4>
            <p className="text-[11px] text-slate-300">أعلى معايير الأمان ومكافحة العدوى</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <Clock className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white mb-1">مواعيد صباحية ومسائية</h4>
            <p className="text-[11px] text-slate-300">حجز مسبق لتجنب الانتظار</p>
          </div>
        </div>

      </div>

      {/* Service Detail Interactive Modal */}
      <ServiceDetailModal
        service={activeModalService}
        onClose={() => setActiveModalService(null)}
        onBookService={(name) => {
          setActiveModalService(null);
          handleBookFromModal(name);
        }}
      />
    </section>
  );
};
