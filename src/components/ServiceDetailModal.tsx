import React from 'react';
import {
  X,
  Calendar,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Sparkles,
  ClipboardList,
  ShieldAlert,
  Activity,
  Eye,
  UserCheck,
  ClipboardCheck,
  HeartHandshake,
} from 'lucide-react';
import { MedicalService } from '../types';
import { CLINIC_INFO } from '../data/clinicData';
import { soundManager } from '../utils/soundEffects';

interface ServiceDetailModalProps {
  service: MedicalService | null;
  onClose: () => void;
  onBookService: (serviceName: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onBookService,
}) => {
  if (!service) return null;

  const renderIcon = (name: string) => {
    switch (name) {
      case 'ShieldAlert':
        return <ShieldAlert className="w-6 h-6 text-[#0872B9]" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-[#2fa84f]" />;
      case 'Eye':
        return <Eye className="w-6 h-6 text-[#0872B9]" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-amber-500" />;
      case 'UserCheck':
        return <UserCheck className="w-6 h-6 text-[#2fa84f]" />;
      case 'ClipboardCheck':
        return <ClipboardCheck className="w-6 h-6 text-[#0872B9]" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-[#2fa84f]" />;
      default:
        return <Stethoscope className="w-6 h-6 text-[#0872B9]" />;
    }
  };

  const handleWhatsApp = () => {
    soundManager.playClickChime();
    const text = `السلام عليكم ورحمة الله، أود الاستفسار وحجز موعد لدى د. عبدالباسط عبده الحاج بخصوص خدمة: (${service.title})`;
    window.open(`https://wa.me/967${CLINIC_INFO.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 text-right flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-start justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div className="flex items-start gap-3 sm:gap-4 pr-1">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
              {renderIcon(service.iconName)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#0872B9]/10 text-[#0872B9] border border-[#0872B9]/20">
                  {service.categoryName}
                </span>
                {service.badge && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#2fa84f]/10 text-[#2fa84f] border border-[#2fa84f]/20">
                    {service.badge}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#0c3653] leading-snug">
                {service.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer active:scale-90 shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-[#334e68]">
          {/* Detailed Overview */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <h3 className="text-xs font-black text-[#0872B9] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4" />
              <span>نبذة عن الخدمة الطبية في العيادة</span>
            </h3>
            <p className="text-[#334e68] leading-relaxed text-sm">
              {service.detailedDescription}
            </p>
          </div>

          {/* Target Cases */}
          <div>
            <h3 className="text-sm font-bold text-[#0c3653] mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>الحالات والأعراض المستهدفة بالخدمة:</span>
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {service.targetCases.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200/90 text-[#17354F] leading-snug shadow-2xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#2fa84f] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Procedures */}
          <div>
            <h3 className="text-sm font-bold text-[#0c3653] mb-3 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#0872B9]" />
              <span>خطوات وإجراءات التشخيص والعلاج:</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {service.keyProcedures.map((proc, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs sm:text-sm text-[#0c3653] font-medium"
                >
                  <span className="w-5 h-5 rounded-full bg-[#0872B9]/15 text-[#0872B9] text-xs font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{proc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preparation Instruction (if any) */}
          {service.preparation && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-xs sm:text-sm text-amber-800 mb-1">
                  تعليمات التحضير قبل الزيارة أو الفحص:
                </strong>
                <p className="text-xs sm:text-sm leading-relaxed text-amber-700">
                  {service.preparation}
                </p>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div>
            <h3 className="text-sm font-bold text-[#0c3653] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2fa84f]" />
              <span>المميزات والنتائج المتوقعة:</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {service.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-900 text-xs font-semibold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2fa84f] shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              soundManager.playClickChime();
              onClose();
              onBookService(service.title);
            }}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-[#2fa84f] hover:bg-[#279144] text-white font-bold py-3 px-5 rounded-xl transition-all shadow-xs cursor-pointer text-sm active:scale-[0.99]"
          >
            <Calendar className="w-4 h-4" />
            <span>حجز موعد لهذه الخدمة</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 px-5 rounded-xl transition-all shadow-xs cursor-pointer text-sm active:scale-[0.99]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>استفسار واتساب</span>
          </button>
        </div>
      </div>
    </div>
  );
};
